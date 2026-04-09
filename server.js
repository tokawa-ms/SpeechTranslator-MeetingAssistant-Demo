require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { DefaultAzureCredential } = require("@azure/identity");

const app = express();
const PORT = process.env.PORT || 3000;
const credential = new DefaultAzureCredential();

// --- 簡易認証 ---
const AUTH_ENABLED = !!(process.env.USER_NAME && process.env.USER_PASSWORD);
const activeSessions = new Set();

function parseCookies(req) {
  const cookies = {};
  const header = req.headers.cookie;
  if (header) {
    header.split(";").forEach((c) => {
      const [key, ...val] = c.split("=");
      cookies[key.trim()] = decodeURIComponent(val.join("="));
    });
  }
  return cookies;
}

function requireAuth(req, res, next) {
  if (!AUTH_ENABLED) return next();
  const cookies = parseCookies(req);
  if (cookies.session_token && activeSessions.has(cookies.session_token)) {
    return next();
  }
  return res.status(401).json({ error: "認証が必要です。" });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 認証チェック
app.get("/api/auth/check", (req, res) => {
  if (!AUTH_ENABLED) return res.json({ required: false });
  const cookies = parseCookies(req);
  const authenticated =
    !!(cookies.session_token && activeSessions.has(cookies.session_token));
  res.json({ required: true, authenticated });
});

// ログイン
app.post("/api/auth/login", (req, res) => {
  if (!AUTH_ENABLED) return res.json({ success: true });
  const { username, password } = req.body;
  if (
    username === process.env.USER_NAME &&
    password === process.env.USER_PASSWORD
  ) {
    const token = crypto.randomUUID();
    activeSessions.add(token);
    res.setHeader(
      "Set-Cookie",
      `session_token=${token}; HttpOnly; SameSite=Strict; Path=/`
    );
    return res.json({ success: true });
  }
  return res
    .status(401)
    .json({ error: "ユーザー名またはパスワードが正しくありません。" });
});

// トークン取得エンドポイント（DefaultAzureCredential で Entra ID トークンを取得）
app.get("/api/token", requireAuth, async (req, res) => {
  const speechEndpoint = process.env.SPEECH_ENDPOINT;

  if (!speechEndpoint) {
    return res
      .status(500)
      .json({ error: "SPEECH_ENDPOINT が設定されていません。" });
  }

  try {
    // 1. Entra ID トークンを取得
    const tokenResponse = await credential.getToken(
      "https://cognitiveservices.azure.com/.default"
    );

    // 2. STS エンドポイントで短い Speech トークンに交換
    const baseUrl = speechEndpoint.replace(/\/+$/, "");
    const stsUrl = `${baseUrl}/sts/v1.0/issueToken`;
    const response = await fetch(stsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error(`STS token request failed: ${response.status}`);
    }

    const token = await response.text();
    res.json({ token, endpoint: speechEndpoint });
  } catch (err) {
    console.error("トークン取得エラー:", err);
    res.status(500).json({ error: "トークンの取得に失敗しました。" });
  }
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});

// 要約エンドポイント（Azure OpenAI gpt-4.1-mini）
app.post("/api/summarize", requireAuth, async (req, res) => {
  const openaiEndpoint = process.env.OPENAI_ENDPOINT;
  const openaiDeployment = process.env.OPENAI_DEPLOYMENT || "gpt-4.1-mini";

  if (!openaiEndpoint) {
    return res
      .status(500)
      .json({ error: "OPENAI_ENDPOINT が設定されていません。" });
  }

  const { sentences, targetLanguage } = req.body;
  if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
    return res.status(400).json({ error: "sentences が必要です。" });
  }

  try {
    const tokenResponse = await credential.getToken(
      "https://cognitiveservices.azure.com/.default"
    );

    const baseUrl = openaiEndpoint.replace(/\/+$/, "");
    const url = `${baseUrl}/openai/deployments/${openaiDeployment}/chat/completions?api-version=2024-12-01-preview`;

    const numberedText = sentences
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");

    const systemPrompt = `You are a helpful assistant. Summarize the following transcript sentences concisely in ${targetLanguage}. The sentences are from a speech recognition session. Provide a clear, coherent summary that captures the key points.`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `以下の${sentences.length}文を要約してください:\n\n${numberedText}`,
          },
        ],
        max_completion_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenAI request failed: ${response.status} ${errText}`);
      console.error(`URL: ${url}`);
      throw new Error(`OpenAI request failed: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const summary =
      data.choices?.[0]?.message?.content || "要約を生成できませんでした。";

    res.json({ summary });
  } catch (err) {
    console.error("要約エラー:", err.message || err);
    res.status(500).json({ error: `要約の生成に失敗しました: ${err.message}` });
  }
});

// 発言アシストエンドポイント
app.post("/api/suggest", requireAuth, async (req, res) => {
  const openaiEndpoint = process.env.OPENAI_ENDPOINT;
  const openaiDeployment = process.env.OPENAI_DEPLOYMENT || "gpt-4.1-mini";

  if (!openaiEndpoint) {
    return res
      .status(500)
      .json({ error: "OPENAI_ENDPOINT が設定されていません。" });
  }

  const { userText, context, fromLanguage, toLanguage } = req.body;
  if (!userText) {
    return res.status(400).json({ error: "userText が必要です。" });
  }

  try {
    const tokenResponse = await credential.getToken(
      "https://cognitiveservices.azure.com/.default"
    );

    const baseUrl = openaiEndpoint.replace(/\/+$/, "");
    const url = `${baseUrl}/openai/deployments/${openaiDeployment}/chat/completions?api-version=2024-12-01-preview`;

    let contextBlock = "";
    if (context && context.length > 0) {
      const recent = context.slice(-30);
      contextBlock = `\n\nConversation context (recent sentences in ${fromLanguage}):\n${recent.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    }

    const systemPrompt = `You are a language assistant helping someone participate in a live conversation.
The conversation is in ${fromLanguage}.
The user wants to say something. They will provide their intent in ${toLanguage}.
Generate a natural, contextually appropriate sentence in ${fromLanguage} that the user can say.
Consider the conversation context to make the response relevant and natural.
Only output the suggested sentence in ${fromLanguage}. Do not add explanations.`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `I want to say: ${userText}${contextBlock}`,
          },
        ],
        max_completion_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenAI suggest failed: ${response.status} ${errText}`);
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = await response.json();
    const suggestion =
      data.choices?.[0]?.message?.content || "生成できませんでした。";

    res.json({ suggestion });
  } catch (err) {
    console.error("発言アシストエラー:", err.message || err);
    res.status(500).json({ error: `発言の生成に失敗しました: ${err.message}` });
  }
});

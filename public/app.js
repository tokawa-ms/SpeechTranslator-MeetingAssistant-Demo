// --- i18n ---
const i18n = {
  ja: {
    title: "AI 多言語会議アシスタント",
    subtitle: "Azure Speech Service を使用した音声テキスト翻訳デモ",
    loginUsername: "ユーザー名",
    loginPassword: "パスワード",
    loginBtn: "ログイン",
    loginFailed: "ログインに失敗しました。",
    loginNetworkError: "通信エラーが発生しました。",
    langSettings: "言語設定",
    fromLanguageLabel: "認識言語（話す言語）",
    toLanguageLabel: "翻訳先言語",
    saveBtn: "保存",
    startBtn: "翻訳開始",
    stopBtn: "翻訳停止",
    statusReady: "マイクボタンを押して開始してください",
    statusToken: "トークンを取得中...",
    statusListening: "音声を聞いています... 話してください",
    statusStopped: "停止しました",
    aiSummary: "AI 要約",
    summaryPlaceholder: "要約機能をオンにすると、10文ごとに直近50文の要約が表示されます。",
    summaryLoading: "要約を生成中...",
    summaryError: "要約の取得に失敗しました。",
    assistTitle: "発言アシスト",
    assistPlaceholder: "質問や意見を翻訳先言語で入力してください...",
    assistBtn: "発言を生成",
    assistLoading: "生成中...",
    assistError: "生成に失敗しました。",
    assistLabel: (lang) => `${lang} で言うと:`,
    recognizedTitle: "認識テキスト（原文）",
    translatedTitle: "翻訳テキスト",
    errorTokenFetch: "トークンの取得に失敗しました",
    downloadBtn: "履歴ダウンロード",
    downloadEmpty: "ダウンロードする履歴がありません。",
    mdTitle: "会議履歴",
    mdSummary: "要約",
    mdConversation: "会譱履歴",
    mdOriginal: "原文",
    mdTranslation: "翻訳",
    mdNoSummary: "要約はありません。",
    lang_en_US: "英語 (US)", lang_ja_JP: "日本語", lang_zh_CN: "中国語 (簡体)",
    lang_ko_KR: "韓国語", lang_fr_FR: "フランス語", lang_de_DE: "ドイツ語",
    lang_es_ES: "スペイン語", lang_pt_BR: "ポルトガル語 (ブラジル)",
    lang_it_IT: "イタリア語", lang_ru_RU: "ロシア語",
    lang_ja: "日本語", lang_en: "英語", lang_zh_Hans: "中国語 (簡体)",
    lang_ko: "韓国語", lang_fr: "フランス語", lang_de: "ドイツ語",
    lang_es: "スペイン語", lang_pt: "ポルトガル語",
    lang_it: "イタリア語", lang_ru: "ロシア語",
  },
  en: {
    title: "AI Multilingual Meeting Assistant",
    subtitle: "Speech-to-text translation demo using Azure Speech Service",
    loginUsername: "Username",
    loginPassword: "Password",
    loginBtn: "Log in",
    loginFailed: "Login failed.",
    loginNetworkError: "Network error occurred.",
    langSettings: "Language Settings",
    fromLanguageLabel: "Recognition language (spoken)",
    toLanguageLabel: "Target language",
    saveBtn: "Save",
    startBtn: "Start Translation",
    stopBtn: "Stop Translation",
    statusReady: "Press the button to start",
    statusToken: "Retrieving token...",
    statusListening: "Listening... Please speak",
    statusStopped: "Stopped",
    aiSummary: "AI Summary",
    summaryPlaceholder: "When enabled, a summary of the last 50 sentences is shown every 10 sentences.",
    summaryLoading: "Generating summary...",
    summaryError: "Failed to retrieve summary.",
    assistTitle: "Speech Assist",
    assistPlaceholder: "Type your question or opinion in the target language...",
    assistBtn: "Generate Speech",
    assistLoading: "Generating...",
    assistError: "Generation failed.",
    assistLabel: (lang) => `In ${lang}:`,
    recognizedTitle: "Recognized Text (Original)",
    translatedTitle: "Translated Text",
    errorTokenFetch: "Failed to retrieve token",
    downloadBtn: "Download History",
    downloadEmpty: "No history to download.",
    mdTitle: "Meeting History",
    mdSummary: "Summary",
    mdConversation: "Conversation History",
    mdOriginal: "Original",
    mdTranslation: "Translation",
    mdNoSummary: "No summary available.",
    lang_en_US: "English (US)", lang_ja_JP: "Japanese", lang_zh_CN: "Chinese (Simplified)",
    lang_ko_KR: "Korean", lang_fr_FR: "French", lang_de_DE: "German",
    lang_es_ES: "Spanish", lang_pt_BR: "Portuguese (Brazil)",
    lang_it_IT: "Italian", lang_ru_RU: "Russian",
    lang_ja: "Japanese", lang_en: "English", lang_zh_Hans: "Chinese (Simplified)",
    lang_ko: "Korean", lang_fr: "French", lang_de: "German",
    lang_es: "Spanish", lang_pt: "Portuguese",
    lang_it: "Italian", lang_ru: "Russian",
  },
};

let currentUILang = localStorage.getItem("uiLang") || "ja";

function t(key) {
  return i18n[currentUILang]?.[key] ?? i18n.ja[key] ?? key;
}

function applyI18n() {
  document.documentElement.lang = currentUILang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.placeholder = t(key);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) el.title = t(key);
  });
  // Update title tag
  document.title = t("title");
}

// --- 認証チェック ---
const loginOverlay = document.getElementById("loginOverlay");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

(async function checkAuth() {
  try {
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    if (data.required && !data.authenticated) {
      loginOverlay.classList.add("active");
    }
  } catch (_) {
    // 認証チェック失敗時はそのまま表示
  }
})();

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    const btn = loginForm.querySelector(".login-btn");
    btn.disabled = true;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loginOverlay.classList.remove("active");
      } else {
        loginError.textContent = data.error || t("loginFailed");
      }
    } catch (_) {
      loginError.textContent = t("loginNetworkError");
    } finally {
      btn.disabled = false;
    }
  });
}

let recognizer = null;
let isRecognizing = false;
let recognizedSentences = []; // 原文の文を蓄積（要約用、最大50件）
let allRecognizedSentences = []; // 全原文履歴
let allTranslatedSentences = []; // 全翻訳履歴
let sentenceCountSinceLastSummary = 0;

const startButton = document.getElementById("startButton");
const statusDiv = document.getElementById("status");
const recognizedTextDiv = document.getElementById("recognizedText");
const translatedTextDiv = document.getElementById("translatedText");
const interimRecognizedDiv = document.getElementById("interimRecognized");
const interimTranslatedDiv = document.getElementById("interimTranslated");
const fromLanguageSelect = document.getElementById("fromLanguage");
const toLanguageSelect = document.getElementById("toLanguage");
const summaryToggle = document.getElementById("summaryToggle");
const summaryContent = document.getElementById("summaryContent");
const assistInput = document.getElementById("assistInput");
const assistButton = document.getElementById("assistButton");
const assistOutput = document.getElementById("assistOutput");

// 設定モーダル関連
const settingsModal = document.getElementById("settingsModal");
const settingsButton = document.getElementById("settingsButton");
const settingsClose = document.getElementById("settingsClose");
const settingsSave = document.getElementById("settingsSave");
const languageBadges = document.getElementById("languageBadges");
const uiLangButton = document.getElementById("uiLangButton");

// UI 言語切り替え
uiLangButton.addEventListener("click", () => {
  currentUILang = currentUILang === "ja" ? "en" : "ja";
  localStorage.setItem("uiLang", currentUILang);
  applyI18n();
  // UI 言語変更時にデフォルト翻訳言語を設定（ユーザーがまだ変更していない場合）
  applyDefaultTranslationLanguages();
  updateLanguageBadges();
  // Update dynamic button text
  if (isRecognizing) {
    startButton.textContent = t("stopBtn");
  } else {
    startButton.textContent = t("startBtn");
  }
});

// UI 言語に応じたデフォルト翻訳言語を設定
function applyDefaultTranslationLanguages() {
  if (currentUILang === "ja") {
    fromLanguageSelect.value = "en-US";
    toLanguageSelect.value = "ja";
  } else {
    fromLanguageSelect.value = "ja-JP";
    toLanguageSelect.value = "en";
  }
  saveLanguageSettings();
}

// localStorage から言語設定を復元
function loadLanguageSettings() {
  const savedFrom = localStorage.getItem("fromLanguage");
  const savedTo = localStorage.getItem("toLanguage");
  if (savedFrom && savedTo) {
    fromLanguageSelect.value = savedFrom;
    toLanguageSelect.value = savedTo;
  } else {
    // UI 言語に応じたデフォルトを設定
    if (currentUILang === "ja") {
      fromLanguageSelect.value = "en-US";
      toLanguageSelect.value = "ja";
    } else {
      fromLanguageSelect.value = "ja-JP";
      toLanguageSelect.value = "en";
    }
  }
  updateLanguageBadges();
}

// localStorage に言語設定を保存
function saveLanguageSettings() {
  localStorage.setItem("fromLanguage", fromLanguageSelect.value);
  localStorage.setItem("toLanguage", toLanguageSelect.value);
  updateLanguageBadges();
}

// 言語バッジを更新
function updateLanguageBadges() {
  const fromText = fromLanguageSelect.options[fromLanguageSelect.selectedIndex].text;
  const toText = toLanguageSelect.options[toLanguageSelect.selectedIndex].text;
  languageBadges.innerHTML =
    `<span class="language-badge">${fromText}</span>` +
    `<span style="color:#999;font-size:0.85rem;">→</span>` +
    `<span class="language-badge">${toText}</span>`;
}

// モーダル開閉
settingsButton.addEventListener("click", () => {
  if (!isRecognizing) {
    settingsModal.classList.add("open");
  }
});
settingsClose.addEventListener("click", () => {
  settingsModal.classList.remove("open");
});
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove("open");
});
settingsSave.addEventListener("click", () => {
  saveLanguageSettings();
  settingsModal.classList.remove("open");
});

// 初期化
applyI18n();
loadLanguageSettings();

assistButton.addEventListener("click", () => {
  const text = assistInput.value.trim();
  if (text) requestAssist(text);
});

assistInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const text = assistInput.value.trim();
    if (text) requestAssist(text);
  }
});

startButton.addEventListener("click", () => {
  if (isRecognizing) {
    stopRecognition();
  } else {
    startRecognition();
  }
});

async function getToken() {
  const response = await fetch("/api/token");
  if (!response.ok) {
    throw new Error(t("errorTokenFetch"));
  }
  return response.json();
}

async function startRecognition() {
  try {
    statusDiv.textContent = t("statusToken");
    const { token, endpoint } = await getToken();
    console.log("[DEBUG] endpoint:", endpoint);
    console.log("[DEBUG] token length:", token?.length);

    const endpointUrl = endpoint.replace(/\/+$/, "");
    const speechTranslationConfig =
      SpeechSDK.SpeechTranslationConfig.fromEndpoint(
        new URL(endpointUrl),
      );
    speechTranslationConfig.authorizationToken = token;

    speechTranslationConfig.speechRecognitionLanguage =
      fromLanguageSelect.value;

    const targetLanguage = toLanguageSelect.value;
    speechTranslationConfig.addTargetLanguage(targetLanguage);

    console.log("[DEBUG] fromLanguage:", fromLanguageSelect.value);
    console.log("[DEBUG] toLanguage:", targetLanguage);

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    recognizer = new SpeechSDK.TranslationRecognizer(
      speechTranslationConfig,
      audioConfig
    );

    // 認識中（中間結果）
    recognizer.recognizing = (_sender, event) => {
      console.log("[DEBUG] recognizing event, reason:", event.result.reason);
      if (event.result.reason === SpeechSDK.ResultReason.TranslatingSpeech) {
        interimRecognizedDiv.textContent = event.result.text;
        interimTranslatedDiv.textContent =
          event.result.translations.get(targetLanguage) || "";
      }
    };

    // 認識確定
    recognizer.recognized = (_sender, event) => {
      console.log("[DEBUG] recognized event, reason:", event.result.reason, "text:", event.result.text);
      if (event.result.reason === SpeechSDK.ResultReason.TranslatedSpeech) {
        const recognized = event.result.text;
        const translated =
          event.result.translations.get(targetLanguage) || "";

        console.log("[DEBUG] recognized:", recognized, "translated:", translated);

        if (recognized) {
          appendResult(recognizedTextDiv, recognized);
          appendResult(translatedTextDiv, translated);

          // 全履歴を蓄積
          allRecognizedSentences.push(recognized);
          allTranslatedSentences.push(translated);

          // 要約用に原文を蓄積
          recognizedSentences.push(recognized);
          if (recognizedSentences.length > 50) {
            recognizedSentences = recognizedSentences.slice(-50);
          }
          sentenceCountSinceLastSummary++;

          // 10文ごとに要約をトリガー
          if (summaryToggle.checked && sentenceCountSinceLastSummary >= 10) {
            sentenceCountSinceLastSummary = 0;
            requestSummary();
          }
        }

        interimRecognizedDiv.textContent = "";
        interimTranslatedDiv.textContent = "";
      } else if (
        event.result.reason === SpeechSDK.ResultReason.NoMatch
      ) {
        console.log("[DEBUG] NoMatch event");
        interimRecognizedDiv.textContent = "";
        interimTranslatedDiv.textContent = "";
      }
    };

    recognizer.canceled = (_sender, event) => {
      console.error("[DEBUG] canceled event, reason:", event.reason, "errorCode:", event.errorCode, "errorDetails:", event.errorDetails);
      if (
        event.reason === SpeechSDK.CancellationReason.Error
      ) {
        statusDiv.textContent = `エラー: ${event.errorDetails}`;
        console.error("Translation canceled:", event.errorDetails);
      }
      stopRecognition();
    };

    recognizer.sessionStopped = () => {
      stopRecognition();
    };

    // 継続認識を開始
    recognizer.startContinuousRecognitionAsync(
      () => {
        isRecognizing = true;
        startButton.textContent = t("stopBtn");
        startButton.classList.add("active");
        statusDiv.textContent = t("statusListening");
      },
      (err) => {
        console.error("開始エラー:", err);
        statusDiv.textContent = `開始エラー: ${err}`;
      }
    );
  } catch (err) {
    console.error(err);
    statusDiv.textContent = `エラー: ${err.message}`;
  }
}

function stopRecognition() {
  if (recognizer) {
    recognizer.stopContinuousRecognitionAsync(
      () => {
        recognizer.close();
        recognizer = null;
      },
      (err) => {
        console.error("停止エラー:", err);
      }
    );
  }
  isRecognizing = false;
  startButton.textContent = t("startBtn");
  startButton.classList.remove("active");
  statusDiv.textContent = t("statusStopped");
  interimRecognizedDiv.textContent = "";
  interimTranslatedDiv.textContent = "";
}

function appendResult(container, text) {
  const p = document.createElement("p");
  p.textContent = text;
  container.prepend(p);
}

const languageNames = {
  en: "English",
  ja: "日本語",
  "zh-Hans": "中文",
  ko: "한국어",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  ru: "Русский",
};

let summaryRequestInFlight = false;

async function requestSummary() {
  if (summaryRequestInFlight) return;
  if (recognizedSentences.length === 0) return;

  summaryRequestInFlight = true;
  summaryContent.innerHTML =
    `<p class="summary-loading">${t("summaryLoading")}</p>`;

  const targetLang = toLanguageSelect.value;
  const langName = languageNames[targetLang] || targetLang;

  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sentences: recognizedSentences.slice(),
        targetLanguage: langName,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "要約の取得に失敗しました");
    }

    const data = await response.json();
    summaryContent.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = data.summary;
    summaryContent.appendChild(p);
  } catch (err) {
    console.error("要約エラー:", err);
    summaryContent.innerHTML =
      `<p class="summary-placeholder">${t("summaryError")}</p>`;
  } finally {
    summaryRequestInFlight = false;
  }
}

const fromLanguageNames = {
  "ja-JP": "日本語",
  "en-US": "English",
  "zh-CN": "中文",
  "ko-KR": "한국어",
  "fr-FR": "Français",
  "de-DE": "Deutsch",
  "es-ES": "Español",
  "pt-BR": "Português",
  "it-IT": "Italiano",
  "ru-RU": "Русский",
};

let assistRequestInFlight = false;

async function requestAssist(userText) {
  if (assistRequestInFlight) return;
  assistRequestInFlight = true;
  assistOutput.innerHTML = `<p class="summary-loading">${t("assistLoading")}</p>`;

  const fromLang = fromLanguageSelect.value;
  const fromLangName = fromLanguageNames[fromLang] || fromLang;
  const toLang = toLanguageSelect.value;
  const toLangName = languageNames[toLang] || toLang;

  try {
    const response = await fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userText,
        context: recognizedSentences.slice(),
        fromLanguage: fromLangName,
        toLanguage: toLangName,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "生成に失敗しました");
    }

    const data = await response.json();
    assistOutput.innerHTML = "";
    const label = document.createElement("div");
    label.className = "assist-label";
    label.textContent = t("assistLabel")(fromLangName);
    assistOutput.appendChild(label);
    const p = document.createElement("p");
    p.textContent = data.suggestion;
    assistOutput.appendChild(p);
  } catch (err) {
    console.error("発言アシストエラー:", err);
    assistOutput.innerHTML = `<p class="summary-placeholder">${t("assistError")}</p>`;
  } finally {
    assistRequestInFlight = false;
  }
}

// --- 履歴ダウンロード ---
const downloadButton = document.getElementById("downloadButton");

downloadButton.addEventListener("click", () => {
  if (allRecognizedSentences.length === 0) {
    alert(t("downloadEmpty"));
    return;
  }

  const now = new Date();
  const timestamp = now.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const fileTimestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);

  const fromText = fromLanguageSelect.options[fromLanguageSelect.selectedIndex].text;
  const toText = toLanguageSelect.options[toLanguageSelect.selectedIndex].text;

  // サマリーテキスト取得
  const summaryEl = summaryContent.querySelector("p:not(.summary-placeholder):not(.summary-loading)");
  const summaryText = summaryEl ? summaryEl.textContent.trim() : "";

  let md = `# ${t("mdTitle")}\n\n`;
  md += `- **${timestamp}**\n`;
  md += `- ${fromText} → ${toText}\n`;
  md += `- ${allRecognizedSentences.length} sentences\n\n`;

  md += `---\n\n`;
  md += `## ${t("mdSummary")}\n\n`;
  md += summaryText ? summaryText + "\n\n" : `*${t("mdNoSummary")}*\n\n`;

  md += `---\n\n`;
  md += `## ${t("mdConversation")}\n\n`;
  md += `| # | ${t("mdOriginal")} | ${t("mdTranslation")} |\n`;
  md += `|---|---|---|\n`;

  for (let i = 0; i < allRecognizedSentences.length; i++) {
    const orig = allRecognizedSentences[i].replace(/\|/g, "\\|");
    const trans = (allTranslatedSentences[i] || "").replace(/\|/g, "\\|");
    md += `| ${i + 1} | ${orig} | ${trans} |\n`;
  }

  const blob = new Blob([md], { type: "text/markdown; charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meeting-history-${fileTimestamp}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  historyDownloaded = true;
});

// --- ページ離脱時の確認ダイアログ ---
let historyDownloaded = false;

window.addEventListener("beforeunload", (e) => {
  if (allRecognizedSentences.length > 0 && !historyDownloaded) {
    e.preventDefault();
  }
});

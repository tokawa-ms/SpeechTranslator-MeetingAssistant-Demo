# Simple Speech Translator Demo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green?logo=node.js)](https://nodejs.org/)
[![Azure Speech](https://img.shields.io/badge/Azure-Speech%20Service-0078D4?logo=microsoft-azure)](https://learn.microsoft.com/azure/ai-services/speech-service/)
[![Azure OpenAI](https://img.shields.io/badge/Azure-OpenAI%20Service-0078D4?logo=microsoft-azure)](https://learn.microsoft.com/azure/ai-services/openai/)

🇺🇸 [English README is here](README-en.md)

Azure Speech Service を使ったリアルタイム音声テキスト翻訳 Web アプリケーションです。

## 特徴

- 🎙️ リアルタイム音声認識 & 翻訳
- 🌍 多言語対応（Azure Speech Service がサポートする言語）
- 🔐 Entra ID (Azure AD) 認証によるセキュアなトークン管理
- 🤖 Azure OpenAI による高品質な翻訳

## 必要なもの

- Node.js (v18 以上)
- Azure Speech Service のリソース
- Azure OpenAI Service のリソース
- 上記リソースに対する `Cognitive Services User` ロールの割り当て（Entra ID 認証）

## クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/tokawa-ms/Simple-SpeechTranslator-Demo.git
cd Simple-SpeechTranslator-Demo

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env を編集して Azure リソースの情報を入力
```

`.env` の設定例:

```
SPEECH_ENDPOINT=https://<your-resource-name>.cognitiveservices.azure.com/
OPENAI_ENDPOINT=https://<your-resource-name>.openai.azure.com/
OPENAI_DEPLOYMENT=gpt-4.1-mini
```

サーバーを起動:

```bash
npm start
```

ブラウザで http://localhost:3000 を開く

## 使い方

1. 認識言語（話す言語）と翻訳先言語を選択
2. 「翻訳開始」ボタンをクリック（マイクへのアクセス許可が求められます）
3. マイクに向かって話すと、リアルタイムで認識テキストと翻訳テキストが表示されます
4. 「翻訳停止」ボタンをクリックして停止

## プロジェクト構成

```
Simple-SpeechTranslator-Demo/
├── server.js          # Express サーバー（トークン取得 API）
├── public/
│   ├── index.html     # フロントエンド UI
│   ├── app.js         # Speech SDK による翻訳ロジック
│   └── style.css      # スタイルシート
├── package.json
└── .env.example
```

## 注意事項

- ブラウザのマイクアクセス許可が必要です（HTTPS または localhost）
- API キーはサーバー側でトークンに変換されるため、クライアントに直接公開されません

## Contributing

Issue や Pull Request は大歓迎です。バグ報告や機能提案は [Issues](https://github.com/<your-username>/Simple-SpeechTranslator-Demo/issues) からお願いします。

## License

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

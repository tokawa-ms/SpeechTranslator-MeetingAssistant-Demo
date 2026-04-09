# Simple Speech Translator Demo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green?logo=node.js)](https://nodejs.org/)
[![Azure Speech](https://img.shields.io/badge/Azure-Speech%20Service-0078D4?logo=microsoft-azure)](https://learn.microsoft.com/azure/ai-services/speech-service/)
[![Azure OpenAI](https://img.shields.io/badge/Azure-OpenAI%20Service-0078D4?logo=microsoft-azure)](https://learn.microsoft.com/azure/ai-services/openai/)

🇯🇵 [日本語版 README はこちら](README.md)

A real-time speech-to-text translation web application powered by Azure Speech Service.

## Features

- 🎙️ Real-time speech recognition & translation
- 🌍 Multi-language support (all languages supported by Azure Speech Service)
- 🔐 Secure token management via Entra ID (Azure AD) authentication
- 🤖 High-quality translation powered by Azure OpenAI

## Prerequisites

- Node.js (v18 or later)
- Azure Speech Service resource
- Azure OpenAI Service resource
- `Cognitive Services User` role assignment on the above resources (for Entra ID authentication)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/tokawa-ms/Simple-SpeechTranslator-Demo.git
cd Simple-SpeechTranslator-Demo

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your Azure resource information
```

Example `.env` configuration:

```
SPEECH_ENDPOINT=https://<your-resource-name>.cognitiveservices.azure.com/
OPENAI_ENDPOINT=https://<your-resource-name>.openai.azure.com/
OPENAI_DEPLOYMENT=gpt-4.1-mini
```

Start the server:

```bash
npm start
```

Open http://localhost:3000 in your browser.

## Usage

1. Select the recognition language (the language you will speak) and the target translation language.
2. Click the **Start Translation** button (you will be prompted to allow microphone access).
3. Speak into the microphone — recognized text and its translation will appear in real time.
4. Click the **Stop Translation** button to stop.

## Project Structure

```
Simple-SpeechTranslator-Demo/
├── server.js          # Express server (token retrieval API)
├── public/
│   ├── index.html     # Frontend UI
│   ├── app.js         # Translation logic using Speech SDK
│   └── style.css      # Stylesheet
├── package.json
└── .env.example
```

## Notes

- Microphone access in the browser is required (HTTPS or localhost).
- API keys are converted to tokens on the server side and are never exposed directly to the client.

## Contributing

Issues and pull requests are welcome! Please report bugs or suggest features via [Issues](https://github.com/<your-username>/Simple-SpeechTranslator-Demo/issues).

## License

This project is released under the [MIT License](LICENSE).

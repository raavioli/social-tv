# 📺 AI TV News

> Your personal AI-powered TV news channel — mobile first, generative visuals, voiced by your chosen host.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![CI](https://github.com/your-org/ai-tv-news/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/ai-tv-news/actions)

---

## ✨ Features

- **Personal channel lineup** — pick topics: Tech, Finance, Space, Reddit & more
- **AI-generated visuals** — DALL-E 3 creates a unique image for every story
- **AI host narration** — ElevenLabs voices your chosen host (Alex, Maya, Jay, Sam)
- **Daily morning show** — auto-generated briefing every morning
- **Save & follow up** — bookmark stories, set reminders, create tasks
- **Swipeable TV cards** — scroll through stories like a TV remote
- **Push notifications** — morning alert when your show is ready
- **100% portable** — Docker Compose backend, Expo mobile app

---

## 🏗 Architecture

```
ai-tv-news/
├── apps/
│   ├── mobile/        # Expo React Native (iOS + Android)
│   └── api/           # Fastify API server (Node.js + TypeScript)
├── packages/
│   └── shared/        # Shared TypeScript types
├── .github/workflows/ # CI/CD (GitHub Actions)
└── docker-compose.yml # Postgres + Redis + API
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Yarn 1.22+
- Docker + Docker Compose
- [Expo Go](https://expo.dev/go) app on your phone

### 1. Clone & install

```bash
git clone https://github.com/your-org/ai-tv-news.git
cd ai-tv-news
yarn install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — all API keys are optional for demo mode
```

### 3. Start the backend

```bash
docker compose up -d
```

### 4. Start the mobile app

```bash
yarn mobile
# Scan the QR code with Expo Go on your phone
```

---

## 🔑 Free API Keys

All services have generous free tiers. None are required for demo mode.

| Service | Free Tier | Sign Up |
|---|---|---|
| NewsAPI | 100 req/day | [newsapi.org/register](https://newsapi.org/register) |
| OpenAI | $5 credits | [platform.openai.com](https://platform.openai.com/signup) |
| ElevenLabs | 10k chars/mo | [elevenlabs.io](https://elevenlabs.io/sign-up) |
| Reddit | Public feeds (no key) | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) |

---

## 🐳 Docker

```bash
# Start all services
docker compose up -d

# Stop
docker compose down

# Reset data
docker compose down -v
```

---

## 📱 Deployment

### Mobile — Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### API — Docker (any cloud)

The API Docker image is built and pushed to GitHub Container Registry on every merge to `main`.

```bash
docker pull ghcr.io/your-org/ai-tv-news/api:latest
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.

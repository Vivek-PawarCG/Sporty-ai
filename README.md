# ⚡ Sporty-AI — Intelligent Stadium Experience Platform

> AI-powered real-time venue management for large-scale sporting events. Built with Google Gemini, Vertex AI, and 9 Google Cloud services.

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Run-4285F4?logo=googlecloud)](https://cloud.google.com/run)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-00e676?logo=google)](https://ai.google.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)

---

## 🎯 Chosen Vertical

**Physical Event Experience** — Design a solution that improves the physical event experience for attendees at large-scale sporting venues. The system addresses crowd movement, waiting times, and real-time coordination while ensuring a seamless and enjoyable experience.

---

## 🧠 Approach & Logic

### Problem Analysis

Large-scale sporting venues (50,000–100,000+ capacity) face three core challenges:

1. **Crowd Congestion** — Certain sections, gates, and facilities become dangerously overcrowded while others remain underutilized
2. **Long Wait Times** — Concessions, restrooms, and entry gates create frustrating queues that degrade the fan experience
3. **Coordination Gaps** — Staff, signage, and venue systems operate in silos with no intelligent orchestration

### Our Solution

**Sporty-AI** is a Gen AI-powered platform that acts as a real-time intelligent layer across the entire venue:

```
Fan asks question → Gemini AI Concierge → Context-aware response in <1s
CCTV feeds → Vertex AI Vision → Crowd density heatmap → Auto-rerouting
Historical data → BigQuery + ML → Predictive wait times → Proactive alerts
Anomaly detected → Gemini Multimodal → Safety response plan → Staff dispatch
```

### Decision-Making Logic

The AI makes decisions based on a **multi-signal approach**:

| Signal | Source | Decision |
|--------|--------|----------|
| Crowd density > 80% | Vertex AI Vision (CCTV) | Redirect attendees, deploy security |
| Wait time > 15 min | Sensor data + ML prediction | Send push notification with alternatives |
| Gate capacity full | Ticketing + sensors | Open additional gates, stagger entry |
| Anomaly detected | Video + audio analysis | Generate response plan, alert staff |
| User query | Chat interface | Context-aware answer with real-time data |

---

## 🏗️ How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Google Cloud Run                   │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │           Node.js + Express Server             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │ Helmet   │  │ CORS     │  │ Rate Limit  │  │  │
│  │  │ HPP      │  │ Morgan   │  │ Compression │  │  │
│  │  └──────────┘  └──────────┘  └─────────────┘  │  │
│  │                                                │  │
│  │  API Routes:                                   │  │
│  │  POST /api/chat     → Gemini streaming         │  │
│  │  POST /api/predict  → Vertex AI forecast       │  │
│  │  GET  /api/alerts   → Safety alert feed        │  │
│  │  GET  /api/crowd    → BigQuery + live sensors  │  │
│  │  GET  /api/health   → Health check             │  │
│  │                                                │  │
│  │  Static: React (Vite) → /client/dist           │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Features

| Feature | Description | Google Service |
|---------|-------------|----------------|
| **AI Concierge** | Chat with Gemini for directions, food, wait times | Gemini 2.5 Flash Lite Flash |
| **Crowd Flow** | Real-time density heatmap with auto-rerouting | Vertex AI Vision |
| **Wait Times** | Predictive queue forecasting | Vertex AI Forecast |
| **Smart Entry** | AI-orchestrated gate management | Gemini Agents |
| **F&B Orders** | Personalized food recommendations | Gemma 3 On-Device |
| **Safety** | Anomaly detection & incident response | Gemini Multimodal |

---

## 🔗 Google Services Used (9 Services)

| # | Service | Package | Purpose |
|---|---------|---------|---------|
| 1 | **Gemini 2.5 Flash Lite Flash** | `@google/generative-ai` | AI Concierge chat with streaming responses |
| 2 | **Vertex AI** | `@google-cloud/vertexai` | Predictive crowd density forecasting |
| 3 | **BigQuery** | `@google-cloud/bigquery` | Historical crowd analytics and pattern queries |
| 4 | **Cloud Logging** | `@google-cloud/logging` | Structured application and request logging |
| 5 | **Secret Manager** | `@google-cloud/secret-manager` | Secure API key and credential storage |
| 6 | **GCP Monitoring** | `@google-cloud/monitoring` | Custom metrics (latency, active users) |
| 7 | **Firebase Auth** | `firebase-admin` | Google Sign-In user authentication |
| 8 | **Firestore** | `firebase-admin/firestore` | Real-time crowd data and alert persistence |
| 9 | **Google Fonts** | CSS import | Orbitron + DM Sans typography |

---

## 🔒 Security Implementation

| Layer | Implementation |
|-------|----------------|
| **HTTP Headers** | Helmet.js (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) |
| **CORS** | Whitelist-based origin validation |
| **Rate Limiting** | 100 req/15min global, 10 req/min for AI chat |
| **Input Validation** | express-validator, HTML tag stripping, 500-char limit |
| **Parameter Pollution** | HPP middleware |
| **Secret Management** | GCP Secret Manager with in-memory caching |
| **API Key Security** | Server-side only, never exposed to client |
| **Container Security** | Non-root user in Docker, slim base image |
| **Body Limits** | 10KB max request body size |

---

## 📋 Assumptions

1. **Simulated Sensor Data** — CCTV feeds and IoT crowd sensors are simulated with realistic dynamic data patterns. In production, these would connect to actual camera feeds via Vertex AI Vision API.
2. **Demo Venue** — Uses Melbourne Cricket Ground (MCG) as the reference venue with 100,024 capacity. The system is venue-agnostic and configurable.
3. **Attendee Devices** — Assumes attendees have smartphones to access the PWA interface.
4. **Network** — Assumes stable internet connectivity within the venue (via venue WiFi/cellular).
5. **Authentication** — Firebase Auth with Google Sign-In for demo. Production would integrate with ticketing systems.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 22+ 
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/sporty-ai.git
cd sporty-ai

# 2. Create environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# 4. Run development mode
npm run dev
# Server: http://localhost:8080
# Client: http://localhost:5173 (with proxy to server)
```

### Production Build

```bash
# Build frontend
cd client && npm run build && cd ..

# Start server (serves built frontend)
cd server && node index.js
# Open http://localhost:8080
```

---

## ☁️ Cloud Run Deployment

```bash
# Build and deploy to Cloud Run
gcloud run deploy sporty-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

---

## 🧪 Testing

```bash
# Unit tests
npm test

# API integration tests (server must be running)
TEST_URL=http://localhost:8080 npx jest __tests__/routes.test.js
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Frontend** | React 19, Vite 6 |
| **AI/ML** | Gemini 2.5 Flash Lite Flash, Vertex AI |
| **Database** | Firestore, BigQuery |
| **Auth** | Firebase Authentication |
| **Security** | Helmet, CORS, Rate Limiting, HPP, Secret Manager |
| **Monitoring** | Cloud Logging, GCP Monitoring |
| **Deployment** | Google Cloud Run, Docker |
| **Icons** | Lucide React (SVG) |
| **Fonts** | Orbitron, DM Sans (Google Fonts) |

---

## 📁 Project Structure

```
sporty-ai/
├── server/                # Express.js backend
│   ├── index.js           # App entry point
│   ├── middleware/         # Security & logging
│   ├── routes/            # API endpoints
│   ├── services/          # Google Cloud clients
│   └── package.json
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Constants & utilities
│   │   ├── App.jsx        # Root component
│   │   └── App.css        # Design system
│   └── package.json
├── __tests__/             # Jest test suites
├── Dockerfile             # Cloud Run container
├── .env.example           # Environment template
└── README.md              # This file
```

---

## 📜 License

MIT — Built for **Google Antigravity PromptWars 2026**

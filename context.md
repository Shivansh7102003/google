# Analyst's Dugout — Project Context

## What We're Building

An AI-powered cricket second-screen experience for the **Google Agentic Premier League Hackathon**. An autonomous agent watches ball-by-ball live data, detects tactically significant moments, and generates Gemini-powered insight cards — no user input needed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Live data | CricketData.org ball-by-ball API (3s poll) |
| AI | Gemini 1.5 Flash (`@google/generative-ai`) |
| Database | Firebase Firestore (insight cards) + Realtime DB (live score) |
| Push | Firebase Cloud Messaging (FCM) |
| Backend | Node.js on Cloud Run (`asia-south1`) |
| Frontend | React + Vite PWA |
| Container | Docker + Nginx (frontend) |

## Repository Structure

```
analysts-dugout/
├── agent/               # Cloud Run backend (Node.js)
│   ├── index.js         # Entry point — infinite poll loop
│   ├── poller.js        # CricketData.org fetch + normalise + RTDB write
│   ├── eventDetector.js # 9-trigger state comparison
│   ├── relevanceFilter.js # Cooldown logic
│   ├── gemini.js        # Gemini prompt + call
│   ├── firebase.js      # Admin SDK init
│   ├── writer.js        # Firestore + FCM + RTDB write flow
│   ├── Dockerfile
│   └── .env.example
├── frontend/            # React Vite PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── MatchHeader.jsx
│   │   │   ├── InsightFeed.jsx
│   │   │   ├── InsightCard.jsx
│   │   │   └── KnowledgeToggle.jsx
│   │   ├── firebase.js
│   │   ├── fcm.js
│   │   └── index.css
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── Dockerfile
│   └── nginx.conf
├── .planning/           # GSD planning docs
├── implementation.md    # Original implementation plan
└── .env                 # Never committed
```

## Agentic Loop

```
CricketData.org API  →  Poller (3s)  →  Event Detector
                                               ↓
                                      Relevance Filter
                                               ↓
                                       Gemini 1.5 Flash
                                               ↓
                                   Firestore + FCM + RTDB
                                               ↓
                                     React PWA (fan screen)
```

## Trigger Priority Table

| Priority | Trigger | Condition |
|----------|---------|-----------|
| 1 | Wicket | Wicket count increased |
| 1 | Powerplay end | Over 5→6 |
| 2 | Bowling change | Bowler name changed |
| 2 | Death overs start | Over 15→16 |
| 3 | New batter | Striker name changed |
| 3 | 100 partnership | Partnership ≥ 100 |
| 4 | Six hit | Last ball = 6 runs |
| 4 | 50 partnership | Partnership ≥ 50 |
| 5 | New over | Ball number reset to 0 |

## Cooldown Rules

- **Global:** 12 seconds between any cards
- **Per-trigger:** Wicket 5s · Bowling change 20s · New over 45s

## Environment Variables

| Variable | Source |
|---------|--------|
| `CRICKET_API_KEY` | CricketData.org dashboard |
| `GEMINI_API_KEY` | Google AI Studio |
| `MATCH_ID` | `/currentMatches` endpoint |
| `FIREBASE_PROJECT_ID` | Firebase console |
| `VITE_FIREBASE_*` | Firebase console → Project settings |
| `VITE_FIREBASE_VAPID_KEY` | Firebase → Cloud Messaging → Web push certs |

## GSD Planning Files

| File | Purpose |
|------|---------|
| `.planning/PROJECT.md` | Living project context |
| `.planning/REQUIREMENTS.md` | 26 v1 requirements with IDs |
| `.planning/ROADMAP.md` | 4-phase hackathon roadmap |
| `.planning/STATE.md` | Current phase + next action |
| `.planning/config.json` | GSD workflow settings |

---
*Context created: 2026-05-17*

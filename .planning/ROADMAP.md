# Roadmap: Analyst's Dugout

**Project:** AI-powered cricket second-screen experience
**Milestone:** v1 — Hackathon submission
**Total Phases:** 4

---

## Phase 1 — Infrastructure Setup

**Goal:** Get all cloud services provisioned, connected, and verified before writing a single line of application code.

**Requirements covered:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05

**Deliverables:**
- GCP project `analysts-dugout` created; Cloud Run, Firestore, Firebase, Artifact Registry, Cloud Build APIs enabled
- Firebase linked to GCP project; Firestore (Native, `asia-south1`), Realtime Database (`asia-southeast1`), FCM configured
- Firebase Admin SDK service account key generated and added to `.gitignore`
- CricketData.org API key tested; live `matchId` obtained from `/currentMatches`
- Gemini API key from AI Studio
- Monorepo scaffolded: `agent/` (Node.js) · `frontend/` (Vite React)
- `.env` template created; `.env` and `serviceAccountKey.json` in `.gitignore`

**Status:** `complete`

---

## Phase 2 — Agentic Backend (Cloud Run)

**Goal:** Build the three-layer autonomous agent: Poller → Event Detector → Relevance Filter → Gemini integration.

**Requirements covered:** AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05, AGENT-06, AGENT-07

**Plans:** 3 plans
- [x] 02-01-PLAN.md — Refine Data Ingestion, State, and RTDB streaming
- [x] 02-02-PLAN.md — Refine Agentic Reasoning (Event Detection & Filtering)
- [x] 02-03-PLAN.md — Finalize Gemini Integration and Execution Loop

**Deliverables:**
- `agent/index.js` — main entry with infinite poll loop (3-second interval)
- `agent/poller.js` — fetches CricketData.org, normalises raw response into flat state object; writes live state to RTDB; only processes when status is `live`
- `agent/eventDetector.js` — compares previous vs current state; detects all 9 triggers in priority order; returns single highest-priority trigger
- `agent/relevanceFilter.js` — global 12s cooldown + per-trigger cooldowns (wicket 5s, bowling change 20s, new over 45s)
- `agent/gemini.js` — builds structured context prompt; calls Gemini 1.5 Flash; validates and returns `{ headline, beginner, expert, keyPlayer, triggerType }`
- `agent/Dockerfile` — containerises the service
- `agent/.env.example` — documents all required env vars

**Status:** `complete`

---

## Phase 3 — Firebase Data Layer

**Goal:** Store insight cards durably, push them to fans instantly, and stream live score to the frontend header.

**Requirements covered:** FIRE-01, FIRE-02, FIRE-03, FIRE-04

**Plans:** 2 plans
- [x] 03-01-PLAN.md — Firebase Admin Setup and Writer Module
- [x] 03-02-PLAN.md — Integration and Verification

**Deliverables:**
- `agent/firebase.js` — initialises Firebase Admin SDK with service account; exports `db` (Firestore) and `rtdb` (Realtime Database) and `messaging` (FCM)
- `agent/writer.js` — implements atomic write flow: (1) add card to Firestore `insights/{matchId}/cards/{autoId}`, (2) send FCM to topic `match_{matchId}`, (3) update RTDB `liveMatch/{matchId}`
- Firestore schema: `insights/{matchId}/cards/{autoId}` with fields `headline`, `beginner`, `expert`, `triggerType`, `keyPlayer`, `scoreAtTrigger`, `matchId`, `timestamp`
- RTDB schema: `liveMatch/{matchId}` with fields `score`, `wickets`, `overs`, `striker`, `strikerRuns`, `bowler`, `lastUpdated`
- Tested: card written to Firestore, FCM message received on test device, RTDB live score visible in console

**Status:** `complete`

---

## Phase 4 — React PWA Frontend & Deployment

**Goal:** Build the fan-facing second screen and deploy agent + frontend to Cloud Run.

**Requirements covered:** FE-01 through FE-10

**Plans:** 3/5 plans executed
- [x] 04-A-PLAN.md — React Scaffolding & UI Components
- [x] 04-B-PLAN.md — Firebase Core & RTDB
- [x] 04-C-PLAN.md — Firestore Insight Feed
- [ ] 04-D-PLAN.md — PWA & Notifications
- [ ] 04-E-PLAN.md — Cloud Run Deployment

**Deliverables:**

**Frontend (`frontend/`):**
- `src/components/MatchHeader.jsx` — reads RTDB via `onValue`; shows score, wickets, overs, striker, bowler; auto-refreshes every RTDB write
- `src/components/InsightFeed.jsx` — Firestore `onSnapshot` listener; top-10 cards ordered by timestamp desc; slide-in CSS animation for new cards
- `src/components/InsightCard.jsx` — displays headline, knowledge-level-sensitive body, keyPlayer badge; expand button for side-by-side beginner/expert view
- `src/components/KnowledgeToggle.jsx` — two-button switch (Casual / Expert); updates global context; no page reload
- `src/firebase.js` — initialises Firebase JS SDK; exports Firestore and RTDB refs
- `src/fcm.js` — requests notification permission; gets FCM token; subscribes to `match_{matchId}` topic via fetch to backend helper
- `public/manifest.json` — PWA manifest with name, icons, `display: standalone`
- `public/sw.js` — service worker for offline shell and background push
- Slide-in card animation in `src/index.css`

**Deployment:**
- `frontend/Dockerfile` — Nginx-based static serving with long-cache headers
- `frontend/nginx.conf` — single-page app routing + cache headers
- `agent/` deployed to Cloud Run `asia-south1`, `--min-instances 1`, `--no-allow-unauthenticated`, env vars injected
- `frontend/` deployed to Cloud Run `asia-south1`, `--allow-unauthenticated`
- End-to-end smoke test: poller fires → event detected → Gemini card generated → Firestore written → card appears in live PWA

**Status:** `in-progress`

---

## Milestone Summary

| Phase | Name | Key Output | Status |
|-------|------|------------|--------|
| 1 | Infrastructure Setup | GCP + Firebase provisioned, monorepo scaffolded | complete |
| 2 | Agentic Backend | Poller + Event Detector + Gemini integration | complete |
| 3 | Firebase Data Layer | Firestore writes + FCM push + RTDB streaming | complete |
| 4 | 3/5 | In Progress|  |

---
*Roadmap updated: 2026-05-18*

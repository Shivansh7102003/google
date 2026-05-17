# Analyst's Dugout — Implementation Plan

> **Project:** Analyst's Dugout — AI-powered cricket second-screen experience
> **Stack:** CricketData.org · Gemini API · Firebase · GCP Cloud Run · React PWA
> **Event:** Google Agentic Premier League Hackathon

---

## Problem Statement

Most cricket fans watch matches without understanding the tactical decisions happening in real time — why a bowler was changed, what a field placement means, or why a partnership is dangerous. Analyst's Dugout solves this by placing an AI agent between the live data feed and the fan's phone, generating plain-language insight cards the moment something tactically significant happens — no user input required.

---

## System Architecture

```
CricketData.org API  →  Poller (Cloud Run)  →  Event Detector
                                                      ↓
                                             Gemini 2.5 Flash
                                                      ↓
                                         Firebase Firestore + FCM
                                                      ↓
                                           React PWA (Fan Screen)
```

### Core Agentic Loop

1. Poller fetches ball-by-ball data from CricketData.org every 3 seconds
2. Event Detector compares previous vs current match state to identify trigger moments
3. Relevance Filter decides whether the moment is worth surfacing (prevents spam)
4. Gemini API receives a structured context prompt and returns a tailored insight card
5. Firebase writes the card to Firestore and pushes a notification via FCM
6. React PWA receives the card in real time and displays it on the fan's second screen

---

## Phase 1 — Infrastructure Setup

### Goal
Get all cloud services provisioned, connected, and ready before writing a single line of application code.

### GCP Project
- Create a new GCP project called `analysts-dugout`
- Enable the following APIs: Cloud Run, Firestore, Firebase, Artifact Registry, Cloud Build

### Firebase
- Link the Firebase project to the same GCP project
- Enable **Firestore** in Native mode, region `asia-south1` (Mumbai)
- Enable **Realtime Database**, region `asia-southeast1`
- Enable **Firebase Cloud Messaging (FCM)** for push notifications
- Generate a Firebase Admin SDK service account key and store it securely — never commit to Git

### External APIs
- Sign up at **CricketData.org**, copy the API key, and test the `/currentMatches` endpoint to get a live `matchId`
- Generate a **Gemini API key** from Google AI Studio (`aistudio.google.com`)

### Repository Structure
Set up a monorepo with two top-level folders:
- `agent/` — the Cloud Run backend (Node.js)
- `frontend/` — the React PWA

Store all secrets in a `.env` file locally and as Cloud Run environment variables in production. Add `.env` and `serviceAccountKey.json` to `.gitignore` immediately.

---

## Phase 2 — Agentic Backend (Cloud Run)

### Goal
Build the three-layer agent that watches the match, decides when to act, and calls Gemini to generate an insight.

### Layer 1 — Poller Service
- Runs an infinite loop on Cloud Run, calling CricketData.org every 3 seconds
- Normalises the raw API response into a clean flat object containing: score, wickets, overs, striker name and stats, bowler name and economy, partnership runs, and match status
- Only processes balls when match status is `live`
- Simultaneously writes the normalised live state to Firebase Realtime Database so the frontend header always shows current score

### Layer 2 — Event Detector
The detector compares the previous ball state to the current one and checks for the following trigger events, listed in priority order:

| Priority | Trigger | Condition |
|---|---|---|
| 1 | Wicket | Wicket count increased |
| 1 | Powerplay end | Over crossed from 5 to 6 |
| 2 | Bowling change | Current bowler name changed |
| 2 | Death overs start | Over crossed from 15 to 16 |
| 3 | New batter | Striker name changed |
| 3 | 100 partnership | Partnership runs crossed 100 |
| 4 | Six hit | Last ball runs equals 6 |
| 4 | 50 partnership | Partnership runs crossed 50 |
| 5 | New over | Ball number reset to 0 |

If multiple triggers fire in the same poll cycle, only the highest priority one is processed.

### Layer 3 — Relevance Filter
- Applies a **global cooldown of 12 seconds** — the agent will never fire more than once per 12 seconds regardless of trigger
- Applies **per-trigger cooldowns** — e.g. wickets have a 5-second cooldown, bowling changes have 20 seconds, new-over cards have 45 seconds
- This prevents the fan from being overwhelmed with cards during a busy passage of play

### Gemini Integration
When a trigger passes the filter, the agent builds a structured prompt containing:
- The trigger type (e.g. BOWLING_CHANGE)
- Current score, wickets, overs
- Striker name, runs, and balls faced
- Current bowler name and economy rate
- Current partnership runs and balls
- Batting and bowling team names

Gemini 1.5 Flash is instructed to return a JSON object with:
- `headline` — a punchy 8-word title
- `beginner` — 2-sentence plain English explanation for a casual fan
- `expert` — 2-sentence tactical explanation using cricket terminology
- `keyPlayer` — the most relevant player in this moment
- `triggerType` — echoed back for frontend labelling

The prompt explicitly instructs Gemini to use real player names and specific numbers — never generic statements.

---

## Phase 3 — Firebase Data Layer

### Goal
Store insight cards durably, push them to fans instantly, and stream live match state to the frontend header.

### Firestore Schema
```
insights/
  {matchId}/
    cards/
      {autoId}/
        - headline        (string)
        - beginner        (string)
        - expert          (string)
        - triggerType     (string)
        - keyPlayer       (string)
        - scoreAtTrigger  (string — e.g. "145/3 (18.2 ov)")
        - matchId         (string)
        - timestamp       (number — Unix ms)
```

### Realtime Database Schema
```
liveMatch/
  {matchId}/
    - score         (number)
    - wickets       (number)
    - overs         (string)
    - striker       (string)
    - strikerRuns   (number)
    - bowler        (string)
    - lastUpdated   (number)
```

### Firebase Cloud Messaging
- All fans subscribe to an FCM topic named `match_{matchId}` when they open the app
- When a new insight card is written, the agent sends an FCM message to this topic
- The notification title is the card headline; the body is the beginner insight
- Works in foreground (in-app banner) and background (system push notification)

### Write Flow (agent side)
For each generated insight card:
1. Add document to Firestore `insights/{matchId}/cards/`
2. Send FCM message to topic `match_{matchId}`
3. Update Realtime Database `liveMatch/{matchId}` with latest score state

---

## Phase 4 — React PWA Frontend & Deployment

### Goal
Build the fan-facing second screen and deploy everything to GCP.

### Frontend Features

**Match header** — reads from Firebase Realtime Database via `onValue` listener, displays current score, wickets, overs, striker name, and bowler name. Updates every time the poller writes a new state (every 3 seconds).

**Insight card feed** — reads from Firestore via `onSnapshot` listener on `insights/{matchId}/cards`, ordered by timestamp descending, limited to the last 10 cards. New cards appear instantly at the top with a slide-in animation.

**Knowledge level toggle** — a two-button switch between "Casual fan" and "Cricket expert" modes. Switches which field is shown on all cards (`beginner` vs `expert`) without a page reload.

**Tell me more** — an expand button on each card that reveals both the beginner and expert explanation side by side, giving the fan the option to go deeper.

**Push notifications** — the app requests notification permission on load, gets an FCM token, and subscribes to the match topic. When a card arrives while the app is backgrounded, a system notification appears. Tapping it opens the app to the new card.

**PWA configuration** — a `manifest.json` and service worker make the app installable on Android and iOS home screens, so it behaves like a native app during a live match.

### Deployment

**Agent (backend):**
- Containerised with Docker and deployed to Cloud Run in `asia-south1`
- Set `--min-instances 1` so the poller never cold-starts mid-match
- All secrets (API keys, project ID) injected as Cloud Run environment variables — never baked into the image
- Set `--no-allow-unauthenticated` since this service has no public endpoints

**Frontend:**
- Built with `npm run build` (Vite) producing a static bundle
- Served via Nginx inside a Docker container, deployed to Cloud Run
- Set `--allow-unauthenticated` so fans can access it without logging in
- Static assets served with long cache headers for performance

**Region:** `asia-south1` (Mumbai) for both services — lowest latency for IPL and Indian cricket audiences.

### Environment Variables Required

| Variable | Source |
|---|---|
| `CRICKET_API_KEY` | CricketData.org dashboard |
| `GEMINI_API_KEY` | Google AI Studio |
| `MATCH_ID` | CricketData.org `/currentMatches` endpoint |
| `FIREBASE_PROJECT_ID` | Firebase console |
| `VITE_FIREBASE_*` | Firebase console → Project settings → Your apps |
| `VITE_FIREBASE_VAPID_KEY` | Firebase console → Cloud Messaging → Web push certificates |

---

## What Makes This Agentic

The system is not a dashboard or a query tool. The agent:

- **Perceives** the world autonomously by polling live match data every 3 seconds
- **Reasons** about what is tactically significant by comparing state transitions against a priority-ranked trigger list
- **Decides** whether to act using a relevance filter with per-trigger and global cooldowns
- **Acts** by constructing a context-rich prompt, calling Gemini, and writing the output to multiple Firebase services simultaneously
- **Adapts** to the pace of the match — during a quiet patch it stays silent; during a collapse it prioritises wicket cards above everything else

No user needs to ask a question. The agent watches the match so the fan doesn't have to think — they just receive the insight at exactly the right moment.
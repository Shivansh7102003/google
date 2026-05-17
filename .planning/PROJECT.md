# Analyst's Dugout

## What This Is

Analyst's Dugout is an AI-powered cricket second-screen experience built for the Google Agentic Premier League Hackathon. An autonomous agent watches ball-by-ball live match data, detects tactically significant moments, and calls Gemini to generate plain-language insight cards — all without the fan ever asking a question. It runs as a React PWA backed by a Node.js Cloud Run poller and Firebase.

## Core Value

Fans receive the right tactical insight at exactly the right moment in a live cricket match — zero user input required.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Poller fetches live ball-by-ball data from CricketData.org every 3 seconds
- [ ] Event Detector identifies 9 prioritised trigger types from state transitions
- [ ] Relevance Filter applies global (12s) and per-trigger cooldowns to prevent card spam
- [ ] Gemini 1.5 Flash generates structured insight cards (headline, beginner, expert, keyPlayer)
- [ ] Firestore persists insight cards under `insights/{matchId}/cards/`
- [ ] Realtime Database streams live score state to frontend header
- [ ] FCM pushes notifications to fans subscribed to `match_{matchId}` topic
- [ ] React PWA displays card feed with slide-in animation and knowledge-level toggle
- [ ] PWA is installable on Android/iOS home screens with service worker + manifest
- [ ] Agent and frontend are both containerised and deployed on Cloud Run in `asia-south1`

### Out of Scope

- User accounts / login — hackathon scope, anonymous fan experience is sufficient
- Historical match replay — real-time only for MVP
- Multi-match support — single `MATCH_ID` env var per deployment
- Native mobile app — PWA covers install-to-home-screen use case

## Context

- **Hackathon:** Google Agentic Premier League — agentic behaviour is the judging criterion
- **Stack:** CricketData.org API · Gemini 1.5 Flash · Firebase (Firestore + RTDB + FCM) · GCP Cloud Run · React + Vite PWA
- **Monorepo layout:** `agent/` (Node.js Cloud Run backend) · `frontend/` (React Vite PWA)
- **Region:** `asia-south1` (Mumbai) for lowest latency to Indian cricket audiences

## Constraints

- **Timeline**: Hackathon deadline — 4 phases, ship fast
- **Budget**: Free-tier Firebase + Cloud Run min-instances=1; avoid costly LLM calls (Relevance Filter gates Gemini calls)
- **Security**: `.env` and `serviceAccountKey.json` never committed to git; secrets as Cloud Run env vars
- **API Rate**: CricketData.org free plan; 3-second poll interval chosen to stay within limits

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gemini 1.5 Flash over Pro | Speed over depth — insight cards must arrive within seconds | — Pending |
| Firebase Realtime DB for live score | Low-latency streaming; Firestore is used for durable card history | — Pending |
| Cloud Run min-instances=1 | Prevent cold-start during live match | — Pending |
| Relevance Filter 12s global cooldown | Prevent card spam during busy passages; quality over quantity | — Pending |
| PWA over native app | Ship faster; installable home-screen covers the "second screen" use case | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-17 after initialization*

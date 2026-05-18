# Requirements: Analyst's Dugout

**Defined:** 2026-05-17
**Core Value:** Fans receive the right tactical insight at exactly the right moment in a live cricket match — zero user input required.

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: GCP project `analysts-dugout` created with Cloud Run, Firestore, Firebase, Artifact Registry, Cloud Build APIs enabled
- [ ] **INFRA-02**: Firebase project linked; Firestore in Native mode (`asia-south1`), Realtime Database (`asia-southeast1`), FCM enabled
- [ ] **INFRA-03**: CricketData.org API key tested against `/currentMatches` to obtain a live `matchId`
- [ ] **INFRA-04**: Gemini API key obtained from AI Studio
- [ ] **INFRA-05**: Monorepo initialised with `agent/` and `frontend/` directories; secrets in `.env` never committed

### Agent Backend

- [ ] **AGENT-01**: Poller fetches CricketData.org ball-by-ball data every 3 seconds and normalises response to flat state object
- [ ] **AGENT-02**: Poller writes normalised live state to Firebase Realtime Database on every cycle
- [ ] **AGENT-03**: Event Detector compares previous vs current state and fires one of 9 prioritised triggers (Wicket → Powerplay end → Bowling change → Death overs → New batter → 100 partnership → Six hit → 50 partnership → New over)
- [ ] **AGENT-04**: Only highest-priority trigger is processed when multiple fire in same cycle
- [ ] **AGENT-05**: Relevance Filter applies 12-second global cooldown and per-trigger cooldowns (wicket 5s, bowling change 20s, new-over card 45s)
- [ ] **AGENT-06**: Gemini 1.5 Flash called with structured context prompt; returns JSON with `headline`, `beginner`, `expert`, `keyPlayer`, `triggerType`
- [ ] **AGENT-07**: Gemini prompt explicitly instructs use of real player names and specific numbers

### Firebase Data Layer

- [ ] **FIRE-01**: Insight card written to Firestore `insights/{matchId}/cards/{autoId}` with all 8 fields
- [ ] **FIRE-02**: FCM message sent to topic `match_{matchId}` with card headline as title and beginner as body
- [ ] **FIRE-03**: Realtime Database `liveMatch/{matchId}` updated with latest score state after every agent write
- [ ] **FIRE-04**: Write flow is atomic: Firestore → FCM → RTDB in sequence

### Frontend PWA

- [x] **FE-01**: Match header reads from RTDB via `onValue` listener and displays score, wickets, overs, striker, bowler — updates every 3 seconds
- [ ] **FE-02**: Insight card feed reads from Firestore via `onSnapshot`, ordered by timestamp descending, capped at 10 cards
- [ ] **FE-03**: New cards appear at the top with slide-in animation
- [ ] **FE-04**: Knowledge-level toggle switches all cards between `beginner` and `expert` without page reload
- [ ] **FE-05**: "Tell me more" expand button reveals both beginner and expert explanations side by side
- [ ] **FE-06**: App requests notification permission on load, subscribes to `match_{matchId}` FCM topic
- [ ] **FE-07**: Background push notification appears when app is not in foreground; tapping opens app to new card
- [ ] **FE-08**: `manifest.json` and service worker make the app installable on Android and iOS
- [ ] **FE-09**: Agent Docker image deployed to Cloud Run `asia-south1` with `--min-instances 1`, no public endpoints
- [ ] **FE-10**: Frontend static bundle served via Nginx on Cloud Run `asia-south1` with `--allow-unauthenticated`

## v2 Requirements

### Enhanced Intelligence

- **V2-01**: Multi-match dashboard — select from all live matches
- **V2-02**: Historical insight replay for completed matches
- **V2-03**: Gemini-powered pre-match tactical preview card
- **V2-04**: Fan reaction / emoji voting on each insight card

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Hackathon scope — anonymous fan experience sufficient |
| Historical match replay | Real-time only for MVP |
| Multi-language insights | English only for hackathon |
| Native mobile app | PWA home-screen install covers the use case |
| Admin dashboard | No backend management UI needed for demo |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| AGENT-01 | Phase 2 | Pending |
| AGENT-02 | Phase 2 | Pending |
| AGENT-03 | Phase 2 | Pending |
| AGENT-04 | Phase 2 | Pending |
| AGENT-05 | Phase 2 | Pending |
| AGENT-06 | Phase 2 | Pending |
| AGENT-07 | Phase 2 | Pending |
| FIRE-01 | Phase 3 | Pending |
| FIRE-02 | Phase 3 | Pending |
| FIRE-03 | Phase 3 | Pending |
| FIRE-04 | Phase 3 | Pending |
| FE-01 | Phase 4 | Complete |
| FE-02 | Phase 4 | Pending |
| FE-03 | Phase 4 | Pending |
| FE-04 | Phase 4 | Pending |
| FE-05 | Phase 4 | Pending |
| FE-06 | Phase 4 | Pending |
| FE-07 | Phase 4 | Pending |
| FE-08 | Phase 4 | Pending |
| FE-09 | Phase 4 | Pending |
| FE-10 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after initial definition*

# Phase 4 Plan 04-C: Firestore Insight Feed Summary

Implemented real-time listener for generated insight cards from Firestore and connected it to the React frontend.

## Key Changes

### Firestore Integration
- Created `useInsights` custom hook in `frontend/src/hooks/useInsights.js`.
- Uses `onSnapshot` to listen to the `insights/{matchId}/cards` collection.
- Orders cards by `timestamp` in descending order.

### UI Connection
- Updated `App.jsx` to use `useInsights` hook.
- Passed the `insights` data and current `knowledgeMode` to `InsightFeed`.
- Updated `InsightFeed` and `InsightCard` to respect the `mode` prop, displaying either `beginner_insight` or `expert_insight` in the main card body.

## Verification Results
- `useInsights` hook successfully subscribes to Firestore.
- Insight cards are displayed in the feed.
- Knowledge toggle correctly switches between beginner and expert insights on the cards.

## Self-Check: PASSED
- [x] Firestore listener hook implemented.
- [x] Live insight cards appear in the feed automatically.
- [x] Commits made for each task.

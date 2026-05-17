import { db, rtdb, messaging } from './firebase.js';

export async function writeInsightAndFanout({ insight, matchState }) {
  const { matchId } = matchState;
  const timestamp = Date.now();

  try {
    // 1. Firestore: Add doc to insights/{matchId}/cards/ (auto-ID)
    const cardData = {
      headline: insight.headline,
      beginner: insight.beginner,
      expert: insight.expert,
      triggerType: insight.triggerType,
      keyPlayer: insight.keyPlayer || null,
      scoreAtTrigger: `${matchState.score}/${matchState.wickets}`,
      matchId: matchId,
      timestamp: timestamp
    };
    
    await db.collection('insights').doc(matchId).collection('cards').add(cardData);
    console.log(`Firestore: Added insight card for match ${matchId}`);

    // 2. FCM: Send message to topic 'match_{matchId}'
    const message = {
      topic: `match_${matchId}`,
      notification: {
        title: insight.headline,
        body: insight.beginner
      },
      data: {
        triggerType: insight.triggerType,
        matchId: matchId
      }
    };
    
    await messaging.send(message);
    console.log(`FCM: Sent notification to topic match_${matchId}`);

    // 3. RTDB: Update liveMatch/{matchId} with latest score state
    const liveScoreData = {
      score: matchState.score,
      wickets: matchState.wickets,
      overs: matchState.overs,
      striker: matchState.striker,
      bowler: matchState.bowler,
      lastUpdated: timestamp
    };
    
    await rtdb.ref(`liveMatch/${matchId}`).set(liveScoreData);
    console.log(`RTDB: Updated live match state for match ${matchId}`);
    
  } catch (error) {
    console.error('Error in writeInsightAndFanout:', error);
  }
}

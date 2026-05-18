import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { writeInsightAndFanout } from './writer.js';

async function verify() {
  console.log('Testing Firebase Data Layer...');
  
  const mockState = {
    matchId: process.env.MATCH_ID || 'test_match_001',
    score: 145,
    wickets: 3,
    overs: '18.2',
    battingTeam: 'India',
    bowlingTeam: 'Australia',
    striker: 'Virat Kohli',
    bowler: 'Pat Cummins',
    status: 'Live'
  };

  const mockInsight = {
    headline: 'Kohli reaches fifty in style!',
    beginner: 'Virat Kohli has just crossed 50 runs. He is leading the Indian innings with some aggressive batting.',
    expert: 'Kohli maintains a high strike rate against the pacers, finding gaps in the deep mid-wicket region.',
    keyPlayer: 'Virat Kohli',
    triggerType: 'PARTNERSHIP_50'
  };

  try {
    console.log('Attempting atomic write...');
    await writeInsightAndFanout({ insight: mockInsight, matchState: mockState });
    console.log('\n✅ Verification successful!');
    console.log('Check Firestore collection "insights" and RTDB path "liveMatch"');
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
  } finally {
    process.exit(0);
  }
}

verify();
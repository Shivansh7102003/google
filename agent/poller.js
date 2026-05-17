import 'dotenv/config';
import axios from 'axios';
import { updateState } from './state.js';
import { rtdb } from './firebase.js';

const CRICKET_API_KEY = process.env.CRICKET_API_KEY;
const MATCH_ID = process.env.MATCH_ID;
const BASE_URL = 'https://api.cricapi.com/v1';

async function fetchMatchData() {
  const response = await axios.get(`${BASE_URL}/currentMatches`, {
    params: {
      apikey: CRICKET_API_KEY,
      offset: 0
    }
  });
  return response.data;
}

function normalizeMatchData(data) {
  const match = data.data.find(m => m.id === MATCH_ID);
  if (!match) return null;

  const isLive = match.matchStarted && !match.matchEnded;
  if (!isLive) return null;

  const battingTeam = match.teamInfo?.[0]?.name || '';
  const bowlingTeam = match.teamInfo?.[1]?.name || '';

  const scores = match.score || [];
  const innings = scores.find(s => s.inning?.toLowerCase().includes(battingTeam.toLowerCase().split(' ').pop())) 
               || scores[0] || {};

  const runs = innings.r || 0;
  const wickets = innings.w || 0;
  const overs = innings.o || 0;

  return {
    matchId: match.id,
    status: match.status,
    score: runs,
    wickets: wickets,
    overs: overs,
    battingTeam: battingTeam,
    bowlingTeam: bowlingTeam,
    striker: match.striker || 'Unknown',
    strikerRuns: match.strikerRuns || 0,
    strikerBalls: match.strikerBalls || 0,
    nonStriker: match.nonStriker || 'Unknown',
    nonStrikerRuns: match.nonStrikerRuns || 0,
    nonStrikerBalls: match.nonStrikerBalls || 0,
    bowler: match.bowler || 'Unknown',
    bowlerOvers: match.bowlerOvers || 0,
    bowlerRuns: match.bowlerRuns || 0,
    bowlerWickets: match.bowlerWickets || 0,
    lastUpdated: new Date().toISOString()
  };
}

export async function poll() {
  try {
    const data = await fetchMatchData();
    if (!data || !data.data) {
      console.error('Invalid API response:', data);
      return null;
    }
    const normalized = normalizeMatchData(data);

    if (normalized) {
      updateState(normalized);
      // Sync to RTDB
      await rtdb.ref(`liveMatch/${normalized.matchId}`).set(normalized);
      return normalized;
    }
    return null;
  } catch (error) {
    console.error('Poll error:', error.message, error.stack);
    return null;
  }
}
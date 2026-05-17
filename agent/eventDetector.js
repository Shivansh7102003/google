import { getStateDelta } from './state.js';

const TRIGGER_PRIORITY = [
  'WICKET',
  'POWERPLAY_END',
  'BOWLING_CHANGE',
  'DEATH_OVERS',
  'NEW_BATTER',
  'PARTNERSHIP_100',
  'SIX_HIT',
  'PARTNERSHIP_50',
  'NEW_OVER'
];

function detectWicket(prev, current) {
  if (!prev || !current) return null;
  if (current.wickets > prev.wickets) {
    return { type: 'WICKET', triggerType: 'WICKET', details: { wickets: current.wickets } };
  }
  return null;
}

function detectPowerplayEnd(prev, current) {
  if (!prev || !current) return null;
  const prevOver = Math.floor(prev.overs);
  const currOver = Math.floor(current.overs);
  // Powerplay end: Over crossed from 5 to 6
  if (prevOver < 6 && currOver >= 6) {
    return { type: 'POWERPLAY_END', triggerType: 'POWERPLAY_END', details: { over: currOver } };
  }
  return null;
}

function detectBowlingChange(prev, current) {
  if (!prev || !current) return null;
  if (prev.bowler !== current.bowler && current.bowler !== 'Unknown') {
    return { type: 'BOWLING_CHANGE', triggerType: 'BOWLING_CHANGE', details: { bowler: current.bowler } };
  }
  return null;
}

function detectDeathOvers(prev, current) {
  if (!prev || !current) return null;
  const prevOver = Math.floor(prev.overs);
  const currOver = Math.floor(current.overs);
  // Death overs start: Over crossed from 15 to 16
  if (prevOver < 16 && currOver >= 16) {
    return { type: 'DEATH_OVERS', triggerType: 'DEATH_OVERS', details: { over: currOver } };
  }
  return null;
}

function detectNewBatter(prev, current) {
  if (!prev || !current) return null;
  if (prev.striker !== current.striker && prev.wickets === current.wickets && current.striker !== 'Unknown') {
    return { type: 'NEW_BATTER', triggerType: 'NEW_BATTER', details: { striker: current.striker } };
  }
  return null;
}

function detectPartnership100(prev, current) {
  if (!prev || !current) return null;
  const prevPartnership = prev.strikerRuns + prev.nonStrikerRuns;
  const currPartnership = current.strikerRuns + current.nonStrikerRuns;
  if (prevPartnership < 100 && currPartnership >= 100) {
    return { type: 'PARTNERSHIP_100', triggerType: 'PARTNERSHIP_100', details: { partnership: currPartnership } };
  }
  return null;
}

function detectSixHit(prev, current) {
  if (!prev || !current) return null;
  const runsDiff = current.score - prev.score;
  if (runsDiff === 6) {
    return { type: 'SIX_HIT', triggerType: 'SIX_HIT', details: { runs: runsDiff } };
  }
  return null;
}

function detectPartnership50(prev, current) {
  if (!prev || !current) return null;
  const prevPartnership = prev.strikerRuns + prev.nonStrikerRuns;
  const currPartnership = current.strikerRuns + current.nonStrikerRuns;
  if (prevPartnership < 50 && currPartnership >= 50 && currPartnership < 100) {
    return { type: 'PARTNERSHIP_50', triggerType: 'PARTNERSHIP_50', details: { partnership: currPartnership } };
  }
  return null;
}

function detectNewOver(prev, current) {
  if (!prev || !current) return null;
  const prevOver = Math.floor(prev.overs);
  const currOver = Math.floor(current.overs);
  if (currOver > prevOver) {
    return { type: 'NEW_OVER', triggerType: 'NEW_OVER', details: { over: currOver } };
  }
  return null;
}

export function detectEvents() {
  const { previousState, currentState } = getStateDelta();
  
  if (!currentState) return null;
  if (!previousState) return null; // Need delta

  const detectors = [
    detectWicket,
    detectPowerplayEnd,
    detectBowlingChange,
    detectDeathOvers,
    detectNewBatter,
    detectPartnership100,
    detectSixHit,
    detectPartnership50,
    detectNewOver
  ];

  for (const detector of detectors) {
    const result = detector(previousState, currentState);
    if (result) return result;
  }

  return null;
}
const COOLDOWNS = {
  WICKET: 5000,
  BOWLING_CHANGE: 20000,
  NEW_OVER: 45000,
  DEFAULT: 10000
};

const GLOBAL_COOLDOWN = 12000;

let lastCardTime = 0;
const triggerHistory = new Map();

export function checkRelevance(triggerType) {
  const now = Date.now();

  if (now - lastCardTime < GLOBAL_COOLDOWN) {
    return { allowed: false, reason: `Global cooldown active (${Math.round((GLOBAL_COOLDOWN - (now - lastCardTime))/1000)}s remaining)` };
  }

  const cooldown = COOLDOWNS[triggerType] || COOLDOWNS.DEFAULT;
  const lastTriggerTime = triggerHistory.get(triggerType) || 0;

  if (now - lastTriggerTime < cooldown) {
    return { allowed: false, reason: `${triggerType} cooldown active (${Math.round((cooldown - (now - lastTriggerTime))/1000)}s remaining)` };
  }

  triggerHistory.set(triggerType, now);
  lastCardTime = now;

  return { allowed: true, reason: 'Allowed' };
}

export function resetFilter() {
  lastCardTime = 0;
  triggerHistory.clear();
}
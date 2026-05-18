// ─────────────────────────────────────────────────────────────
//  app.js  — Core application logic
//  Depends on: firebase-config.js (loaded first in index.html)
// ─────────────────────────────────────────────────────────────

// ── State ────────────────────────────────────────────────────
let knowledgeMode = 'beginner'; // 'beginner' | 'expert'
let cards         = [];         // [{id, headline, beginner, expert, keyPlayer, triggerType, scoreAtTrigger, timestamp}]

// ── DOM refs ─────────────────────────────────────────────────
const livePill      = document.getElementById('live-pill');
const battingTeamEl = document.getElementById('batting-team');
const bowlingTeamEl = document.getElementById('bowling-team');
const scoreEl       = document.getElementById('score-display');
const oversEl       = document.getElementById('overs-display');
const strikerNameEl = document.getElementById('striker-name');
const strikerRunsEl = document.getElementById('striker-runs');
const bowlerNameEl  = document.getElementById('bowler-name');
const bowlerEconEl  = document.getElementById('bowler-econ');
const lastUpdEl     = document.getElementById('last-updated');
const cardFeed      = document.getElementById('card-feed');
const emptyState    = document.getElementById('empty-state');
const cardCountEl   = document.getElementById('card-count');
const cardTemplate  = document.getElementById('card-template');
const toastContainer= document.getElementById('toast-container');

// ── Knowledge Toggle ─────────────────────────────────────────
document.getElementById('btn-beginner').addEventListener('click', () => setMode('beginner'));
document.getElementById('btn-expert').addEventListener('click',   () => setMode('expert'));

function setMode(mode) {
  knowledgeMode = mode;

  document.getElementById('btn-beginner').classList.toggle('toggle-btn--active', mode === 'beginner');
  document.getElementById('btn-expert').classList.toggle('toggle-btn--active',   mode === 'expert');

  // Update all rendered card bodies without re-rendering
  document.querySelectorAll('.insight-card').forEach(el => {
    const id   = el.dataset.cardId;
    const card = cards.find(c => c.id === id);
    if (card) el.querySelector('.card-body').textContent = card[mode] || card.beginner;
  });
}

// ── Trigger → badge label map ────────────────────────────────
const TRIGGER_LABELS = {
  WICKET:           '🔴 Wicket',
  POWERPLAY_END:    '⚡ Powerplay',
  BOWLING_CHANGE:   '🔄 Bowling Change',
  DEATH_OVERS:      '💀 Death Overs',
  NEW_BATTER:       '🏏 New Batter',
  PARTNERSHIP_100:  '💯 100 Partnership',
  SIX:              '💥 Six!',
  PARTNERSHIP_50:   '🤝 50 Partnership',
  NEW_OVER:         '↩ New Over',
};

// ── Render a single insight card ────────────────────────────
function renderCard(card, prepend = true) {
  const clone = cardTemplate.content.cloneNode(true);
  const article = clone.querySelector('.insight-card');
  article.dataset.cardId = card.id;

  // Trigger badge
  const badge = clone.querySelector('.card-trigger-badge');
  badge.textContent = TRIGGER_LABELS[card.triggerType] || card.triggerType;
  badge.classList.add(`badge--${card.triggerType}`);

  // Score + time
  clone.querySelector('.card-score').textContent = card.scoreAtTrigger || '';
  clone.querySelector('.card-time').textContent  = card.timestamp
    ? new Date(card.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Headline
  clone.querySelector('.card-headline').textContent = card.headline;

  // Key player
  clone.querySelector('.card-key-player__name').textContent = card.keyPlayer || '—';

  // Body (mode-sensitive)
  clone.querySelector('.card-body').textContent = card[knowledgeMode] || card.beginner;

  // Expanded section
  clone.querySelector('.expand-beginner').textContent = card.beginner;
  clone.querySelector('.expand-expert').textContent   = card.expert;

  // Expand toggle
  const expandBtn      = clone.querySelector('.card-expand-btn');
  const expandSection  = clone.querySelector('.card-expanded');
  expandBtn.addEventListener('click', () => {
    const isOpen = expandBtn.getAttribute('aria-expanded') === 'true';
    expandBtn.setAttribute('aria-expanded', String(!isOpen));
    expandBtn.querySelector('.expand-label').textContent = isOpen ? 'Tell me more' : 'Show less';
    if (isOpen) {
      expandSection.setAttribute('hidden', '');
    } else {
      expandSection.removeAttribute('hidden');
    }
  });

  if (prepend) {
    cardFeed.prepend(clone);
  } else {
    cardFeed.appendChild(clone);
  }
}

// ── Re-render all cards (used after mode switch) ─────────────
function renderAllCards() {
  cardFeed.innerHTML = '';
  cards.forEach(card => renderCard(card, false));
}

// ── Toast helper ─────────────────────────────────────────────
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

// ── Update match header ──────────────────────────────────────
function updateHeader(data) {
  if (!data) return;

  // Teams — stored by agent as batting/bowling team names
  if (data.battingTeam)  battingTeamEl.textContent = data.battingTeam;
  if (data.bowlingTeam)  bowlingTeamEl.textContent = data.bowlingTeam;

  // Score
  const runs    = data.score    ?? '—';
  const wickets = data.wickets  ?? '—';
  scoreEl.textContent = `${runs}/${wickets}`;
  scoreEl.classList.remove('shimmer');

  oversEl.textContent = data.overs ? `${data.overs} ov` : '0.0 ov';

  // Striker
  strikerNameEl.textContent = data.striker     || '—';
  strikerRunsEl.textContent = data.strikerRuns !== undefined
    ? `${data.strikerRuns} (${data.strikerBalls ?? 0})`
    : '—';

  // Bowler
  bowlerNameEl.textContent = data.bowler     || '—';
  bowlerEconEl.textContent = data.bowlerEcon !== undefined
    ? `${Number(data.bowlerEcon).toFixed(2)} econ`
    : '—';

  // Live pill
  livePill.classList.add('is-live');

  // Last updated
  if (data.lastUpdated) {
    const t = new Date(data.lastUpdated);
    lastUpdEl.textContent = `Updated ${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }
}

// ── Realtime Database — live score listener ──────────────────
function startLiveScoreListener() {
  const liveRef = rtdb.ref(`liveMatch/${MATCH_ID}`);

  // Show shimmer while waiting
  scoreEl.classList.add('shimmer');
  scoreEl.textContent = '000/0';

  liveRef.on('value', snap => {
    const data = snap.val();
    if (data) updateHeader(data);
  }, err => {
    console.error('[RTDB]', err);
    lastUpdEl.textContent = 'Connection error — retrying…';
  });
}

// ── Firestore — insight card listener ───────────────────────
function startCardListener() {
  const cardsRef = db
    .collection('insights')
    .doc(MATCH_ID)
    .collection('cards')
    .orderBy('timestamp', 'desc')
    .limit(10);

  cardsRef.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const data = change.doc.data();
        const card = { id: change.doc.id, ...data };

        // Avoid duplicates
        if (cards.find(c => c.id === card.id)) return;

        cards.unshift(card);

        // Keep only last 10
        if (cards.length > 10) cards = cards.slice(0, 10);

        // Update UI
        emptyState.style.display = 'none';
        renderCard(card, true);
        cardCountEl.textContent = `${cards.length} card${cards.length === 1 ? '' : 's'}`;

        // Toast
        showToast(`🏏 ${card.headline}`);
      }
    });
  }, err => {
    console.error('[Firestore]', err);
    showToast('⚠ Could not load insight cards');
  });
}

// ── Boot ─────────────────────────────────────────────────────
(function init() {
  startLiveScoreListener();
  startCardListener();
})();

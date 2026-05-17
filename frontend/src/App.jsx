import React, { useState } from 'react';
import MatchHeader from './components/MatchHeader';
import KnowledgeToggle from './components/KnowledgeToggle';
import InsightFeed from './components/InsightFeed';
import { useMatchData } from './hooks/useMatchData';
import './App.css'; // Or index.css

const MOCK_INSIGHTS = [
  {
    id: 1,
    trigger_type: 'WICKET',
    score_at_time: '142/3',
    timestamp: new Date().toISOString(),
    headline: 'Kohli Reaches Fifty as Rahul Falls',
    key_player: 'Virat Kohli',
    body: 'A crucial wicket for Australia just as the partnership was looking dangerous.',
    beginner_insight: 'The batting team just lost a player. It is a big moment in the game!',
    expert_insight: 'The projected score drops by 15 runs. Australia should increase pressure now.'
  },
  {
    id: 2,
    trigger_type: 'SIX',
    score_at_time: '135/2',
    timestamp: new Date().toISOString(),
    headline: 'Massive Six over Long-on',
    key_player: 'KL Rahul',
    body: 'Rahul uses his feet beautifully to dispatch Zampa into the stands.',
    beginner_insight: 'He hit the ball out of the field! That earns his team 6 points.',
    expert_insight: 'Targeting the shorter boundary. Zampa needs to pull his length back.'
  }
];

function App() {
  const [knowledgeMode, setKnowledgeMode] = useState('beginner');
  const { matchData, loading, error } = useMatchData();
  const [insights, setInsights] = useState(MOCK_INSIGHTS);

  return (
    <div className="app-container">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo">🏏</span>
          <span className="topbar__name">Analyst's Dugout</span>
        </div>
        <div className="live-pill is-live" id="live-pill">
          <span className="live-dot"></span> LIVE
        </div>
      </header>

      <MatchHeader matchData={matchData} />
      <KnowledgeToggle mode={knowledgeMode} setMode={setKnowledgeMode} />
      <InsightFeed insights={insights} />

      <div id="toast-container" aria-live="polite"></div>
    </div>
  );
}

export default App;

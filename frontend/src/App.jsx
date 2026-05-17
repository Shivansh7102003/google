import React, { useState } from 'react';
import MatchHeader from './components/MatchHeader';
import KnowledgeToggle from './components/KnowledgeToggle';
import InsightFeed from './components/InsightFeed';
import { useMatchData } from './hooks/useMatchData';
import { useInsights } from './hooks/useInsights';
import './App.css'; // Or index.css

function App() {
  const [knowledgeMode, setKnowledgeMode] = useState('beginner');
  const { matchData } = useMatchData();
  const { insights } = useInsights();

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
      <InsightFeed insights={insights} mode={knowledgeMode} />

      <div id="toast-container" aria-live="polite"></div>
    </div>
  );
}

export default App;

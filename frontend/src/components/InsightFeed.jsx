import React from 'react';
import InsightCard from './InsightCard';

const InsightFeed = ({ insights, mode }) => {
  return (
    <main className="feed-container">
      <div className="feed-header">
        <h1 className="feed-title">Live Insights</h1>
        <span className="feed-count" id="card-count">{insights.length} cards</span>
      </div>

      {insights.length === 0 ? (
        <div className="empty-state" id="empty-state">
          <div className="empty-state__icon">📡</div>
          <p className="empty-state__title">Watching the match…</p>
          <p className="empty-state__sub">Insights appear the moment something tactically significant happens.</p>
        </div>
      ) : (
        <div className="feed" id="card-feed" role="feed" aria-label="Live cricket insights">
          {insights.map((insight, index) => (
            <InsightCard key={insight.id || index} insight={insight} mode={mode} />
          ))}
        </div>
      )}
    </main>
  );
};

export default InsightFeed;

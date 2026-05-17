import React, { useState } from 'react';

const InsightCard = ({ insight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    trigger_type = 'NEW_OVER',
    score_at_time = '0/0',
    timestamp = '',
    headline = '',
    key_player = '',
    body = '',
    beginner_insight = '',
    expert_insight = ''
  } = insight;

  const badgeClass = `card-trigger-badge badge--${trigger_type}`;

  return (
    <article className="insight-card" role="article">
      <div className="card-header">
        <span className={badgeClass}>{trigger_type.replace(/_/g, ' ')}</span>
        <span className="card-score">{score_at_time}</span>
        {timestamp && <span className="card-time">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
      <h2 className="card-headline">{headline}</h2>
      {key_player && (
        <div className="card-key-player">
          <span className="card-key-player__icon">⭐</span>
          <span className="card-key-player__name">{key_player}</span>
        </div>
      )}
      <p className="card-body">{body}</p>
      
      <button 
        className="card-expand-btn" 
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="expand-label">Tell me more</span>
        <span className="expand-icon">{isExpanded ? '▴' : '▾'}</span>
      </button>

      {isExpanded && (
        <div className="card-expanded">
          <div className="expand-col">
            <div className="expand-col__label">🙌 Casual Fan</div>
            <p className="expand-beginner">{beginner_insight}</p>
          </div>
          <div className="expand-col">
            <div className="expand-col__label">📊 Expert</div>
            <p className="expand-expert">{expert_insight}</p>
          </div>
        </div>
      )}
    </article>
  );
};

export default InsightCard;

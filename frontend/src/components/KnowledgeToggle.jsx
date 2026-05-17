import React from 'react';

const KnowledgeToggle = ({ mode, setMode }) => {
  return (
    <div className="toggle-wrap">
      <div className="toggle-group" id="knowledge-toggle">
        <button 
          className={`toggle-btn ${mode === 'beginner' ? 'toggle-btn--active' : ''}`}
          onClick={() => setMode('beginner')}
        >
          🙌 Casual Fan
        </button>
        <button 
          className={`toggle-btn ${mode === 'expert' ? 'toggle-btn--active' : ''}`}
          onClick={() => setMode('expert')}
        >
          📊 Cricket Expert
        </button>
      </div>
    </div>
  );
};

export default KnowledgeToggle;

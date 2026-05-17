import React from 'react';

const MatchHeader = ({ matchData }) => {
  const {
    battingTeam = 'Loading...',
    bowlingTeam = '—',
    runs = 0,
    wickets = 0,
    overs = '0.0',
    striker = { name: '—', runs: 0, balls: 0 },
    bowler = { name: '—', econ: '0.00' },
    lastUpdated = 'Waiting for live data...'
  } = matchData || {};

  return (
    <section className="match-header" id="match-header">
      <div className="match-header__teams">
        <span className="match-header__team" id="batting-team">{battingTeam}</span>
        <span className="match-header__vs">vs</span>
        <span className="match-header__team match-header__team--bowling" id="bowling-team">{bowlingTeam}</span>
      </div>

      <div className="score-block">
        <div className="score-block__runs" id="score-display">{runs}/{wickets}</div>
        <div className="score-block__overs" id="overs-display">{overs} ov</div>
      </div>

      <div className="player-row">
        <div className="player-chip player-chip--bat">
          <span className="player-chip__icon">🏏</span>
          <div>
            <div className="player-chip__label">Striker</div>
            <div className="player-chip__name" id="striker-name">{striker.name}</div>
            <div className="player-chip__stat" id="striker-runs">{striker.runs} ({striker.balls})</div>
          </div>
        </div>
        <div className="player-chip player-chip--bowl">
          <span className="player-chip__icon">⚡</span>
          <div>
            <div className="player-chip__label">Bowler</div>
            <div className="player-chip__name" id="bowler-name">{bowler.name}</div>
            <div className="player-chip__stat" id="bowler-econ">{bowler.econ} econ</div>
          </div>
        </div>
      </div>

      <div className="last-updated" id="last-updated">{lastUpdated}</div>
    </section>
  );
};

export default MatchHeader;

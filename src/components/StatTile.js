import React from 'react';
import './shared.css';

function StatTile({ value, label }) {
  return (
    <div className="stat-tile">
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default StatTile;

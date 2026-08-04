import React from 'react';
import './Dashboard.css';
import PolicyForm from './PolicyForm';

function InsertView({ onSessionExpired }) {
  return (
    <div className="content-card">
      <h2>Insert Policy</h2>
      <PolicyForm onSessionExpired={onSessionExpired} />
    </div>
  );
}

export default InsertView;

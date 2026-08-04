import React from 'react';
import './shared.css';

function ContentCard({ title, children }) {
  return (
    <div className="content-card">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
}

export default ContentCard;

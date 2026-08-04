import React, { useState } from 'react';
import './Dashboard.css';
import InsertView from './InsertView';
import UpdateView from './UpdateView';
import DeleteView from './DeleteView';
import SummaryView from './SummaryView';

const NAV_ITEMS = [
  { id: 'insert',  label: 'Insert',  icon: '+' },
  { id: 'update',  label: 'Update',  icon: '✎' },
  { id: 'delete',  label: 'Delete',  icon: '✕' },
  { id: 'summary', label: 'Summary', icon: '≡' },
];

function Dashboard({ email, onLogout, onSessionExpired }) {
  const [activeView, setActiveView] = useState('insert');

  const renderView = () => {
    switch (activeView) {
      case 'insert':  return <InsertView  onSessionExpired={onSessionExpired} />;
      case 'update':  return <UpdateView  onSessionExpired={onSessionExpired} />;
      case 'delete':  return <DeleteView  onSessionExpired={onSessionExpired} />;
      case 'summary': return <SummaryView onSessionExpired={onSessionExpired} />;
      default:        return null;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Policy Manager</h2>
          <p>{email}</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${activeView === item.id ? ' active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default Dashboard;

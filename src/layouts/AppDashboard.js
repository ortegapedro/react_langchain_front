import React, { useState } from 'react';
import './AppDashboard.css';
import Chatbot from '../features/chatbot/components/Chatbot';

import InsuranceInsertView   from '../features/insurances/components/InsertView';
import InsuranceUpdateView   from '../features/insurances/components/UpdateView';
import InsuranceDeleteView   from '../features/insurances/components/DeleteView';
import InsuranceSummaryView  from '../features/insurances/components/SummaryView';

import ClientInsertView   from '../features/clients/components/InsertView';
import ClientUpdateView   from '../features/clients/components/UpdateView';
import ClientDeleteView   from '../features/clients/components/DeleteView';
import ClientSummaryView  from '../features/clients/components/SummaryView';

import SupplierInsertView  from '../features/suppliers/components/InsertView';
import SupplierUpdateView  from '../features/suppliers/components/UpdateView';
import SupplierDeleteView  from '../features/suppliers/components/DeleteView';
import SupplierSummaryView from '../features/suppliers/components/SummaryView';
import SupplierUploadView  from '../features/suppliers/components/UploadView';

import RagUploadView from '../features/rag/components/UploadView';
import RagStatusView from '../features/rag/components/StatusView';
import RagClearView  from '../features/rag/components/ClearView';

const NAV_SECTIONS = [
  {
    label: 'Insurances',
    items: [
      { id: 'insurances.insert',   label: 'Insert',  icon: '+' },
      { id: 'insurances.update',   label: 'Update',  icon: '✎' },
      { id: 'insurances.delete',   label: 'Delete',  icon: '✕' },
      { id: 'insurances.summary',  label: 'Summary', icon: '≡' },
    ],
  },
  {
    label: 'Clients',
    items: [
      { id: 'clients.insert',   label: 'Insert',  icon: '+' },
      { id: 'clients.update',   label: 'Update',  icon: '✎' },
      { id: 'clients.delete',   label: 'Delete',  icon: '✕' },
      { id: 'clients.summary',  label: 'Summary', icon: '≡' },
    ],
  },
  {
    label: 'Suppliers',
    items: [
      { id: 'suppliers.upload',  label: 'Upload',  icon: '↑' },
      { id: 'suppliers.insert',  label: 'Insert',  icon: '+' },
      { id: 'suppliers.update',  label: 'Update',  icon: '✎' },
      { id: 'suppliers.delete',  label: 'Delete',  icon: '✕' },
      { id: 'suppliers.summary', label: 'Summary', icon: '≡' },
    ],
  },
  {
    label: 'Knowledge Base',
    items: [
      { id: 'rag.upload', label: 'Upload',  icon: '↑' },
      { id: 'rag.status', label: 'Status',  icon: '≡' },
      { id: 'rag.clear',  label: 'Clear',   icon: '✕' },
    ],
  },
];

function AppDashboard({ email, onLogout, onSessionExpired }) {
  const [activeView, setActiveView] = useState('insurances.insert');
  const [openSections, setOpenSections] = useState(
    () => new Set(NAV_SECTIONS.map(s => s.label))
  );

  const toggleSection = (label) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderView = () => {
    switch (activeView) {
      case 'insurances.insert':   return <InsuranceInsertView   onSessionExpired={onSessionExpired} />;
      case 'insurances.update':   return <InsuranceUpdateView   onSessionExpired={onSessionExpired} />;
      case 'insurances.delete':   return <InsuranceDeleteView   onSessionExpired={onSessionExpired} />;
      case 'insurances.summary':  return <InsuranceSummaryView  onSessionExpired={onSessionExpired} />;
      case 'clients.insert':    return <ClientInsertView   onSessionExpired={onSessionExpired} />;
      case 'clients.update':    return <ClientUpdateView   onSessionExpired={onSessionExpired} />;
      case 'clients.delete':    return <ClientDeleteView   onSessionExpired={onSessionExpired} />;
      case 'clients.summary':   return <ClientSummaryView  onSessionExpired={onSessionExpired} />;
      case 'suppliers.upload':  return <SupplierUploadView  onSessionExpired={onSessionExpired} />;
      case 'suppliers.insert':  return <SupplierInsertView  onSessionExpired={onSessionExpired} />;
      case 'suppliers.update':  return <SupplierUpdateView  onSessionExpired={onSessionExpired} />;
      case 'suppliers.delete':  return <SupplierDeleteView  onSessionExpired={onSessionExpired} />;
      case 'suppliers.summary': return <SupplierSummaryView onSessionExpired={onSessionExpired} />;
      case 'rag.upload': return <RagUploadView onSessionExpired={onSessionExpired} />;
      case 'rag.status': return <RagStatusView onSessionExpired={onSessionExpired} />;
      case 'rag.clear':  return <RagClearView  onSessionExpired={onSessionExpired} />;
      default:                  return null;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>App Manager</h2>
          <p>{email}</p>
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(section => {
            const isOpen = openSections.has(section.label);
            return (
              <div key={section.label} className="nav-section">
                <button
                  className="nav-section-toggle"
                  onClick={() => toggleSection(section.label)}
                  aria-expanded={isOpen}
                >
                  <span className="nav-section-label-text">{section.label}</span>
                  <span className={`nav-chevron${isOpen ? ' open' : ''}`}>›</span>
                </button>

                <div className={`nav-section-items${isOpen ? ' expanded' : ''}`}>
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      className={`nav-item${activeView === item.id ? ' active' : ''}`}
                      onClick={() => setActiveView(item.id)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        {renderView()}
      </main>

      {/* Floating chatbot widget — always available while logged in */}
      <Chatbot onSessionExpired={onSessionExpired} />
    </div>
  );
}

export default AppDashboard;

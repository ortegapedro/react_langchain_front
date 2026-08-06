import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import { getRagSources, clearRag } from '../services/rag';
import '../../../components/shared.css';

function ClearView({ onSessionExpired }) {
  const [sources, setSources]     = useState([]);
  const [selected, setSelected]   = useState(new Set());
  const [loading, setLoading]     = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy]           = useState(false);
  const [status, setStatus]       = useState(null);

  const loadSources = useCallback(() => {
    setLoading(true);
    setStatus(null);
    getRagSources()
      .then(data => {
        setSources(data.sources || []);
        setSelected(new Set());
        setConfirming(false);
      })
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setStatus({ type: 'error', message: 'Failed to load sources.' });
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  useEffect(() => { loadSources(); }, [loadSources]);

  const toggleSource = (source) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(source) ? next.delete(source) : next.add(source);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      selected.size === sources.length
        ? new Set()
        : new Set(sources.map(s => s.source))
    );
  };

  const handleDeactivate = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const result = await clearRag([...selected]);
      setStatus({
        type: 'success',
        message: `${result.deactivated} source(s) deactivated and files moved to deleted folder.`,
      });
      loadSources();
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') { onSessionExpired(); return; }
      setStatus({ type: 'error', message: err.message });
      setBusy(false);
    }
  };

  return (
    <ContentCard title="Manage Knowledge Base">
      {status && (
        <div className={`form-status ${status.type}`} style={{ marginBottom: 16 }}>
          {status.message}
        </div>
      )}

      {loading && <p className="table-loading">Loading sources...</p>}

      {!loading && sources.length === 0 && (
        <p className="table-empty">No active documents in the knowledge base.</p>
      )}

      {!loading && sources.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button className="btn-cancel" onClick={toggleAll} style={{ padding: '6px 14px' }}>
              {selected.size === sources.length ? 'Deselect All' : 'Select All'}
            </button>
            <span style={{ color: '#888', fontSize: 13 }}>
              {selected.size} of {sources.length} selected
            </span>
          </div>

          <table className="crud-table" style={{ marginBottom: 20 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Source</th>
                <th style={{ width: 90, textAlign: 'right' }}>Chunks</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(s => (
                <tr
                  key={s.source}
                  onClick={() => toggleSource(s.source)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(s.source)}
                      onChange={() => toggleSource(s.source)}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td>{s.source}</td>
                  <td style={{ textAlign: 'right' }}>{s.chunks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!confirming ? (
            <button
              className="btn-delete"
              style={{ padding: '8px 20px', fontSize: 14 }}
              onClick={() => setConfirming(true)}
              disabled={selected.size === 0}
            >
              Deactivate Selected ({selected.size})
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: '#c62828', fontWeight: 600, margin: 0 }}>
                Deactivate {selected.size} source(s)? Files will be moved to the deleted folder.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-delete"
                  style={{ padding: '8px 20px' }}
                  onClick={handleDeactivate}
                  disabled={busy}
                >
                  {busy ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  className="btn-cancel"
                  style={{ padding: '8px 20px' }}
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </ContentCard>
  );
}

export default ClearView;

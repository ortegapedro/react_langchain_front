import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import StatTile from '../../../components/StatTile';
import { getRagStatus } from '../services/rag';

function StatusView({ onSessionExpired }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(() => {
    setLoading(true);
    setError('');
    getRagStatus()
      .then(data => setStatus(data))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load knowledge base status.');
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  return (
    <ContentCard title="Knowledge Base Status">
      {loading && <p className="table-loading">Loading...</p>}
      {error && <div className="table-error">{error}</div>}
      {!loading && !error && status && (
        <>
          <div className="stat-grid">
            <StatTile value={status.total_chunks} label="Indexed Chunks" />
            <StatTile
              value={status.indexed ? 'Ready' : 'Empty'}
              label="State"
            />
          </div>
          {!status.indexed && (
            <p className="table-empty">
              No documents indexed yet. Use Upload to add content.
            </p>
          )}
        </>
      )}
      <button className="submit-btn" style={{ marginTop: 24 }} onClick={fetchStatus} disabled={loading}>
        Refresh
      </button>
    </ContentCard>
  );
}

export default StatusView;

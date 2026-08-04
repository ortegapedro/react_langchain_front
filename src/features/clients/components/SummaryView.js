import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import StatTile from '../../../components/StatTile';
import { getClients } from '../services/client';

const COLUMNS = [
  { key: 'id',      label: '#' },
  { key: 'name',    label: 'Name' },
  { key: 'surname', label: 'Surname' },
  { key: 'age',     label: 'Age' },
  { key: 'email',   label: 'Email' },
];

function SummaryView({ onSessionExpired }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getClients()
      .then(res => setData(res))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load clients.');
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <ContentCard title="Summary">
      {loading && <p className="table-loading">Loading...</p>}
      {error && <div className="table-error">{error}</div>}
      {!loading && !error && data && (
        <>
          <div className="stat-grid">
            <StatTile value={data.total} label="Total Clients" />
          </div>
          {data.clients.length > 0 && (
            <>
              <h3 className="summary-table-title">All Clients</h3>
              <CrudTable columns={COLUMNS} rows={data.clients} />
            </>
          )}
          {data.clients.length === 0 && (
            <p className="table-empty">No clients yet. Use Insert to add one.</p>
          )}
        </>
      )}
    </ContentCard>
  );
}

export default SummaryView;

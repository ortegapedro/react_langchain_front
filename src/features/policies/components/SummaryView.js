import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import StatTile from '../../../components/StatTile';
import { getPolizas } from '../services/poliza';

const COLUMNS = [
  { key: 'id',           label: '#' },
  { key: 'cliente',      label: 'Client' },
  { key: 'numero_poliza', label: 'Policy Number' },
];

function SummaryView({ onSessionExpired }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getPolizas()
      .then(res => setData(res))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load policies.');
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
            <StatTile value={data.total} label="Total Policies" />
          </div>
          {data.polizas.length > 0 && (
            <>
              <h3 className="summary-table-title">All Policies</h3>
              <CrudTable columns={COLUMNS} rows={data.polizas} />
            </>
          )}
          {data.polizas.length === 0 && (
            <p className="table-empty">No policies yet. Use Insert to add one.</p>
          )}
        </>
      )}
    </ContentCard>
  );
}

export default SummaryView;

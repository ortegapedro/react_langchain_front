import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import StatTile from '../../../components/StatTile';
import { getInsurances } from '../services/insurance';

const COLUMNS = [
  { key: 'id',               label: '#' },
  { key: 'client',           label: 'Client' },
  { key: 'insurance_number', label: 'Insurance Number' },
];

function SummaryView({ onSessionExpired }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getInsurances()
      .then(res => setData(res))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load insurances.');
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
            <StatTile value={data.total} label="Total Insurances" />
          </div>
          {data.insurances.length > 0 && (
            <>
              <h3 className="summary-table-title">All Insurances</h3>
              <CrudTable columns={COLUMNS} rows={data.insurances} />
            </>
          )}
          {data.insurances.length === 0 && (
            <p className="table-empty">No insurances yet. Use Insert to add one.</p>
          )}
        </>
      )}
    </ContentCard>
  );
}

export default SummaryView;

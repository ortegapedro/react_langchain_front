import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import StatTile from '../../../components/StatTile';
import { getSuppliers } from '../services/supplier';

const COLUMNS = [
  { key: 'id',      label: '#' },
  { key: 'name',    label: 'Name' },
  { key: 'surname', label: 'Surname' },
  { key: 'age',     label: 'Age' },
  { key: 'email',   label: 'Email' },
  { key: 'company', label: 'Company' },
];

function SummaryView({ onSessionExpired }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getSuppliers()
      .then(res => setData(res))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load suppliers.');
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
            <StatTile value={data.total} label="Total Suppliers" />
          </div>
          {data.suppliers.length > 0 && (
            <>
              <h3 className="summary-table-title">All Suppliers</h3>
              <CrudTable columns={COLUMNS} rows={data.suppliers} />
            </>
          )}
          {data.suppliers.length === 0 && (
            <p className="table-empty">No suppliers yet. Use Insert to add one.</p>
          )}
        </>
      )}
    </ContentCard>
  );
}

export default SummaryView;

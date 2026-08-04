import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import { getPolizas } from './api/poliza';

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
    <div className="content-card">
      <h2>Summary</h2>

      {loading && <p className="table-loading">Loading...</p>}
      {error && <div className="table-error">{error}</div>}

      {!loading && !error && data && (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-number">{data.total}</div>
              <div className="stat-label">Total Policies</div>
            </div>
          </div>

          {data.polizas.length > 0 ? (
            <>
              <h3 className="summary-table-title">All Policies</h3>
              <table className="policy-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Policy Number</th>
                  </tr>
                </thead>
                <tbody>
                  {data.polizas.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.cliente}</td>
                      <td>{p.numero_poliza}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="table-empty">No policies yet. Use Insert to add one.</p>
          )}
        </>
      )}
    </div>
  );
}

export default SummaryView;

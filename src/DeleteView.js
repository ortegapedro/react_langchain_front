import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import { getPolizas, deletePoliza } from './api/poliza';

function DeleteView({ onSessionExpired }) {
  const [polizas, setPolizas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getPolizas()
      .then(res => setPolizas(res.polizas))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load policies.');
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this policy? This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await deletePoliza(id);
      setPolizas(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to delete policy. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="content-card">
      <h2>Delete Policy</h2>
      {error && <div className="table-error">{error}</div>}

      {loading ? (
        <p className="table-loading">Loading...</p>
      ) : polizas.length === 0 ? (
        <p className="table-empty">No policies found.</p>
      ) : (
        <table className="policy-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Policy Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {polizas.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.cliente}</td>
                <td>{p.numero_poliza}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DeleteView;

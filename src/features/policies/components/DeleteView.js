import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import { getPolizas, deletePoliza } from '../services/poliza';

const COLUMNS = [
  { key: 'id',           label: '#' },
  { key: 'cliente',      label: 'Client' },
  { key: 'numero_poliza', label: 'Policy Number' },
];

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
    <ContentCard title="Delete Policy">
      {error && <div className="table-error">{error}</div>}
      <CrudTable
        columns={COLUMNS}
        rows={polizas}
        loading={loading}
        emptyMessage="No policies found."
        renderActions={p => (
          <button
            className="btn-delete"
            onClick={() => handleDelete(p.id)}
            disabled={deletingId === p.id}
          >
            {deletingId === p.id ? 'Deleting...' : 'Delete'}
          </button>
        )}
      />
    </ContentCard>
  );
}

export default DeleteView;

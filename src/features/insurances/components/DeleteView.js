import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import { getInsurances, deleteInsurance } from '../services/insurance';

const COLUMNS = [
  { key: 'id',               label: '#' },
  { key: 'client',           label: 'Client' },
  { key: 'insurance_number', label: 'Insurance Number' },
];

function DeleteView({ onSessionExpired }) {
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getInsurances()
      .then(res => setInsurances(res.insurances))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load insurances.');
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this insurance? This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteInsurance(id);
      setInsurances(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to delete insurance. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ContentCard title="Delete Insurance">
      {error && <div className="table-error">{error}</div>}
      <CrudTable
        columns={COLUMNS}
        rows={insurances}
        loading={loading}
        emptyMessage="No insurances found."
        renderActions={ins => (
          <button
            className="btn-delete"
            onClick={() => handleDelete(ins.id)}
            disabled={deletingId === ins.id}
          >
            {deletingId === ins.id ? 'Deleting...' : 'Delete'}
          </button>
        )}
      />
    </ContentCard>
  );
}

export default DeleteView;

import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import { getSuppliers, deleteSupplier } from '../services/supplier';

const COLUMNS = [
  { key: 'id',      label: '#' },
  { key: 'name',    label: 'Name' },
  { key: 'surname', label: 'Surname' },
  { key: 'age',     label: 'Age' },
  { key: 'email',   label: 'Email' },
  { key: 'company', label: 'Company' },
];

function DeleteView({ onSessionExpired }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getSuppliers()
      .then(res => setSuppliers(res.suppliers))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load suppliers.');
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier? This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to delete supplier. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ContentCard title="Delete Supplier">
      {error && <div className="table-error">{error}</div>}
      <CrudTable
        columns={COLUMNS}
        rows={suppliers}
        loading={loading}
        emptyMessage="No suppliers found."
        renderActions={s => (
          <button
            className="btn-delete"
            onClick={() => handleDelete(s.id)}
            disabled={deletingId === s.id}
          >
            {deletingId === s.id ? 'Deleting...' : 'Delete'}
          </button>
        )}
      />
    </ContentCard>
  );
}

export default DeleteView;

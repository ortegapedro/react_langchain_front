import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import CrudTable from '../../../components/CrudTable';
import { getClients, deleteClient } from '../services/client';

const COLUMNS = [
  { key: 'id',      label: '#' },
  { key: 'name',    label: 'Name' },
  { key: 'surname', label: 'Surname' },
  { key: 'age',     label: 'Age' },
  { key: 'email',   label: 'Email' },
];

function DeleteView({ onSessionExpired }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    getClients()
      .then(res => setClients(res.clients))
      .catch(err => {
        if (err.code === 'SESSION_EXPIRED') onSessionExpired();
        else setError('Failed to load clients.');
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to delete client. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ContentCard title="Delete Client">
      {error && <div className="table-error">{error}</div>}
      <CrudTable
        columns={COLUMNS}
        rows={clients}
        loading={loading}
        emptyMessage="No clients found."
        renderActions={c => (
          <button
            className="btn-delete"
            onClick={() => handleDelete(c.id)}
            disabled={deletingId === c.id}
          >
            {deletingId === c.id ? 'Deleting...' : 'Delete'}
          </button>
        )}
      />
    </ContentCard>
  );
}

export default DeleteView;

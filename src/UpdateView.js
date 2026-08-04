import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import { getPolizas, updatePoliza } from './api/poliza';

function UpdateView({ onSessionExpired }) {
  const [polizas, setPolizas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ cliente: '', numero_poliza: '' });
  const [saving, setSaving] = useState(false);

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

  const startEdit = (policy) => {
    setEditingId(policy.id);
    setEditValues({ cliente: policy.cliente, numero_poliza: policy.numero_poliza });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ cliente: '', numero_poliza: '' });
  };

  const handleSave = async (id) => {
    if (!editValues.cliente.trim() || !editValues.numero_poliza.trim()) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await updatePoliza(id, editValues);
      setPolizas(prev => prev.map(p => p.id === id ? res.data : p));
      cancelEdit();
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to update policy. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-card">
      <h2>Update Policy</h2>
      {error && <div className="table-error">{error}</div>}

      {loading ? (
        <p className="table-loading">Loading...</p>
      ) : polizas.length === 0 ? (
        <p className="table-empty">No policies found. Use Insert to add one.</p>
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
            {polizas.map(p =>
              editingId === p.id ? (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <input
                      value={editValues.cliente}
                      onChange={e => setEditValues(v => ({ ...v, cliente: e.target.value }))}
                      autoFocus
                    />
                  </td>
                  <td>
                    <input
                      value={editValues.numero_poliza}
                      onChange={e => setEditValues(v => ({ ...v, numero_poliza: e.target.value }))}
                    />
                  </td>
                  <td>
                    <button className="btn-save" onClick={() => handleSave(p.id)} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-cancel" onClick={cancelEdit} disabled={saving}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.cliente}</td>
                  <td>{p.numero_poliza}</td>
                  <td>
                    <button className="btn-edit" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UpdateView;

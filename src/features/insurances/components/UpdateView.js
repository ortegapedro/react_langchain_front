import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import '../../../components/shared.css';
import { getInsurances, updateInsurance } from '../services/insurance';

function UpdateView({ onSessionExpired }) {
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [editingId, setEditingId]   = useState(null);
  const [editValues, setEditValues] = useState({ client: '', insurance_number: '' });
  const [saving, setSaving]         = useState(false);

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

  const startEdit = (ins) => {
    setEditingId(ins.id);
    setEditValues({ client: ins.client, insurance_number: ins.insurance_number });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ client: '', insurance_number: '' });
  };

  const handleSave = async (id) => {
    if (!editValues.client.trim() || !editValues.insurance_number.trim()) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await updateInsurance(id, editValues);
      setInsurances(prev => prev.map(i => i.id === id ? res.data : i));
      cancelEdit();
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to update insurance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentCard title="Update Insurance">
      {error && <div className="table-error">{error}</div>}
      {loading ? (
        <p className="table-loading">Loading...</p>
      ) : insurances.length === 0 ? (
        <p className="table-empty">No insurances found. Use Insert to add one.</p>
      ) : (
        <table className="crud-table">
          <thead>
            <tr><th>#</th><th>Client</th><th>Insurance Number</th><th>Action</th></tr>
          </thead>
          <tbody>
            {insurances.map(ins =>
              editingId === ins.id ? (
                <tr key={ins.id}>
                  <td>{ins.id}</td>
                  <td>
                    <input
                      value={editValues.client}
                      onChange={e => setEditValues(v => ({ ...v, client: e.target.value }))}
                      autoFocus
                    />
                  </td>
                  <td>
                    <input
                      value={editValues.insurance_number}
                      onChange={e => setEditValues(v => ({ ...v, insurance_number: e.target.value }))}
                    />
                  </td>
                  <td>
                    <button className="btn-save" onClick={() => handleSave(ins.id)} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-cancel" onClick={cancelEdit} disabled={saving}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={ins.id}>
                  <td>{ins.id}</td>
                  <td>{ins.client}</td>
                  <td>{ins.insurance_number}</td>
                  <td><button className="btn-edit" onClick={() => startEdit(ins)}>Edit</button></td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </ContentCard>
  );
}

export default UpdateView;

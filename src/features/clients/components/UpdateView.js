import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import '../../../components/shared.css';
import { getClients, updateClient } from '../services/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UpdateView({ onSessionExpired }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', surname: '', age: '', email: '' });
  const [saving, setSaving] = useState(false);

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

  const startEdit = (client) => {
    setEditingId(client.id);
    setEditValues({ name: client.name, surname: client.surname, age: String(client.age), email: client.email });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', surname: '', age: '', email: '' });
  };

  const handleSave = async (id) => {
    if (!editValues.name.trim() || !editValues.surname.trim() || !editValues.age || !editValues.email.trim()) {
      setError('All fields are required.'); return;
    }
    const age = Number(editValues.age);
    if (!Number.isInteger(age) || age <= 0) { setError('Age must be a positive integer.'); return; }
    if (!EMAIL_RE.test(editValues.email.trim())) { setError('Enter a valid email address.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await updateClient(id, { name: editValues.name.trim(), surname: editValues.surname.trim(), age, email: editValues.email.trim() });
      setClients(prev => prev.map(c => c.id === id ? res.data : c));
      cancelEdit();
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to update client.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field) => (e) => setEditValues(v => ({ ...v, [field]: e.target.value }));

  return (
    <ContentCard title="Update Client">
      {error && <div className="table-error">{error}</div>}
      {loading ? (
        <p className="table-loading">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="table-empty">No clients found. Use Insert to add one.</p>
      ) : (
        <table className="crud-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Surname</th><th>Age</th><th>Email</th><th>Action</th></tr>
          </thead>
          <tbody>
            {clients.map(c =>
              editingId === c.id ? (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><input value={editValues.name} onChange={setField('name')} autoFocus /></td>
                  <td><input value={editValues.surname} onChange={setField('surname')} /></td>
                  <td><input type="number" min="1" step="1" value={editValues.age} onChange={setField('age')} /></td>
                  <td><input type="email" value={editValues.email} onChange={setField('email')} /></td>
                  <td>
                    <button className="btn-save" onClick={() => handleSave(c.id)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    <button className="btn-cancel" onClick={cancelEdit} disabled={saving}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={c.id}>
                  <td>{c.id}</td><td>{c.name}</td><td>{c.surname}</td><td>{c.age}</td><td>{c.email}</td>
                  <td><button className="btn-edit" onClick={() => startEdit(c)}>Edit</button></td>
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

import React, { useState, useEffect, useCallback } from 'react';
import ContentCard from '../../../components/ContentCard';
import '../../../components/shared.css';
import { getSuppliers, updateSupplier } from '../services/supplier';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UpdateView({ onSessionExpired }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', surname: '', age: '', email: '', company: '' });
  const [saving, setSaving] = useState(false);

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

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditValues({ name: s.name, surname: s.surname, age: String(s.age), email: s.email, company: s.company });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', surname: '', age: '', email: '', company: '' });
  };

  const handleSave = async (id) => {
    const { name, surname, age, email, company } = editValues;
    if (!name.trim() || !surname.trim() || !age || !email.trim() || !company.trim()) {
      setError('All fields are required.'); return;
    }
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum <= 0) { setError('Age must be a positive integer.'); return; }
    if (!EMAIL_RE.test(email.trim())) { setError('Enter a valid email address.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await updateSupplier(id, { name: name.trim(), surname: surname.trim(), age: ageNum, email: email.trim(), company: company.trim() });
      setSuppliers(prev => prev.map(s => s.id === id ? res.data : s));
      cancelEdit();
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setError('Failed to update supplier.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field) => (e) => setEditValues(v => ({ ...v, [field]: e.target.value }));

  return (
    <ContentCard title="Update Supplier">
      {error && <div className="table-error">{error}</div>}
      {loading ? (
        <p className="table-loading">Loading...</p>
      ) : suppliers.length === 0 ? (
        <p className="table-empty">No suppliers found. Use Insert to add one.</p>
      ) : (
        <table className="crud-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Surname</th><th>Age</th><th>Email</th><th>Company</th><th>Action</th></tr>
          </thead>
          <tbody>
            {suppliers.map(s =>
              editingId === s.id ? (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td><input value={editValues.name} onChange={setField('name')} autoFocus /></td>
                  <td><input value={editValues.surname} onChange={setField('surname')} /></td>
                  <td><input type="number" min="1" step="1" value={editValues.age} onChange={setField('age')} /></td>
                  <td><input type="email" value={editValues.email} onChange={setField('email')} /></td>
                  <td><input value={editValues.company} onChange={setField('company')} /></td>
                  <td>
                    <button className="btn-save" onClick={() => handleSave(s.id)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    <button className="btn-cancel" onClick={cancelEdit} disabled={saving}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id}>
                  <td>{s.id}</td><td>{s.name}</td><td>{s.surname}</td><td>{s.age}</td><td>{s.email}</td><td>{s.company}</td>
                  <td><button className="btn-edit" onClick={() => startEdit(s)}>Edit</button></td>
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

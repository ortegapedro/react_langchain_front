import React, { useState } from 'react';
import { createClient } from '../services/client';
import '../../../components/shared.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ClientForm({ onSessionExpired }) {
  const [form, setForm] = useState({ name: '', surname: '', age: '', email: '' });
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || !form.surname.trim() || !form.age || !form.email.trim())
      return 'All fields are required.';
    const age = Number(form.age);
    if (!Number.isInteger(age) || age <= 0)
      return 'Age must be a positive integer.';
    if (!EMAIL_RE.test(form.email.trim()))
      return 'Enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const err = validate();
    if (err) { setStatus({ type: 'error', message: err }); return; }

    setIsLoading(true);
    try {
      await createClient({ name: form.name.trim(), surname: form.surname.trim(), age: Number(form.age), email: form.email.trim() });
      setStatus({ type: 'success', message: 'Client saved successfully.' });
      setForm({ name: '', surname: '', age: '', email: '' });
    } catch (e) {
      if (e.code === 'SESSION_EXPIRED') onSessionExpired();
      else setStatus({ type: 'error', message: 'Failed to save client. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="crud-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="cli-name">Name</label>
        <input id="cli-name" type="text" value={form.name} onChange={set('name')} placeholder="First name" />
      </div>
      <div className="form-group">
        <label htmlFor="cli-surname">Surname</label>
        <input id="cli-surname" type="text" value={form.surname} onChange={set('surname')} placeholder="Last name" />
      </div>
      <div className="form-group">
        <label htmlFor="cli-age">Age</label>
        <input id="cli-age" type="number" min="1" step="1" value={form.age} onChange={set('age')} placeholder="Age" />
      </div>
      <div className="form-group">
        <label htmlFor="cli-email">Email</label>
        <input id="cli-email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
      </div>
      {status && <div className={`form-status ${status.type}`}>{status.message}</div>}
      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Client'}
      </button>
    </form>
  );
}

export default ClientForm;

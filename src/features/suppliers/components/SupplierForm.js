import React, { useState } from 'react';
import { createSupplier } from '../services/supplier';
import '../../../components/shared.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SupplierForm({ onSessionExpired }) {
  const [form, setForm] = useState({ name: '', surname: '', age: '', email: '', company: '' });
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || !form.surname.trim() || !form.age || !form.email.trim() || !form.company.trim())
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
      await createSupplier({
        name: form.name.trim(),
        surname: form.surname.trim(),
        age: Number(form.age),
        email: form.email.trim(),
        company: form.company.trim(),
      });
      setStatus({ type: 'success', message: 'Supplier saved successfully.' });
      setForm({ name: '', surname: '', age: '', email: '', company: '' });
    } catch (e) {
      if (e.code === 'SESSION_EXPIRED') onSessionExpired();
      else setStatus({ type: 'error', message: 'Failed to save supplier. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="crud-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="sup-name">Name</label>
        <input id="sup-name" type="text" value={form.name} onChange={set('name')} placeholder="First name" />
      </div>
      <div className="form-group">
        <label htmlFor="sup-surname">Surname</label>
        <input id="sup-surname" type="text" value={form.surname} onChange={set('surname')} placeholder="Last name" />
      </div>
      <div className="form-group">
        <label htmlFor="sup-age">Age</label>
        <input id="sup-age" type="number" min="1" step="1" value={form.age} onChange={set('age')} placeholder="Age" />
      </div>
      <div className="form-group">
        <label htmlFor="sup-email">Email</label>
        <input id="sup-email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
      </div>
      <div className="form-group">
        <label htmlFor="sup-company">Company</label>
        <input id="sup-company" type="text" value={form.company} onChange={set('company')} placeholder="Company name" />
      </div>
      {status && <div className={`form-status ${status.type}`}>{status.message}</div>}
      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Supplier'}
      </button>
    </form>
  );
}

export default SupplierForm;

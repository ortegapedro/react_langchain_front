import React, { useState } from 'react';
import { createPoliza } from './api/poliza';
import './PolicyForm.css';

function PolicyForm({ onSessionExpired }) {
  const [cliente, setCliente] = useState('');
  const [numeroPoliza, setNumeroPoliza] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!cliente.trim() || !numeroPoliza.trim()) {
      setStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }

    setIsLoading(true);
    try {
      await createPoliza({ cliente, numero_poliza: numeroPoliza });
      setStatus({ type: 'success', message: 'Policy saved successfully.' });
      setCliente('');
      setNumeroPoliza('');
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') {
        onSessionExpired();
      } else {
        setStatus({ type: 'error', message: 'Failed to save policy. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="policy-section">
      <h3>New Policy</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cliente">Client</label>
          <input
            id="cliente"
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Enter client name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="numero_poliza">Policy Number</label>
          <input
            id="numero_poliza"
            type="text"
            value={numeroPoliza}
            onChange={(e) => setNumeroPoliza(e.target.value)}
            placeholder="Enter policy number"
          />
        </div>
        {status && (
          <div className={`form-status ${status.type}`}>{status.message}</div>
        )}
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Policy'}
        </button>
      </form>
    </div>
  );
}

export default PolicyForm;

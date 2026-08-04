import React, { useState } from 'react';
import { createInsurance } from '../services/insurance';
import '../../../components/shared.css';

function InsuranceForm({ onSessionExpired }) {
  const [client, setClient]                   = useState('');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [status, setStatus]                   = useState(null);
  const [isLoading, setIsLoading]             = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!client.trim() || !insuranceNumber.trim()) {
      setStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }

    setIsLoading(true);
    try {
      await createInsurance({ client, insurance_number: insuranceNumber });
      setStatus({ type: 'success', message: 'Insurance saved successfully.' });
      setClient('');
      setInsuranceNumber('');
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') onSessionExpired();
      else setStatus({ type: 'error', message: 'Failed to save insurance. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="crud-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="ins-client">Client</label>
        <input
          id="ins-client"
          type="text"
          value={client}
          onChange={e => setClient(e.target.value)}
          placeholder="Enter client name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="ins-number">Insurance Number</label>
        <input
          id="ins-number"
          type="text"
          value={insuranceNumber}
          onChange={e => setInsuranceNumber(e.target.value)}
          placeholder="Enter insurance number"
        />
      </div>
      {status && <div className={`form-status ${status.type}`}>{status.message}</div>}
      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Insurance'}
      </button>
    </form>
  );
}

export default InsuranceForm;

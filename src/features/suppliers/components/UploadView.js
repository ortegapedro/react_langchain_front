import React, { useState, useRef } from 'react';
import ContentCard from '../../../components/ContentCard';
import { extractSupplierDoc, createSupplier } from '../services/supplier';
import '../../../components/shared.css';

const EMPTY   = { name: '', surname: '', age: '', email: '', company: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const METHODS = [
  {
    key:   'documentai',
    label: 'Extract with Document AI',
    hint:  'Best for structured forms with labelled fields',
  },
  {
    key:   'gemini',
    label: 'Extract with Gemini',
    hint:  'Works on any layout, including scanned / image-only PDFs',
  },
];

function UploadView({ onSessionExpired }) {
  const [file, setFile]         = useState(null);
  const [busy, setBusy]         = useState(null);   // null | 'documentai' | 'gemini'
  const [form, setForm]         = useState(EMPTY);
  const [rawFields, setRawFields] = useState([]);
  const [showRaw, setShowRaw]   = useState(false);
  const [usedMethod, setUsedMethod] = useState(null);
  const [extracted, setExtracted] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [status, setStatus]     = useState(null);
  const fileRef = useRef();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleExtract = async (method) => {
    if (!file) { setStatus({ type: 'error', message: 'Select a PDF file first.' }); return; }
    setBusy(method);
    setStatus(null);
    setExtracted(false);
    try {
      const result = await extractSupplierDoc(file, method);
      const f = result.fields || {};
      setForm({
        name:    f.name    || '',
        surname: f.surname || '',
        age:     f.age     || '',
        email:   f.email   || '',
        company: f.company || '',
      });
      setRawFields(result.raw || []);
      setUsedMethod(method);
      setExtracted(true);
      const methodLabel = METHODS.find(m => m.key === method)?.label ?? method;
      setStatus({
        type: 'success',
        message: `Data extracted from "${file.name}" using ${methodLabel}. Review the fields below and save.`,
      });
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') { onSessionExpired(); return; }
      setStatus({ type: 'error', message: err.message });
    } finally {
      setBusy(null);
    }
  };

  const validate = () => {
    if (!form.name.trim() || !form.surname.trim() || !form.age || !form.email.trim() || !form.company.trim())
      return 'All fields are required.';
    if (!Number.isInteger(Number(form.age)) || Number(form.age) <= 0)
      return 'Age must be a positive integer.';
    if (!EMAIL_RE.test(form.email.trim()))
      return 'Enter a valid email address.';
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setStatus({ type: 'error', message: err }); return; }
    setSaving(true);
    setStatus(null);
    try {
      await createSupplier({
        name:    form.name.trim(),
        surname: form.surname.trim(),
        age:     Number(form.age),
        email:   form.email.trim(),
        company: form.company.trim(),
      });
      setStatus({ type: 'success', message: 'Supplier saved successfully.' });
      setForm(EMPTY);
      setFile(null);
      setExtracted(false);
      setRawFields([]);
      setUsedMethod(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') { onSessionExpired(); return; }
      setStatus({ type: 'error', message: 'Failed to save supplier.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentCard title="Upload Supplier Document">
      {status && (
        <div className={`form-status ${status.type}`} style={{ marginBottom: 16 }}>
          {status.message}
        </div>
      )}

      {/* Step 1 — file picker + two extraction buttons */}
      <div className="crud-form">
        <div className="form-group">
          <label>PDF Document</label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            style={{ padding: '8px 0' }}
            onChange={e => {
              setFile(e.target.files[0] || null);
              setExtracted(false);
              setStatus(null);
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        {METHODS.map(m => (
          <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              className="submit-btn"
              style={{ width: 'auto', padding: '10px 20px' }}
              onClick={() => handleExtract(m.key)}
              disabled={busy !== null || !file}
            >
              {busy === m.key ? 'Extracting…' : m.label}
            </button>
            <span style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>{m.hint}</span>
          </div>
        ))}
      </div>

      {/* Step 2 — editable form pre-filled from extraction */}
      {extracted && (
        <>
          <hr style={{ border: 'none', borderTop: '2px solid #f0f0f0', margin: '0 0 24px' }} />

          {usedMethod && (
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
              Extracted via <strong>{METHODS.find(m => m.key === usedMethod)?.label}</strong>.
              Correct any mistakes then save.
            </p>
          )}

          <form className="crud-form" onSubmit={handleSave}>
            {[
              { id: 'up-name',    field: 'name',    label: 'Name',    type: 'text',   ph: 'First name' },
              { id: 'up-surname', field: 'surname', label: 'Surname', type: 'text',   ph: 'Last name' },
              { id: 'up-age',     field: 'age',     label: 'Age',     type: 'number', ph: 'Age' },
              { id: 'up-email',   field: 'email',   label: 'Email',   type: 'email',  ph: 'email@example.com' },
              { id: 'up-company', field: 'company', label: 'Company', type: 'text',   ph: 'Company name' },
            ].map(({ id, field, label, type, ph }) => (
              <div className="form-group" key={field}>
                <label htmlFor={id}>{label}</label>
                <input
                  id={id}
                  type={type}
                  value={form[field]}
                  onChange={set(field)}
                  placeholder={ph}
                  min={type === 'number' ? '1' : undefined}
                  step={type === 'number' ? '1' : undefined}
                />
              </div>
            ))}
            <button className="submit-btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Supplier'}
            </button>
          </form>

          {/* Raw fields toggle */}
          {rawFields.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <button
                className="btn-cancel"
                style={{ padding: '5px 14px', fontSize: 13 }}
                onClick={() => setShowRaw(v => !v)}
                type="button"
              >
                {showRaw ? 'Hide' : 'Show'} raw extracted fields ({rawFields.length})
              </button>
              {showRaw && (
                <table className="crud-table" style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                      <th style={{ width: 90, textAlign: 'right' }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawFields.map((f, i) => (
                      <tr key={i}>
                        <td>{f.key}</td>
                        <td style={{ wordBreak: 'break-word', maxWidth: 320 }}>{f.value}</td>
                        <td style={{ textAlign: 'right' }}>{(f.confidence * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </ContentCard>
  );
}

export default UploadView;

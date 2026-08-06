import React, { useState, useRef } from 'react';
import ContentCard from '../../../components/ContentCard';
import { uploadFile, uploadText } from '../services/rag';
import '../../../components/shared.css';

const ACCEPTED = '.txt,.pdf,.md';

function UploadView({ onSessionExpired }) {
  const [mode, setMode] = useState('file'); // 'file' | 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const reset = () => {
    setFile(null);
    setText('');
    setSource('');
    setStatus(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      let result;
      if (mode === 'file') {
        if (!file) { setStatus({ type: 'error', message: 'Select a file first.' }); return; }
        result = await uploadFile(file);
      } else {
        if (!text.trim()) { setStatus({ type: 'error', message: 'Enter some text.' }); return; }
        result = await uploadText(text.trim(), source.trim() || 'manual input');
      }
      setStatus({
        type: 'success',
        message: `Indexed ${result.chunks_added} chunk(s). Total in store: ${result.total_chunks}.`,
      });
      reset();
    } catch (err) {
      if (err.code === 'SESSION_EXPIRED') { onSessionExpired(); return; }
      setStatus({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ContentCard title="Upload to Knowledge Base">
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          className={mode === 'file' ? 'btn-save' : 'btn-cancel'}
          onClick={() => { setMode('file'); reset(); }}
          type="button"
        >
          File
        </button>
        <button
          className={mode === 'text' ? 'btn-save' : 'btn-cancel'}
          onClick={() => { setMode('text'); reset(); }}
          type="button"
        >
          Raw Text
        </button>
      </div>

      {status && (
        <div className={`form-status ${status.type}`}>{status.message}</div>
      )}

      <form className="crud-form" onSubmit={handleSubmit}>
        {mode === 'file' ? (
          <div className="form-group">
            <label>Document ({ACCEPTED})</label>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED}
              onChange={e => setFile(e.target.files[0] || null)}
              style={{ padding: '8px 0' }}
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Source label (optional)</label>
              <input
                type="text"
                placeholder="e.g. product-faq-v2"
                value={source}
                onChange={e => setSource(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Text content</label>
              <textarea
                rows={8}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '2px solid #e0e0e0',
                  borderRadius: 5,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                placeholder="Paste the text you want to index..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
            </div>
          </>
        )}
        <button className="submit-btn" type="submit" disabled={busy}>
          {busy ? 'Uploading...' : 'Upload & Index'}
        </button>
      </form>
    </ContentCard>
  );
}

export default UploadView;

import { authenticatedFetch, getToken } from '../../auth/services/auth';

const API = process.env.REACT_APP_API_URL;

function sessionExpiredError() {
  const err = new Error('Session expired');
  err.code = 'SESSION_EXPIRED';
  return err;
}

async function parseResponse(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  const text = await res.text();
  throw new Error(text || `Server error (${res.status})`);
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  // Do NOT set Content-Type — the browser must set it with the multipart boundary.
  const res = await fetch(`${API}/api/rag/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (res.status === 401) throw sessionExpiredError();
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function uploadText(text, source) {
  const res = await authenticatedFetch(`${API}/api/rag/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source }),
  });
  if (res.status === 401) throw sessionExpiredError();
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function getRagStatus() {
  const res = await authenticatedFetch(`${API}/api/rag/status`);
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to fetch RAG status');
  return res.json();
}

export async function getRagSources() {
  const res = await authenticatedFetch(`${API}/api/rag/sources`);
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json(); // { sources: [{source, chunks}] }
}

// sources: string[] of source names to deactivate; omit / null = deactivate all
export async function clearRag(sources = null) {
  const res = await authenticatedFetch(`${API}/api/rag/clear`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sources ? { sources } : {}),
  });
  if (res.status === 401) throw sessionExpiredError();
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to clear knowledge base');
  return data;
}

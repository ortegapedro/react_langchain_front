import { authenticatedFetch, getToken } from '../../auth/services/auth';

const API = process.env.REACT_APP_API_URL;

function sessionExpiredError() {
  const err = new Error('Session expired');
  err.code = 'SESSION_EXPIRED';
  return err;
}

export async function createSupplier(data) {
  const res = await authenticatedFetch(`${API}/api/supplier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to create supplier');
  return res.json();
}

export async function getSuppliers() {
  const res = await authenticatedFetch(`${API}/api/supplier`);
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}

export async function updateSupplier(id, data) {
  const res = await authenticatedFetch(`${API}/api/supplier/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to update supplier');
  return res.json();
}

export async function deleteSupplier(id) {
  const res = await authenticatedFetch(`${API}/api/supplier/${id}`, {
    method: 'DELETE',
  });
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to delete supplier');
  return res.json();
}

// Extract supplier fields from a PDF.
// method: 'documentai' (Form Parser) | 'gemini' (LLM, works on any layout)
export async function extractSupplierDoc(file, method = 'documentai') {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API}/api/supplier/extract?method=${method}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (res.status === 401) throw sessionExpiredError();
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : { error: await res.text() };
  if (!res.ok) throw new Error(data.error || 'Extraction failed');
  return data;
}

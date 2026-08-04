import { authenticatedFetch } from '../../auth/services/auth';

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

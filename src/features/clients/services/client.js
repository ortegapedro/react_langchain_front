import { authenticatedFetch } from '../../auth/services/auth';

const API = process.env.REACT_APP_API_URL;

function sessionExpiredError() {
  const err = new Error('Session expired');
  err.code = 'SESSION_EXPIRED';
  return err;
}

export async function createClient(data) {
  const res = await authenticatedFetch(`${API}/api/client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

export async function getClients() {
  const res = await authenticatedFetch(`${API}/api/client`);
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function updateClient(id, data) {
  const res = await authenticatedFetch(`${API}/api/client/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to update client');
  return res.json();
}

export async function deleteClient(id) {
  const res = await authenticatedFetch(`${API}/api/client/${id}`, {
    method: 'DELETE',
  });
  if (res.status === 401) throw sessionExpiredError();
  if (!res.ok) throw new Error('Failed to delete client');
  return res.json();
}

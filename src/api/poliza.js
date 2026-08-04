import { authenticatedFetch } from './auth';

const API_URL = process.env.REACT_APP_API_URL;

const sessionExpiredError = () => {
  const err = new Error('Session expired');
  err.code = 'SESSION_EXPIRED';
  return err;
};

export const createPoliza = async ({ cliente, numero_poliza }) => {
  const response = await authenticatedFetch(`${API_URL}/api/poliza`, {
    method: 'POST',
    body: JSON.stringify({ cliente, numero_poliza }),
  });
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const getPolizas = async () => {
  const response = await authenticatedFetch(`${API_URL}/api/poliza`);
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const updatePoliza = async (id, { cliente, numero_poliza }) => {
  const response = await authenticatedFetch(`${API_URL}/api/poliza/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ cliente, numero_poliza }),
  });
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const deletePoliza = async (id) => {
  const response = await authenticatedFetch(`${API_URL}/api/poliza/${id}`, {
    method: 'DELETE',
  });
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

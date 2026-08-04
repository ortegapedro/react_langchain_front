import { authenticatedFetch } from '../../auth/services/auth';

const API_URL = process.env.REACT_APP_API_URL;

const sessionExpiredError = () => {
  const err = new Error('Session expired');
  err.code = 'SESSION_EXPIRED';
  return err;
};

export const createInsurance = async ({ client, insurance_number }) => {
  const response = await authenticatedFetch(`${API_URL}/api/insurance`, {
    method: 'POST',
    body: JSON.stringify({ client, insurance_number }),
  });
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const getInsurances = async () => {
  const response = await authenticatedFetch(`${API_URL}/api/insurance`);
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const updateInsurance = async (id, { client, insurance_number }) => {
  const response = await authenticatedFetch(`${API_URL}/api/insurance/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ client, insurance_number }),
  });
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const deleteInsurance = async (id) => {
  const response = await authenticatedFetch(`${API_URL}/api/insurance/${id}`, {
    method: 'DELETE',
  });
  if (response.status === 401) throw sessionExpiredError();
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const API_URL = process.env.REACT_APP_API_URL;

export const sendLoginRequest = async (email, password) => {
  const response = await fetch(`${API_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getToken = () => localStorage.getItem('authToken');

export const getTokenExpiry = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
};

export const authenticatedFetch = (url, options = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL;

// ── Firebase flows ────────────────────────────────────────────────────────────

// Sign in with email + password via Firebase, then exchange for a Flask JWT.
export const signInWithFirebaseEmail = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken    = await credential.user.getIdToken();
  return _exchangeFirebaseToken(idToken);
};

// Sign in with Google popup, then exchange for a Flask JWT.
export const signInWithGoogle = async () => {
  const result  = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return _exchangeFirebaseToken(idToken);
};

// Create a new Firebase account, then exchange for a Flask JWT (auto-login).
export const signUpWithFirebaseEmail = async (email, password) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken    = await credential.user.getIdToken();
  return _exchangeFirebaseToken(idToken);
};

// Send a password-reset email via Firebase (no backend call needed).
export const sendPasswordReset = (email) => sendPasswordResetEmail(auth, email);

// Sign out of Firebase (clears its internal session).
export const firebaseSignOut = () => signOut(auth);

// Send the Firebase ID token to Flask and receive a short-lived Flask JWT.
const _exchangeFirebaseToken = async (idToken) => {
  const res = await fetch(`${API_URL}/api/auth/firebase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Auth failed (${res.status})`);
  }
  return res.json(); // { token, email, role }
};

// ── Token helpers (unchanged) ─────────────────────────────────────────────────

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
  firebaseSignOut().catch(() => {});
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

import { authenticatedFetch } from '../../auth/services/auth';

const API = process.env.REACT_APP_API_URL;

function handle401(res) {
  if (res.status === 401) {
    const err = new Error('Session expired');
    err.code = 'SESSION_EXPIRED';
    throw err;
  }
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendMessage(message, sessionId) {
  const res = await authenticatedFetch(`${API}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  handle401(res);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Chat request failed');
  }
  return res.json(); // { response, session_id }
}

export async function clearChat(sessionId) {
  const res = await authenticatedFetch(`${API}/api/chat/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  handle401(res);
  if (!res.ok) throw new Error('Failed to clear chat');
  return res.json();
}

// ── Session management ────────────────────────────────────────────────────────

export async function getSessions() {
  const res = await authenticatedFetch(`${API}/api/chat/sessions`);
  handle401(res);
  if (!res.ok) throw new Error('Failed to load sessions');
  return res.json(); // [{ id, name, created_at, last_activity, message_count }]
}

export async function createSession(name = 'New Chat') {
  const res = await authenticatedFetch(`${API}/api/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  handle401(res);
  if (!res.ok) throw new Error('Failed to create session');
  return res.json(); // { id, name, created_at, last_activity }
}

export async function getSessionMessages(sessionId) {
  const res = await authenticatedFetch(`${API}/api/chat/sessions/${sessionId}/messages`);
  handle401(res);
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json(); // [{ role, text }]
}

export async function deleteSession(sessionId) {
  const res = await authenticatedFetch(`${API}/api/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  handle401(res);
  if (!res.ok) throw new Error('Failed to delete session');
  return res.json();
}

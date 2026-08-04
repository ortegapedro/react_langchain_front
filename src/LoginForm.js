import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LoginForm.css';
import { sendLoginRequest, getTokenExpiry, clearSession } from './api/auth';
import Dashboard from './Dashboard';

function LoginForm() {
  const [email, setEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const expiry = getTokenExpiry();
    return expiry !== null && Date.now() < expiry;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const timers = useRef({ warning: null, expiry: null });

  const handleSessionExpired = useCallback(() => {
    clearTimeout(timers.current.warning);
    clearTimeout(timers.current.expiry);
    clearSession();
    setIsLoggedIn(false);
    setShowWarning(false);
    setSessionExpired(true);
  }, []);

  const logout = useCallback(() => {
    clearTimeout(timers.current.warning);
    clearTimeout(timers.current.expiry);
    clearSession();
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setError('');
    setShowWarning(false);
  }, []);

  // Set warning at 9 min, auto-logout at 10 min
  useEffect(() => {
    if (!isLoggedIn) return;

    const expiry = getTokenExpiry();
    if (!expiry || Date.now() >= expiry) {
      handleSessionExpired();
      return;
    }

    const remaining = expiry - Date.now();
    const warningDelay = remaining - 60000;

    timers.current.warning = warningDelay > 0
      ? setTimeout(() => setShowWarning(true), warningDelay)
      : (setShowWarning(true), null);

    timers.current.expiry = setTimeout(handleSessionExpired, remaining);

    return () => {
      clearTimeout(timers.current.warning);
      clearTimeout(timers.current.expiry);
    };
  }, [isLoggedIn, handleSessionExpired]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) { setError('Please fill in all fields'); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsLoading(true);
    try {
      const data = await sendLoginRequest(email, password);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);
      setIsLoggedIn(true);
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {sessionExpired && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">&#9201;</div>
            <h3>Session Expired</h3>
            <p>Your 10-minute session has ended. Please refresh to log in again.</p>
            <button className="modal-btn" onClick={() => setSessionExpired(false)}>
              Refresh
            </button>
          </div>
        </div>
      )}

      {isLoggedIn ? (
        <>
          {/* Fixed warning bar at top when session is about to expire */}
          {showWarning && (
            <div className="warning-bar">
              <span>Your session expires in less than 1 minute.</span>
              <button onClick={() => setShowWarning(false)}>Dismiss</button>
            </div>
          )}
          <Dashboard
            email={email}
            onLogout={logout}
            onSessionExpired={handleSessionExpired}
          />
        </>
      ) : (
        <div className="container">
          <div className="login-box">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p className="footer-text">
              Don't have an account? <a href="#signup">Sign up here</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginForm;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './LoginForm.css';
import {
  signInWithFirebaseEmail,
  signUpWithFirebaseEmail,
  signInWithGoogle,
  sendPasswordReset,
  getTokenExpiry,
  clearSession,
} from '../services/auth';
import AppDashboard from '../../../layouts/AppDashboard';

// Map Firebase error codes to user-friendly messages.
const _friendlyError = (err) => {
  const map = {
    'auth/user-not-found':        'No account found with that email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/invalid-credential':    'Incorrect email or password.',
    'auth/email-already-in-use':  'An account with that email already exists.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/too-many-requests':     'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user':  'Sign-in popup was closed. Please try again.',
  };
  const code = err?.code || '';
  return map[code] || err?.message || 'Something went wrong. Please try again.';
};

// ─────────────────────────────────────────────────────────────────────────────

function LoginForm() {
  // view: 'login' | 'signup' | 'forgot'
  const [view, setView]               = useState('login');
  const [email, setEmail]             = useState(() => localStorage.getItem('userEmail') || '');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [isLoggedIn, setIsLoggedIn]   = useState(() => {
    const expiry = getTokenExpiry();
    return expiry !== null && Date.now() < expiry;
  });
  const [isLoading, setIsLoading]     = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const timers = useRef({ warning: null, expiry: null });

  // ── Session expiry timers ─────────────────────────────────────────────────
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

  useEffect(() => {
    if (!isLoggedIn) return;
    const expiry = getTokenExpiry();
    if (!expiry || Date.now() >= expiry) { handleSessionExpired(); return; }

    const remaining    = expiry - Date.now();
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const switchView = (v) => {
    setView(v);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const onAuthSuccess = (data) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userEmail', data.email);
    setEmail(data.email);
    setIsLoggedIn(true);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }

    setIsLoading(true);
    try {
      onAuthSuccess(await signInWithFirebaseEmail(email, password));
    } catch (err) {
      setError(_friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sign up ───────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setIsLoading(true);
    try {
      onAuthSuccess(await signUpWithFirebaseEmail(email, password));
    } catch (err) {
      setError(_friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email) { setError('Please enter your email address.'); return; }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccessMsg('Reset email sent! Check your inbox (and spam folder).');
    } catch (err) {
      setError(_friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      onAuthSuccess(await signInWithGoogle());
    } catch (err) {
      setError(_friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google SVG icon ───────────────────────────────────────────────────────
  const GoogleIcon = () => (
    <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {sessionExpired && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">&#9201;</div>
            <h3>Session Expired</h3>
            <p>Your session has ended. Please log in again.</p>
            <button className="modal-btn" onClick={() => setSessionExpired(false)}>OK</button>
          </div>
        </div>
      )}

      {isLoggedIn ? (
        <>
          {showWarning && (
            <div className="warning-bar">
              <span>Your session expires in less than 1 minute.</span>
              <button onClick={() => setShowWarning(false)}>Dismiss</button>
            </div>
          )}
          <AppDashboard
            email={email}
            onLogout={logout}
            onSessionExpired={handleSessionExpired}
          />
        </>
      ) : (
        <div className="container">
          <div className="login-box">

            {/* ── LOGIN VIEW ─────────────────────────────────────────────── */}
            {view === 'login' && (
              <>
                <h1>Sign in</h1>
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password" />
                    <button type="button" className="link-btn forgot-link"
                      onClick={() => switchView('forgot')}>
                      Forgot password?
                    </button>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button type="submit" className="login-btn" disabled={isLoading}>
                    {isLoading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <button className="google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                  <GoogleIcon />
                  Sign in with Google
                </button>

                <p className="footer-text">
                  Don't have an account?{' '}
                  <button type="button" className="link-btn" onClick={() => switchView('signup')}>
                    Sign up
                  </button>
                </p>
              </>
            )}

            {/* ── SIGN UP VIEW ───────────────────────────────────────────── */}
            {view === 'signup' && (
              <>
                <h1>Create account</h1>
                <form onSubmit={handleSignUp}>
                  <div className="form-group">
                    <label htmlFor="su-email">Email</label>
                    <input type="email" id="su-email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="su-password">Password</label>
                    <input type="password" id="su-password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="su-confirm">Confirm password</label>
                    <input type="password" id="su-confirm" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password" />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button type="submit" className="login-btn" disabled={isLoading}>
                    {isLoading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <button className="google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                  <GoogleIcon />
                  Sign up with Google
                </button>

                <p className="footer-text">
                  Already have an account?{' '}
                  <button type="button" className="link-btn" onClick={() => switchView('login')}>
                    Sign in
                  </button>
                </p>
              </>
            )}

            {/* ── FORGOT PASSWORD VIEW ───────────────────────────────────── */}
            {view === 'forgot' && (
              <>
                <h1>Reset password</h1>
                <p className="view-subtitle">
                  Enter your email and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="fp-email">Email</label>
                    <input type="email" id="fp-email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email" />
                  </div>
                  {error      && <div className="error-message">{error}</div>}
                  {successMsg && <div className="success-message">{successMsg}</div>}
                  <button type="submit" className="login-btn" disabled={isLoading || !!successMsg}>
                    {isLoading ? 'Sending…' : 'Send reset email'}
                  </button>
                </form>

                <p className="footer-text">
                  <button type="button" className="link-btn" onClick={() => switchView('login')}>
                    ← Back to sign in
                  </button>
                </p>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default LoginForm;

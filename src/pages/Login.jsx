import React, { useState } from 'react';
import { login, register } from '../utils/api';
import './Login.css';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = isRegister
        ? await register(username, password)
        : await login(username, password);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-page__orb login-page__orb--1"></div>
      <div className="login-page__orb login-page__orb--2"></div>
      <div className="login-page__orb login-page__orb--3"></div>

      <div className="login-card">
        <div className="login-card__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="100%" stopColor="#00b4d8" />
              </linearGradient>
            </defs>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <h1 className="login-card__title">Secret Messenger</h1>
        <p className="login-card__subtitle">
          {isRegister ? 'Create your secret account' : 'Welcome back, sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} className="login-card__form">
          <div className="login-card__field">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="login-card__input"
              id="login-username"
            />
          </div>

          <div className="login-card__field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="login-card__input"
              id="login-password"
            />
          </div>

          {error && <div className="login-card__error">{error}</div>}

          <button
            type="submit"
            className="login-card__submit"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <span className="login-card__spinner"></span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-card__toggle">
          <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

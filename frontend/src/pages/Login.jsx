import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import { API_URL } from '../config';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        
        const res = await fetch(`${API_URL}/api/users/google/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google login failed');

        login({
          username: data.username,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          token: data.token,
        });

        navigate('/');
      } catch (err) {
        setError(err.message || 'Google login failed');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login was unsuccessful.');
    }
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Check for hardcoded admin credentials
    if (form.username === 'Pavanraj' && form.password === 'Pavanraj@2751') {
      setTimeout(() => {
        login({
          username: 'Pavanraj',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@sareeshala.in',
          token: 'admin_token_123',
          role: 'admin'
        });
        navigate('/admin');
      }, 500);
      return;
    }

    try {
      // ── API call to Django backend ──
      const res = await fetch(`${API_URL}/api/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Invalid credentials');
      }

      // Store user in context + localStorage
      login({
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        token: data.token,
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login (no backend required)
  const demoLogin = () => {
    login({
      username: 'demo_user',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya@sareeShala.in',
      token: 'demo_token_123',
    });
    navigate('/');
  };

  return (
    <div className="auth-page">
      {/* Decorative background */}
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>

      <div className="auth-card animate-fade-in">
        {/* Back button */}
        <button className="auth-back" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Logo */}
        <div className="auth-logo text-gradient">SAREESHALA</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Error message */}
        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="form-group">
            <label htmlFor="login-username">Username or Email</label>
            <input
              id="login-username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              className="auth-input"
              autoComplete="username"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass((p) => !p)}
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="auth-extras">
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          {/* Submit */}
          <button id="login-submit-btn" type="submit" className="auth-submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-or">
          <span>or</span>
        </div>

        {/* Google sign in */}
        <button type="button" className="google-btn" onClick={() => handleGoogleLogin()} disabled={loading}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" className="google-icon" />
          Sign in with Google
        </button>

        {/* Demo login */}
        <button id="demo-login-btn" className="demo-btn" onClick={demoLogin}>
          ✨ Try Demo Account
        </button>

        {/* Sign up link */}
        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

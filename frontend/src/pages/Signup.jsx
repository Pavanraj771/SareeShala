import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, UserPlus, ArrowLeft, Loader2,
  Check, Mail, ShieldCheck
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/* ── Password strength helper ── */
const passwordStrength = (pwd) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ff4d4d', '#ffa500', '#f0c030', '#4caf50'];

/* ── OTP countdown hook ── */
const useCountdown = (initial = 60) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    setSeconds(initial);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);
  return { seconds, start };
};

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  /* ── Form state ── */
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    username: '', phone: '',
    password: '', confirmPassword: '',
    agreeTerms: false,
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const strength = passwordStrength(form.password);

  /* ── OTP state ── */
  const [otpSent, setOtpSent]         = useState(false);
  const [otpValue, setOtpValue]       = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  /* ── UI state ── */
  const [sendingOtp, setSendingOtp]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [otpError, setOtpError]       = useState('');

  const { seconds, start: startCountdown } = useCountdown(60);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        
        const res = await fetch('http://localhost:8000/api/users/google/', {
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
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  /* ── Validation ── */
  const validate = () => {
    if (!form.firstName || !form.lastName)    return 'Please enter your full name.';
    if (!form.email.includes('@'))            return 'Please enter a valid email.';
    if (!form.username || form.username.length < 3) return 'Username must be at least 3 characters.';
    if (form.password.length < 8)            return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.agreeTerms)                    return 'Please accept the terms & conditions.';
    return null;
  };

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async () => {
    const validationErr = validate();
    if (validationErr) { setError(validationErr); return; }

    setSendingOtp(true);
    setError('');
    setOtpError('');

    try {
      const res = await fetch('http://localhost:8000/api/users/send-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, purpose: 'registration' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');

      setOtpSent(true);
      setOtpValue('');
      setOtpVerified(false);
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  /* ── Step 2: Resend OTP ── */
  const handleResend = () => {
    setOtpValue('');
    setOtpVerified(false);
    setOtpError('');
    handleSendOtp();
  };

  /* ── Step 3: Verify OTP locally (final submit handles server-side verification) ── */
  const handleOtpChange = (val) => {
    setOtpValue(val);
    setOtpError('');
    setOtpVerified(false);
  };

  /* ── Final Submit: register with OTP ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) { setError('Please request an OTP first.'); return; }
    if (!otpValue || otpValue.length < 6) { setOtpError('Please enter the 6-digit OTP.'); return; }

    setLoading(true);
    setError('');
    setOtpError('');

    try {
      const res = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:   form.firstName,
          last_name:    form.lastName,
          email:        form.email,
          username:     form.username,
          phone_number: form.phone,
          password:     form.password,
          otp_code:     otpValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      setOtpVerified(true);
      login({
        username:  data.username,
        firstName: data.first_name,
        lastName:  data.last_name,
        email:     data.email,
        token:     data.token,
      });

      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('otp')) setOtpError(msg);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>

      <div className="auth-card auth-card-wide animate-fade-in">
        <button className="auth-back" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="auth-logo text-gradient">SAREESHALA</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join thousands of saree lovers ✨</p>

        {/* Progress indicator */}
        <div className="otp-progress">
          <div className={`otp-step ${true ? 'done' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Your Details</span>
          </div>
          <div className="step-line" />
          <div className={`otp-step ${otpSent ? 'done' : ''}`}>
            <span className="step-num">{otpSent ? '✓' : '2'}</span>
            <span className="step-label">Verify Email</span>
          </div>
          <div className="step-line" />
          <div className={`otp-step ${otpVerified ? 'done' : ''}`}>
            <span className="step-num">{otpVerified ? '✓' : '3'}</span>
            <span className="step-label">Done!</span>
          </div>
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* ── SECTION 1: User Details ── */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="signup-firstname">First Name</label>
              <input id="signup-firstname" name="firstName" type="text"
                placeholder="Priya" value={form.firstName} onChange={handleChange}
                className="auth-input" autoFocus disabled={otpSent} />
            </div>
            <div className="form-group">
              <label htmlFor="signup-lastname">Last Name</label>
              <input id="signup-lastname" name="lastName" type="text"
                placeholder="Sharma" value={form.lastName} onChange={handleChange}
                className="auth-input" disabled={otpSent} />
            </div>
          </div>

          {/* Email with send OTP inline */}
          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <div className="input-with-action">
              <input id="signup-email" name="email" type="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange}
                className={`auth-input ${otpSent ? 'input-success' : ''}`}
                autoComplete="email" disabled={otpSent} />
              {otpSent && <Check size={16} className="input-check" />}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="signup-username">Username</label>
              <input id="signup-username" name="username" type="text"
                placeholder="priya_sharma" value={form.username} onChange={handleChange}
                className="auth-input" autoComplete="username" disabled={otpSent} />
            </div>
            <div className="form-group">
              <label htmlFor="signup-phone">Phone (Optional)</label>
              <input id="signup-phone" name="phone" type="tel"
                placeholder="+91 98765 43210" value={form.phone} onChange={handleChange}
                className="auth-input" disabled={otpSent} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-wrapper">
              <input id="signup-password" name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters" value={form.password}
                onChange={handleChange} className="auth-input"
                autoComplete="new-password" disabled={otpSent} />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="strength-meter">
                <div className="strength-bars">
                  {[1,2,3,4].map(l => (
                    <div key={l} className="strength-bar"
                      style={{ background: strength >= l ? strengthColor[strength] : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <div className="input-wrapper">
              <input id="signup-confirm" name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password" value={form.confirmPassword}
                onChange={handleChange}
                className={`auth-input ${form.confirmPassword && form.password !== form.confirmPassword ? 'input-error' : ''} ${form.confirmPassword && form.password === form.confirmPassword ? 'input-success' : ''}`}
                autoComplete="new-password" disabled={otpSent} />
              <button type="button" className="toggle-pass" onClick={() => setShowConfirm(p => !p)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <Check size={16} className="input-check" />
              )}
            </div>
          </div>

          <label className="checkbox-label">
            <input id="signup-terms" type="checkbox" name="agreeTerms"
              checked={form.agreeTerms} onChange={handleChange}
              className="checkbox-input" disabled={otpSent} />
            <span className="checkbox-custom" />
            <span>
              I agree to the <Link to="/terms" className="auth-link">Terms of Service</Link>
              {' '}and{' '}<Link to="/privacy" className="auth-link">Privacy Policy</Link>
            </span>
          </label>

          {/* ── SEND OTP Button (before OTP is sent) ── */}
          {!otpSent && (
            <button
              id="send-otp-btn"
              type="button"
              className="send-otp-btn"
              onClick={handleSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp
                ? <><Loader2 size={18} className="spin" /> Sending OTP…</>
                : <><Mail size={18} /> Send OTP to Email</>
              }
            </button>
          )}

          {/* ── OTP Input Section (after OTP sent) ── */}
          {otpSent && (
            <div className="otp-section animate-fade-in">
              <div className="otp-banner">
                <ShieldCheck size={20} />
                <div>
                  <p className="otp-banner-title">OTP Sent!</p>
                  <p className="otp-banner-sub">
                    Check your email <strong>{form.email}</strong>
                    {' '}— enter the 6-digit code below.
                  </p>
                  <p className="otp-dev-hint">
                    🛠️ Dev mode: OTP is printed in the Django terminal.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-otp">6-Digit OTP</label>
                <OTPInput
                  id="signup-otp"
                  value={otpValue}
                  onChange={handleOtpChange}
                  disabled={otpVerified}
                />
                {otpError && <p className="otp-error-msg">⚠️ {otpError}</p>}
              </div>

              {/* Resend countdown */}
              <div className="otp-resend">
                {seconds > 0
                  ? <span className="otp-timer">Resend OTP in <strong>{seconds}s</strong></span>
                  : <button type="button" className="resend-btn" onClick={handleResend}>
                      Resend OTP
                    </button>
                }
                <button type="button" className="change-email-btn"
                  onClick={() => { setOtpSent(false); setOtpValue(''); }}>
                  Change Email
                </button>
              </div>

              {/* Final submit */}
              <button
                id="signup-submit-btn"
                type="submit"
                className="auth-submit"
                disabled={loading || otpVerified}
              >
                {loading
                  ? <><Loader2 size={18} className="spin" /> Verifying & Creating Account…</>
                  : otpVerified
                    ? <><Check size={18} /> Account Created! Redirecting…</>
                    : <><UserPlus size={18} /> Verify OTP & Create Account</>
                }
              </button>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="auth-or">
          <span>or</span>
        </div>

        {/* Google sign up */}
        <button type="button" className="google-btn" onClick={() => handleGoogleLogin()} disabled={loading}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" className="google-icon" />
          Sign up with Google
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

/* ── 6-box OTP Input Component ── */
const OTPInput = ({ value, onChange, disabled, id }) => {
  const boxes = 6;
  const digits = value.split('').slice(0, boxes);
  while (digits.length < boxes) digits.push('');
  const refs = Array.from({ length: boxes }, () => React.createRef());

  const handleKey = (i, e) => {
    const v = e.target.value.replace(/\D/, '');
    const arr = [...digits];

    if (v) {
      arr[i] = v[v.length - 1];
      onChange(arr.join(''));
      if (i < boxes - 1) refs[i + 1].current?.focus();
    } else {
      arr[i] = '';
      onChange(arr.join(''));
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, boxes);
    onChange(pasted.padEnd(boxes, '').slice(0, boxes));
    refs[Math.min(pasted.length, boxes - 1)].current?.focus();
    e.preventDefault();
  };

  const handleBackspace = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  return (
    <div className="otp-boxes" id={id}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          className={`otp-box ${d ? 'otp-box-filled' : ''}`}
          onChange={(e) => handleKey(i, e)}
          onKeyDown={(e) => handleBackspace(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

export default Signup;

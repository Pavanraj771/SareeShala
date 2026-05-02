import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ShieldCheck, ArrowLeft, Loader2, Eye, EyeOff, Check, KeyRound
} from 'lucide-react';
import './Auth.css';

/* ── OTP countdown hook ── */
const useCountdown = (initial = 60) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const start = () => {
    setSeconds(initial);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(s => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
    }, 1000);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);
  return { seconds, start };
};

/* 3-step flow: STEP_EMAIL → STEP_OTP → STEP_PASSWORD */
const STEP_EMAIL    = 'email';
const STEP_OTP      = 'otp';
const STEP_PASSWORD = 'password';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState(STEP_EMAIL);
  const [email, setEmail]       = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const { seconds, start: startCountdown } = useCountdown(60);

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/users/send-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), purpose: 'password_reset' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');

      setStep(STEP_OTP);
      setOtpValue('');
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP (moves to password step) ── */
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    // OTP is verified on the server when resetting — just move to next step
    setError('');
    setStep(STEP_PASSWORD);
  };

  /* ── Step 3: Reset password ── */
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/users/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        email.trim().toLowerCase(),
          otp_code:     otpValue,
          new_password: newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed.');

      setSuccess('Password reset successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
      // If OTP error, go back to OTP step
      if (err.message.toLowerCase().includes('otp')) setStep(STEP_OTP);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step labels ── */
  const stepLabels = [
    { key: STEP_EMAIL,    num: '1', label: 'Enter Email'  },
    { key: STEP_OTP,      num: '2', label: 'Verify OTP'   },
    { key: STEP_PASSWORD, num: '3', label: 'New Password'  },
  ];
  const stepIndex = { [STEP_EMAIL]: 0, [STEP_OTP]: 1, [STEP_PASSWORD]: 2 };
  const current   = stepIndex[step];

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>

      <div className="auth-card animate-fade-in">
        <button className="auth-back" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div className="auth-logo text-gradient">SAREESHALA</div>
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">We'll send an OTP to verify it's you</p>

        {/* Progress */}
        <div className="otp-progress">
          {stepLabels.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={`otp-step ${current > i ? 'done' : ''} ${current === i ? 'active' : ''}`}>
                <span className="step-num">{current > i ? '✓' : s.num}</span>
                <span className="step-label">{s.label}</span>
              </div>
              {i < stepLabels.length - 1 && <div className={`step-line ${current > i ? 'line-done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {error   && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}

        {/* ── Step 1: Email ── */}
        {step === STEP_EMAIL && (
          <form className="auth-form" onSubmit={handleSendOtp} noValidate>
            <div className="form-group">
              <label htmlFor="forgot-email">Registered Email Address</label>
              <input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="auth-input"
                autoFocus
                autoComplete="email"
              />
            </div>
            <button id="forgot-send-otp-btn" type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? <><Loader2 size={18} className="spin" /> Sending OTP…</>
                : <><Mail size={18} /> Send OTP</>
              }
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === STEP_OTP && (
          <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
            <div className="otp-banner">
              <ShieldCheck size={20} />
              <div>
                <p className="otp-banner-title">OTP Sent!</p>
                <p className="otp-banner-sub">
                  A 6-digit code was sent to <strong>{email}</strong>
                </p>
                <p className="otp-dev-hint">🛠️ Dev mode: OTP prints in the Django terminal.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="forgot-otp">Enter 6-Digit OTP</label>
              <OTPInput
                id="forgot-otp"
                value={otpValue}
                onChange={(v) => { setOtpValue(v); setError(''); }}
              />
            </div>

            <div className="otp-resend">
              {seconds > 0
                ? <span className="otp-timer">Resend in <strong>{seconds}s</strong></span>
                : <button type="button" className="resend-btn" onClick={() => handleSendOtp()}>
                    Resend OTP
                  </button>
              }
              <button type="button" className="change-email-btn"
                onClick={() => { setStep(STEP_EMAIL); setOtpValue(''); setError(''); }}>
                Change Email
              </button>
            </div>

            <button id="forgot-verify-btn" type="submit" className="auth-submit">
              <ShieldCheck size={18} /> Verify OTP
            </button>
          </form>
        )}

        {/* ── Step 3: New Password ── */}
        {step === STEP_PASSWORD && (
          <form className="auth-form" onSubmit={handleReset} noValidate>
            <div className="otp-banner otp-banner-success">
              <Check size={20} />
              <div>
                <p className="otp-banner-title">OTP Verified ✓</p>
                <p className="otp-banner-sub">Now set your new password.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <div className="input-wrapper">
                <input
                  id="new-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={newPass}
                  onChange={(e) => { setNewPass(e.target.value); setError(''); }}
                  className="auth-input"
                  autoFocus
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <div className="input-wrapper">
                <input
                  id="confirm-new-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setError(''); }}
                  className={`auth-input ${confirmPass && newPass !== confirmPass ? 'input-error' : ''} ${confirmPass && newPass === confirmPass ? 'input-success' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {confirmPass && newPass === confirmPass && <Check size={16} className="input-check" />}
              </div>
            </div>

            <button id="reset-password-btn" type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? <><Loader2 size={18} className="spin" /> Resetting Password…</>
                : <><KeyRound size={18} /> Reset Password</>
              }
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remember your password?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

/* ── 6-box OTP Input ── */
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
    onChange(pasted);
    refs[Math.min(pasted.length, boxes - 1)].current?.focus();
    e.preventDefault();
  };

  const handleBackspace = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div className="otp-boxes" id={id}>
      {digits.map((d, i) => (
        <input
          key={i} ref={refs[i]}
          type="text" inputMode="numeric" maxLength={1}
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

export default ForgotPassword;

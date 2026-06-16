import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, AlertTriangle, X, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './StubPage.css';

const Toggle = ({ on, onToggle }) => (
  <button className={`toggle ${on ? 'on' : ''}`} onClick={onToggle} aria-pressed={on} />
);

/* ── Random challenge text generator ── */
const generateChallengeText = () => {
  const words = [
    'CONFIRM', 'DELETE', 'REMOVE', 'ERASE', 'PURGE',
    'ALPHA', 'BRAVO', 'DELTA', 'ECHO', 'FOXTROT',
    'TANGO', 'SIERRA', 'OSCAR', 'KILO', 'ZULU',
  ];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 900 + 100);        // 100–999
  return `${pick()}-${pick()}-${num}`;
};

const AccountSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* ── Preference toggles ── */
  const [prefs, setPrefs] = useState({
    emailNotif: true,
    whatsappAlerts: true,
    orderUpdates: true,
    promoEmails: false,
    twoFactor:  false,
    publicProfile: false,
  });

  /* ── Fetch persisted preferences on mount ── */
  useEffect(() => {
    if (!user) return;
    const fetchPrefs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me/`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPrefs((p) => ({
            ...p,
            orderUpdates: data.order_updates_enabled ?? true,
          }));
        }
      } catch {
        // Silently fail — toggle defaults to true
      }
    };
    fetchPrefs();
  }, [user]);

  /* ── Delete account modal state ── */
  const [deleteStep, setDeleteStep] = useState(0);       // 0 = closed, 1 = confirm, 2 = challenge
  const [challengeText, setChallengeText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  /* Generate new challenge text when step 2 opens */
  useEffect(() => {
    if (deleteStep === 2) {
      setChallengeText(generateChallengeText());
      setUserInput('');
      setDeleteError('');
    }
  }, [deleteStep]);

  /* ── Guard: not logged in ── */
  if (!user) {
    return (
      <div className="stub-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>Login to manage your settings.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  /* ── Toggle handler: local toggles + API call for orderUpdates ── */
  const toggle = async (key) => {
    const newValue = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: newValue }));

    if (key === 'orderUpdates') {
      try {
        await fetch(`${API_URL}/api/users/toggle-order-updates/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ enabled: newValue }),
        });
      } catch {
        // Revert on failure
        setPrefs((p) => ({ ...p, [key]: !newValue }));
      }
    }
  };

  /* ── Delete account handler ── */
  const handleDeleteAccount = async () => {
    if (userInput !== challengeText) {
      setDeleteError('Text does not match. Please type the exact text shown above.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`${API_URL}/api/users/delete-account/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          confirmation_text: userInput,
          expected_text: challengeText,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDeleteStep(0);
        logout();
        navigate('/login');
      } else {
        setDeleteError(data.error || 'Failed to delete account. Please try again.');
      }
    } catch {
      setDeleteError('Network error. Please check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    if (!deleting) {
      setDeleteStep(0);
      setUserInput('');
      setDeleteError('');
    }
  };

  return (
    <div className="stub-page">
      <div className="stub-bg"><div className="s-orb orb-gold"/><div className="s-orb orb-purple"/></div>
      <div className="stub-content animate-fade-in">
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><Settings size={28}/> Account Settings</h1>
        <p className="stub-sub">Manage your preferences and security</p>

        <div className="settings-sections">
          {/* Notifications */}
          <div className="settings-card glass-panel">
            <h3>🔔 Notifications</h3>
            {[
              { key: 'emailNotif',     label: 'Email Notifications',  sub: 'Receive updates via email' },
              { key: 'whatsappAlerts', label: 'WhatsApp Alerts',      sub: 'Get order alerts on WhatsApp' },
              { key: 'orderUpdates',   label: 'Order Status Updates',  sub: 'Track your orders in real-time' },
              { key: 'promoEmails',    label: 'Promotional Emails',   sub: 'Deals, offers & new arrivals' },
            ].map(({ key, label, sub }) => (
              <div className="settings-row" key={key}>
                <div>
                  <p className="settings-label">{label}</p>
                  <p className="settings-sub">{sub}</p>
                </div>
                <Toggle on={prefs[key]} onToggle={() => toggle(key)} />
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="settings-card glass-panel">
            <h3>🔐 Security & Privacy</h3>
            <div className="settings-row">
              <div>
                <p className="settings-label">Two-Factor Authentication</p>
                <p className="settings-sub">Add an extra layer of security</p>
              </div>
              <Toggle on={prefs.twoFactor} onToggle={() => toggle('twoFactor')} />
            </div>
            <div className="settings-row">
              <div>
                <p className="settings-label">Public Profile</p>
                <p className="settings-sub">Allow others to see your profile</p>
              </div>
              <Toggle on={prefs.publicProfile} onToggle={() => toggle('publicProfile')} />
            </div>
            <div className="settings-row">
              <div>
                <p className="settings-label">Change Password</p>
                <p className="settings-sub">Update your account password</p>
              </div>
              <button className="edit-btn" onClick={() => navigate('/forgot-password')}>Change →</button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="settings-card glass-panel" style={{ border: '1px solid rgba(255,77,77,0.2)' }}>
            <h3 style={{ color: '#ff6b6b' }}>⚠️ Danger Zone</h3>
            <div className="settings-row">
              <div>
                <p className="settings-label">Delete Account</p>
                <p className="settings-sub">Permanently remove your account and all data</p>
              </div>
              <button className="cancel-btn" onClick={() => setDeleteStep(1)}>Delete →</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Delete Account Modal ─── */}
      {deleteStep > 0 && (
        <div className="delete-modal-overlay" onClick={closeModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>

            {/* Close button */}
            <button className="delete-modal-close" onClick={closeModal} disabled={deleting}>
              <X size={20} />
            </button>

            {/* Step 1: Confirm intent */}
            {deleteStep === 1 && (
              <div className="delete-modal-body">
                <div className="delete-modal-icon warning">
                  <AlertTriangle size={48} />
                </div>
                <h2>Are you sure?</h2>
                <p className="delete-modal-desc">
                  This action is <strong>irreversible</strong>. Your account, order history,
                  wishlist, reviews, and all associated data will be permanently deleted.
                </p>
                <div className="delete-modal-actions">
                  <button className="delete-modal-btn secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="delete-modal-btn danger" onClick={() => setDeleteStep(2)}>
                    Yes, I want to delete
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Challenge text */}
            {deleteStep === 2 && (
              <div className="delete-modal-body">
                <div className="delete-modal-icon danger">
                  <ShieldAlert size={48} />
                </div>
                <h2>Final Verification</h2>
                <p className="delete-modal-desc">
                  To confirm deletion, type the text below exactly as shown:
                </p>
                <div className="delete-challenge-text">{challengeText}</div>
                <input
                  id="delete-confirm-input"
                  className="delete-challenge-input"
                  type="text"
                  placeholder="Type the text above..."
                  value={userInput}
                  onChange={(e) => { setUserInput(e.target.value); setDeleteError(''); }}
                  disabled={deleting}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
                {deleteError && <p className="delete-modal-error">{deleteError}</p>}
                <div className="delete-modal-actions">
                  <button className="delete-modal-btn secondary" onClick={() => setDeleteStep(1)} disabled={deleting}>
                    Go Back
                  </button>
                  <button
                    className="delete-modal-btn danger"
                    onClick={handleDeleteAccount}
                    disabled={deleting || !userInput}
                  >
                    {deleting ? (
                      <><Loader2 size={16} className="spin-icon" /> Deleting...</>
                    ) : (
                      'Permanently Delete'
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;

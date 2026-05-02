import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';

const Toggle = ({ on, onToggle }) => (
  <button className={`toggle ${on ? 'on' : ''}`} onClick={onToggle} aria-pressed={on} />
);

const AccountSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    emailNotif: true,
    whatsappAlerts: true,
    orderUpdates: true,
    promoEmails: false,
    twoFactor:  false,
    publicProfile: false,
  });

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

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

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
              <button className="cancel-btn">Delete →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;

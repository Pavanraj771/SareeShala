import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, ShoppingBag,
  Heart, Star, Settings, LogOut, Edit2, Save, X, Package, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';
import { API_URL } from '../config';

const statCards = [
  { icon: <ShoppingBag size={20} />, label: 'Total Orders', value: '12', color: '#d4af37' },
  { icon: <Heart size={20} />,       label: 'Wishlist',      value: '8',  color: '#c2185b' },
  { icon: <Star size={20} />,        label: 'Reviews',       value: '5',  color: '#9b59b6' },
  { icon: <Package size={20} />,     label: 'Delivered',     value: '10', color: '#27ae60' },
];

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
    address:   user?.address   || '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const updatedUser = {
            ...user,
            firstName: data.first_name,
            lastName:  data.last_name,
            email:     data.email,
            phone:     data.phone_number,
            address:   data.address,
            dateJoined: data.date_joined,
          };
          updateUser(updatedUser);
          setForm({
            firstName: data.first_name || '',
            lastName:  data.last_name  || '',
            email:     data.email      || '',
            phone:     data.phone_number || '',
            address:   data.address    || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setFetching(false);
      }
    };

    if (user?.token) {
      fetchUserData();
    } else {
      setFetching(false);
    }
  }, []);

  if (!user) {
    return (
      <div className="profile-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>You need to be logged in to view your profile.</p>
          <button className="btn-primary gate-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users/me/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          first_name:   form.firstName,
          last_name:    form.lastName,
          phone_number: form.phone,
          address:      form.address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update context with new info
      updateUser({ ...user, ...form });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      email:     user?.email     || '',
      phone:     user?.phone     || '',
      address:   user?.address   || '',
    });
    setEditing(false);
  };

  return (
    <div className="profile-page">
      {/* Background */}
      <div className="profile-bg">
        <div className="profile-orb orb-gold" />
        <div className="profile-orb orb-purple" />
      </div>

      {/* Back nav */}
      <button className="profile-back" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className="profile-container animate-fade-in">

        {/* ── Left Sidebar ── */}
        <aside className="profile-sidebar">
          <div className="sidebar-avatar">
            <div className="avatar-ring">
              <span className="avatar-letter">
                {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <h3 className="sidebar-name">{user.firstName} {user.lastName}</h3>
            <p className="sidebar-username">@{user.username}</p>
            <p className="sidebar-email">{user.email}</p>
          </div>

          <nav className="sidebar-nav">
            <button className="sidebar-nav-item active" onClick={() => navigate('/profile')}>
              <User size={16} /> My Profile
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate('/orders')}>
              <ShoppingBag size={16} /> My Orders
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate('/wishlist')}>
              <Heart size={16} /> Wishlist
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate('/reviews')}>
              <Star size={16} /> My Reviews
            </button>
            <button className="sidebar-nav-item" onClick={() => navigate('/settings')}>
              <Settings size={16} /> Settings
            </button>
            <button className="sidebar-nav-item logout-nav" onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </aside>

        {/* ── Right Content ── */}
        <main className="profile-main">

          {/* Stat Cards */}
          <div className="profile-stats">
            {statCards.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon" style={{ color: s.color, background: `${s.color}18` }}>
                  {s.icon}
                </div>
                <div>
                  <p className="stat-value">{s.value}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Profile Info Card */}
          <div className="profile-info-card glass-panel">
            <div className="info-card-header">
              <h2 className="info-card-title">Personal Information</h2>
              {!editing ? (
                <button id="edit-profile-btn" className="edit-btn" onClick={() => setEditing(true)}>
                  <Edit2 size={14} /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button id="save-profile-btn" className="save-btn" onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button id="cancel-edit-btn" className="cancel-btn" onClick={handleCancel} disabled={loading}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {saved && (
              <div className="save-toast">✅ Profile updated successfully!</div>
            )}

            <div className="info-grid">
              <InfoField
                icon={<User size={16}/>}
                label="First Name"
                name="firstName"
                value={form.firstName}
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                icon={<User size={16}/>}
                label="Last Name"
                name="lastName"
                value={form.lastName}
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                icon={<Mail size={16}/>}
                label="Email"
                name="email"
                type="email"
                value={form.email}
                editing={editing}
                onChange={handleChange}
                disabled={true}
              />
              <InfoField
                icon={<Phone size={16}/>}
                label="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                editing={editing}
                onChange={handleChange}
                placeholder="Not provided"
              />
              <div className="info-field full-width">
                <label className="field-label">
                  <MapPin size={16}/> Delivery Address
                </label>
                {editing ? (
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="field-input field-textarea"
                    placeholder="Enter your delivery address"
                    rows={3}
                  />
                ) : (
                  <p className="field-value">{form.address || <span className="empty-val">Not provided</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="profile-info-card glass-panel">
            <div className="info-card-header">
              <h2 className="info-card-title">Account Details</h2>
            </div>
            <div className="info-grid">
              <div className="info-field">
                <label className="field-label"><User size={16}/> Username</label>
                <p className="field-value username-val">@{user.username}</p>
              </div>
              <div className="info-field">
                <label className="field-label">🔖 Member Since</label>
                <p className="field-value">{user.dateJoined || 'N/A'}</p>
              </div>
              <div className="info-field">
                <label className="field-label">🎯 Account Type</label>
                <p className="field-value">
                  <span className="badge-customer">Customer</span>
                </p>
              </div>
              <div className="info-field">
                <label className="field-label">✅ Status</label>
                <p className="field-value">
                  <span className="badge-active">Active</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

/* ── Reusable info field ── */
const InfoField = ({ icon, label, name, value, editing, onChange, type = 'text', placeholder = '', disabled = false }) => (
  <div className="info-field">
    <label className="field-label">{icon} {label}</label>
    {editing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`field-input ${disabled ? 'field-input-disabled' : ''}`}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        disabled={disabled}
      />
    ) : (
      <p className="field-value">{value || <span className="empty-val">{placeholder || 'Not provided'}</span>}</p>
    )}
  </div>
);

export default Profile;

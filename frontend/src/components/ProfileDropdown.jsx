import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, LogIn, UserPlus, LogOut, Settings,
  ShoppingBag, Heart, ChevronDown, Star, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="profile-dropdown-wrapper" ref={ref}>
      {/* Trigger Button */}
      <button
        id="profile-btn"
        className={`profile-trigger ${open ? 'active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="profile-avatar">
          {user ? (
            <span className="avatar-initials">
              {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
            </span>
          ) : (
            <User size={18} />
          )}
        </div>
        {user && <span className="profile-name-label">{user.firstName || user.username}</span>}
        <ChevronDown size={14} className={`chevron ${open ? 'rotated' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div className={`dropdown-menu ${open ? 'dropdown-open' : ''}`} role="menu">
        {user ? (
          <>
            {/* Logged-in header */}
            <div className="dropdown-header">
              <div className="dropdown-avatar-lg">
                {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="dropdown-user-info">
                <p className="dropdown-username">{user.firstName} {user.lastName}</p>
                <p className="dropdown-email">{user.email}</p>
              </div>
            </div>

            <div className="dropdown-divider" />

            <button className="dropdown-item" onClick={() => go('/profile')}>
              <User size={16} /> My Profile
            </button>
            <button className="dropdown-item" onClick={() => go('/orders')}>
              <Package size={16} /> My Orders
            </button>
            <button className="dropdown-item" onClick={() => go('/wishlist')}>
              <Heart size={16} /> Wishlist
            </button>
            <button className="dropdown-item" onClick={() => go('/cart')}>
              <ShoppingBag size={16} /> My Cart
            </button>
            <button className="dropdown-item" onClick={() => go('/reviews')}>
              <Star size={16} /> My Reviews
            </button>

            <div className="dropdown-divider" />

            <button className="dropdown-item" onClick={() => go('/settings')}>
              <Settings size={16} /> Account Settings
            </button>
            <button className="dropdown-item logout-item" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            {/* Guest header */}
            <div className="dropdown-header guest-header">
              <p className="guest-greeting">Welcome to SareeShala ✨</p>
              <p className="guest-sub">Sign in for personalized experience</p>
            </div>

            <div className="dropdown-divider" />

            <button className="dropdown-item auth-btn login-btn" onClick={() => go('/login')}>
              <LogIn size={16} /> Login
            </button>
            <button className="dropdown-item auth-btn signup-btn" onClick={() => go('/signup')}>
              <UserPlus size={16} /> Create Account
            </button>

            <div className="dropdown-divider" />

            <button className="dropdown-item" onClick={() => go('/wishlist')}>
              <Heart size={16} /> Wishlist
            </button>
            <button className="dropdown-item" onClick={() => go('/cart')}>
              <ShoppingBag size={16} /> Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileDropdown;

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, Moon, Sun } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';
import '../pages/Home.css'; // Keep reusing the same CSS for now

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unseenCartCount, setUnseenCartCount] = useState(0);
  const [unseenNotifCount, setUnseenNotifCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Hide Navbar on specific routes
  const hiddenRoutes = ['/login', '/signup', '/forgot-password'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && user.token) {
      // Fetch Cart Count
      fetch(`${API_URL}/api/orders/cart/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const count = data.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
          const seenCount = parseInt(localStorage.getItem('seenCartCount') || '0', 10);
          setUnseenCartCount(Math.max(0, count - seenCount));
        }
      })
      .catch(console.error);

      // Fetch Notifications for Count
      fetch(`${API_URL}/api/users/notifications/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unseen = data.filter(n => !n.is_seen).length;
          setUnseenNotifCount(unseen);
        }
      })
      .catch(console.error);
    }
  }, [user, location.pathname]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // If not on home page, navigate to home page when typing search
    if (location.pathname !== '/' && e.target.value.trim() !== '') {
      navigate('/');
    }
  };

  const handleNavClick = (e, path) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (path.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate(`/${path}`);
      } else {
        const element = document.querySelector(path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div 
        className="logo text-gradient" 
        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}
        style={{ cursor: 'pointer' }}
      >
        SAREESHALA
      </div>
      
      <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <a href="#new" className="nav-item" onClick={(e) => handleNavClick(e, '#new')}>New Arrivals</a>
        <a href="#bestsellers" className="nav-item" onClick={(e) => handleNavClick(e, '#bestsellers')}>Best Sellers</a>
        <span className="nav-item" onClick={() => { setMobileMenuOpen(false); navigate('/notifications'); }} style={{cursor: 'pointer', position: 'relative'}}>
          Notifications
          {unseenNotifCount > 0 && (
            <span className="nav-badge" style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#e74c3c', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>
              {unseenNotifCount}
            </span>
          )}
        </span>
        <a href="#about" className="nav-item" onClick={(e) => handleNavClick(e, '#about')}>Our Story</a>
      </div>
      
      <div className="nav-actions">
        {isSearchOpen && (
          <div className="search-bar-container animate-fade-in">
            <input 
              type="text" 
              placeholder="Search sarees..." 
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
              className="search-input"
            />
          </div>
        )}
        <button 
          id="search-btn" 
          className={`action-btn ${isSearchOpen ? 'active' : ''}`} 
          aria-label="Search"
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (isSearchOpen) setSearchQuery('');
          }}
        >
          {isSearchOpen ? <X size={20} /> : <Search size={20} />}
        </button>
        
        {/* Theme Toggle */}
        <button 
          className="action-btn theme-toggle-btn" 
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button id="cart-nav-btn" className="action-btn" style={{ position: 'relative' }} aria-label="Cart" onClick={() => navigate('/cart')}>
          <ShoppingBag size={20} />
          {unseenCartCount > 0 && (
            <span className="nav-badge" style={{ position: 'absolute', top: '0', right: '0', background: '#e74c3c', color: 'white', fontSize: '0.65rem', padding: '2px 5px', borderRadius: '10px', transform: 'translate(25%, -25%)' }}>
              {unseenCartCount}
            </span>
          )}
        </button>
        <ProfileDropdown />
        <button className="action-btn mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

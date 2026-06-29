import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hideFooterPaths = ['/login', '/signup', '/forgot-password', '/admin'];

  // Don't show footer on auth pages or any admin pages
  if (hideFooterPaths.includes(location.pathname) || location.pathname.startsWith('/admin') || location.state?.adminTab) {
    return null;
  }

  const handleNavClick = (e, path) => {
    e.preventDefault();
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
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-section brand-section">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="SareeShala Logo" style={{ height: '40px', width: 'auto', borderRadius: '50%' }} />
            <h2 className="footer-logo" style={{ marginBottom: 0, marginLeft: '12px' }}>SAREESHALA</h2>
          </div>
          <p className="footer-desc">
            Elegance woven in tradition. Discover the finest handloom sarees crafted by master weavers from across India.
          </p>
        </div>

        <div className="footer-section links-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="#all-collections" onClick={(e) => handleNavClick(e, '#all-collections')}>Collections</a></li>
            <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')}>Our Story</a></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        <div className="footer-section links-section">
          <h3 className="footer-heading">Customer Care</h3>
          <ul>
            <li><Link to="/profile">My Account</Link></li>
            <li><Link to="/orders">Track Order</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="contact-info">
            <li><MapPin size={18} className="contact-icon" /> Chandur, Nalgonda, Telangana, India - 508255</li>
            <li><Phone size={18} className="contact-icon" /> +91 9676230799</li>
            <li><Mail size={18} className="contact-icon" /> sareeshala@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SareeShala. All rights reserved.</p>
        <div className="legal-links">
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

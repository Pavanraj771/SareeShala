import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const hideFooterPaths = ['/login', '/signup', '/forgot-password', '/admin'];

  // Don't show footer on auth pages or any admin pages
  if (hideFooterPaths.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-section brand-section">
          <h2 className="footer-logo text-gradient">SAREESHALA</h2>
          <p className="footer-desc">
            Elegance woven in tradition. Discover the finest handloom sarees crafted by master weavers from across India.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 2.8 12c.5.1 1 .1 1.5.1C2.5 10.3 2 7.5 2 7.5c.7.4 1.5.6 2.4.6C2.5 6 2 3 2 3c3.1 3.8 7.7 6.3 12.8 6.6-.2-1.5.1-3 1-4 1.4-1.6 3.8-1.9 5.5-.6.6-.2 1.1-.4 1.6-.7-.2.6-.6 1.1-1.1 1.4.5-.1 1-.2 1.4-.4z"></path></svg>
            </a>
          </div>
        </div>

        <div className="footer-section links-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/#collections">Collections</a></li>
            <li><a href="/#about">Our Story</a></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        <div className="footer-section links-section">
          <h3 className="footer-heading">Customer Care</h3>
          <ul>
            <li><Link to="/profile">My Account</Link></li>
            <li><Link to="/orders">Track Order</Link></li>
            <li><Link to="#">Shipping Policy</Link></li>
            <li><Link to="#">Returns & Exchanges</Link></li>
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

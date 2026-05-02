import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';

const mockReviews = [
  { id: 1, product: 'Red Banarasi Silk Saree',  stars: 5, text: 'Absolutely gorgeous! The quality is outstanding and the colors are vibrant. Worth every rupee.', date: '20 Apr 2025' },
  { id: 2, product: 'Blue Kanjivaram Saree',     stars: 4, text: 'Beautiful weave and great packaging. Slightly different shade than pictures but still lovely.', date: '15 Mar 2025' },
  { id: 3, product: 'Yellow Cotton Saree',       stars: 5, text: 'Perfect for daily wear! Very comfortable and the block print is stunning. Will buy again.', date: '5 Feb 2025' },
];

const Reviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="stub-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>Login to see your reviews.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stub-page">
      <div className="stub-bg"><div className="s-orb orb-gold"/><div className="s-orb orb-purple"/></div>
      <div className="stub-content animate-fade-in">
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><Star size={28}/> My Reviews</h1>
        <p className="stub-sub">{mockReviews.length} reviews written</p>

        <div className="reviews-list">
          {mockReviews.map((r) => (
            <div className="review-card glass-panel" key={r.id}>
              <div className="review-header">
                <p className="review-product">{r.product}</p>
                <span className="review-stars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
              </div>
              <p className="review-text">"{r.text}"</p>
              <p className="review-date">{r.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';
import { API_URL } from '../config';

const Reviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/reviews/my-reviews/`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

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
      <div className="stub-content animate-fade-in" style={{ maxWidth: '800px' }}>
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><MessageSquare size={28}/> My Reviews</h1>
        
        {loading ? (
          <p className="stub-sub">Loading your reviews...</p>
        ) : (
          <>
            <p className="stub-sub">{reviews.length} review{reviews.length !== 1 ? 's' : ''} written</p>

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">✍️</span>
                  <p>You haven't written any reviews yet.</p>
                  <button className="btn-primary" onClick={() => navigate('/orders')}>View Orders</button>
                </div>
              ) : (
                reviews.map((r) => (
                  <div className="review-card glass-panel" key={r.id} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
                    <div className="review-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="review-product" style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>{r.product_name}</p>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={16} fill={star <= r.rating ? 'var(--color-accent-primary)' : 'none'} color={star <= r.rating ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)'} />
                        ))}
                      </div>
                    </div>
                    <p className="review-text" style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '1rem' }}>"{r.comment}"</p>
                    <p className="review-date" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;

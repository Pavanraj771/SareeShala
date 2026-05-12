import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Package, Star, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';
import { API_URL } from '../config';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/notifications/`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          localStorage.setItem('seenNotifCount', data.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsSeen = async (id) => {
    try {
      await fetch(`${API_URL}/api/users/notifications/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_id: id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_seen: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users/reviews/submit/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: activeProduct.product_id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (res.ok) {
        // Mark notification as seen since they reviewed it
        handleMarkAsSeen(activeProduct.notifId);
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
        alert('Thank you for your review!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="stub-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>Login to view your notifications.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stub-page" style={{ paddingBottom: '4rem' }}>
      <div className="stub-bg"><div className="s-orb orb-gold"/><div className="s-orb orb-purple"/></div>
      <div className="stub-content animate-fade-in" style={{ maxWidth: '800px' }}>
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><Bell size={28}/> Notifications</h1>
        <p className="stub-sub">Stay updated with your orders and latest offers.</p>
        
        {loading ? (
          <p className="stub-sub">Loading notifications...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔕</span>
                <p>No new notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`glass-panel notification-card ${n.is_seen ? 'seen' : 'new'}`} 
                     style={{ 
                       padding: '1.5rem', 
                       display: 'flex', 
                       flexDirection: 'column',
                       gap: '1rem',
                       transition: 'var(--transition-smooth)',
                       border: n.is_seen ? '1px solid var(--border-subtle)' : '1px solid var(--color-accent-primary)',
                       opacity: n.is_seen ? 0.8 : 1,
                       borderRadius: 'var(--border-radius-md)',
                       background: 'var(--color-bg-secondary)'
                     }} >
                  
                  <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      background: n.is_seen ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.1)', 
                      color: n.is_seen ? 'var(--color-text-secondary)' : 'var(--color-accent-primary)',
                      padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {n.type === 'review_prompt' ? <Star size={20} /> : <Package size={20} />}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>{n.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {new Date(n.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{n.message}</p>
                      
                      {n.type === 'review_prompt' && !n.is_seen && (
                        <div style={{ marginTop: '1.2rem', display: 'flex', gap: '1rem' }}>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                            onClick={() => {
                              setActiveProduct({ product_id: n.product_id, product_name: n.product_name, notifId: n.id });
                              setShowReviewModal(true);
                            }}
                          >
                            Review Item
                          </button>
                          <button 
                            style={{ background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--color-text-secondary)', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem' }}
                            onClick={() => handleMarkAsSeen(n.id)}
                          >
                            Mark Read
                          </button>
                        </div>
                      )}

                      {!n.is_seen && n.type !== 'review_prompt' && (
                        <button 
                          style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--color-accent-primary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                          onClick={() => handleMarkAsSeen(n.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '2rem' }}>
          <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', margin: 'auto', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: '500' }}>Review Item</h2>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><X /></button>
            </div>
            
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              How was your experience with <strong>{activeProduct?.product_name}</strong>?
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={24} 
                      style={{ cursor: 'pointer', fill: star <= reviewForm.rating ? 'var(--color-accent-primary)' : 'none', color: star <= reviewForm.rating ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Your Feedback</label>
                <textarea 
                  required
                  style={{ width: '100%', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-md)', padding: '1rem', color: 'var(--color-text-primary)', fontFamily: 'inherit', fontSize: '0.95rem', minHeight: '120px' }}
                  placeholder="Tell others what you think about this saree..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting}
                style={{ padding: '12px', marginTop: '0.5rem' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;

import React from 'react';
import { X, MessageSquare, Star } from 'lucide-react';

const ProductReviewsModal = ({ isOpen, onClose, reviews, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="reviews-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }} onClick={onClose}>
      <div className="reviews-modal-content animate-slide-up" style={{ background: 'var(--color-bg-secondary)', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Product Reviews</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem' }}>No reviews yet for this product.</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Be the first one to review after purchase!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((r, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text-primary)' }}>{r.username}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', opacity: 0.6 }}>{new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={14} fill={star <= r.rating ? 'var(--color-accent-primary)' : 'none'} color={star <= r.rating ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.2)'} />
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', fontStyle: 'italic' }}>"{r.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsModal;

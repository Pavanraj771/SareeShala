import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { API_URL } from '../config';

const SubmitReviewModal = ({ isOpen, onClose, product, user, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users/reviews/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          rating,
          comment
        })
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
      <div className="modal-content animate-slide-up" style={{ background: 'var(--color-bg-secondary)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Rate & Review</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>How was your experience with <br/><strong style={{ color: 'var(--color-text-primary)' }}>{product.name}</strong>?</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
              >
                <Star 
                  size={32} 
                  fill={(hover || rating) >= star ? 'var(--color-accent-primary)' : 'none'} 
                  color={(hover || rating) >= star ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.2)'} 
                  style={{ transition: 'all 0.2s ease' }}
                />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Your Review</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you think about this saree..."
              style={{ width: '100%', minHeight: '120px', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', resize: 'none', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting || !comment.trim()}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {submitting ? 'Submitting...' : <><MessageSquare size={20}/> Submit Review</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewModal;

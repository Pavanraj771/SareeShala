import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Clock, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SubmitReviewModal from '../components/SubmitReviewModal';
import './StubPage.css';
import { API_URL } from '../config';

const Orders = () => {
  const { user, showMessage } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (user && user.token) {
      if (user.token === 'demo_token_123') {
        setOrders([{
          id: 'DEMO-1001',
          created_at: new Date().toISOString(),
          status: 'DELIVERED',
          total_amount: '4999',
          items: [{
            product_id: 1,
            product_name: 'Kanjivaram Silk Saree',
            quantity: 1,
            price_at_purchase: '4999',
            image: ''
          }]
        }]);
        setLoading(false);
        return;
      }

      fetch(`${API_URL}/api/orders/my-orders/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || data.error || 'Failed to fetch orders');
        return data;
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setOrders([]);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel order');
      }
    } catch (e) {
      console.error(e);
      alert('Error cancelling order');
    }
  };

  const renderProgressBar = (status) => {
    if (status === 'CANCELLED') {
      return (
        <div style={{ color: '#ff4d4d', marginTop: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4d'}}/> Order Cancelled
        </div>
      );
    }
    
    const steps = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    let currentIndex = steps.indexOf(status);
    if (currentIndex === -1) currentIndex = 0; // fallback
    
    return (
      <div className="order-progress-container" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '0 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {/* Progress Line */}
          <div style={{ position: 'absolute', top: '12px', left: '16%', right: '16%', height: '4px', background: 'var(--border-subtle)', zIndex: 0, borderRadius: '2px' }}>
             <div style={{ width: `${(currentIndex / 2) * 100}%`, height: '100%', background: 'var(--color-accent-primary)', transition: 'width 0.4s ease', borderRadius: '2px' }} />
          </div>
          
          {/* Steps */}
          {steps.map((step, idx) => (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '33.33%' }}>
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '50%', 
                background: idx <= currentIndex ? 'var(--color-accent-primary)' : 'var(--bg-card)',
                border: `2px solid ${idx <= currentIndex ? 'var(--color-accent-primary)' : 'var(--border-subtle)'}`,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                color: idx <= currentIndex ? 'white' : 'var(--color-text-secondary)',
                fontSize: '12px', fontWeight: 'bold', transition: 'all 0.3s ease'
              }}>
                {(idx < currentIndex || status === 'DELIVERED') ? '✓' : idx + 1}
              </div>
              <span style={{ fontSize: '0.8rem', marginTop: '6px', color: idx <= currentIndex ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: idx <= currentIndex ? '600' : '400' }}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="stub-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>Login to view your orders.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return '#4caf50';
      case 'SHIPPED': return '#d4af37';
      case 'PROCESSING': return '#3498db';
      case 'CANCELLED': return '#ff4d4d';
      default: return '#9b59b6';
    }
  };

  return (
    <div className="stub-page">
      <div className="stub-bg"><div className="s-orb orb-gold" /><div className="s-orb orb-purple" /></div>
      <div className="stub-content animate-fade-in">
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><Package size={28}/> My Orders</h1>
        
        {loading ? (
          <p className="stub-sub">Loading orders...</p>
        ) : (
          <>
            <p className="stub-sub">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>

            {orders.length === 0 ? (
               <div className="empty-state">
                 <span className="empty-icon">📦</span>
                 <p>You haven't placed any orders yet.</p>
                 <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
               </div>
            ) : (
              <div className="orders-list">
                {orders.map((o) => (
                  <div 
                    className="order-card" 
                    key={o.id}
                    onClick={() => navigate(`/orders/${o.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    
                    {/* Header: Order ID, Date, Status, Total */}
                    <div className="order-header" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <p className="order-id">Order #{o.id}</p>
                        <p className="order-date">
                          <Clock size={14}/> {new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span className="order-status" style={{ 
                          color: getStatusColor(o.status), 
                          background: `${getStatusColor(o.status)}15`, 
                          border: `1px solid ${getStatusColor(o.status)}30` 
                        }}>
                          {o.status}
                        </span>
                        
                        {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); cancelOrder(o.id); }}
                            style={{
                              background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d',
                              padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer',
                              transition: 'all 0.2s', marginTop: '4px'
                            }}
                            onMouseOver={(e) => { e.target.style.background = '#ff4d4d'; e.target.style.color = 'white'; }}
                            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4d4d'; }}
                          >
                            Cancel Order
                          </button>
                        )}
                        
                        <p style={{ marginTop: '0.2rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                          Total: <span style={{ color: 'var(--color-accent-primary)' }}>₹{parseFloat(o.total_amount).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {renderProgressBar(o.status)}
 
                    {/* Compact Items Preview */}
                    <div className="order-items-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {o.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '44px', height: '54px', borderRadius: '8px', overflow: 'hidden', background: 'var(--border-subtle)', flexShrink: 0 }}>
                            {item.image ? (
                              <img src={item.image} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.3rem'}}>🥻</div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product_name}</p>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                              Qty: {item.quantity} • ₹{parseFloat(item.price_at_purchase).toLocaleString()}
                            </p>
                          </div>
                          {o.status === 'DELIVERED' && (
                            <button 
                              className="review-mini-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewProduct({ id: item.product_id, name: item.product_name });
                                setShowReviewModal(true);
                              }}
                              style={{
                                background: 'rgba(212,175,55,0.1)',
                                border: '1px solid rgba(212,175,55,0.3)',
                                color: 'var(--color-accent-primary)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: '500'
                              }}
                            >
                              <Star size={14} fill="currentColor"/> Review
                            </button>
                          )}
                        </div>
                      ))}
                      {o.items.length > 2 && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', textAlign: 'center', paddingTop: '4px' }}>
                          +{o.items.length - 2} more item{o.items.length - 2 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* View Details Indicator */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)',
                      color: 'var(--color-accent-primary)', fontSize: '0.85rem', fontWeight: '600',
                      opacity: 0.7, transition: 'opacity 0.2s'
                    }}>
                      View Details <ChevronRight size={16} />
                    </div>
 
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {reviewProduct && (
        <SubmitReviewModal 
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          product={reviewProduct}
          user={user}
          onSuccess={() => {
            if (showMessage) showMessage('Thank you for your review! ✨');
            // Optional: refresh orders or reviews
          }}
        />
      )}
    </div>
  );
};

export default Orders;

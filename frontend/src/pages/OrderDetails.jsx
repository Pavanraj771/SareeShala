import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, MapPin, CreditCard, Star, ChevronRight, ShoppingBag, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SubmitReviewModal from '../components/SubmitReviewModal';
import './StubPage.css';
import './OrderDetails.css';
import { API_URL } from '../config';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, showMessage } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewProduct, setReviewProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    // For demo user
    if (user.token === 'demo_token_123') {
      setOrder({
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
      });
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
      const allOrders = Array.isArray(data) ? data : [];
      const found = allOrders.find(o => String(o.id) === String(orderId));
      if (found) {
        setOrder(found);
      } else {
        setError('Order not found.');
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError('Failed to load order details.');
      setLoading(false);
    });
  }, [user, orderId]);

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel order');
      }
    } catch (e) {
      console.error(e);
      alert('Error cancelling order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return '#4caf50';
      case 'SHIPPED': return '#d4af37';
      case 'PROCESSING': return '#3498db';
      case 'CANCELLED': return '#ff4d4d';
      default: return '#9b59b6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle size={18} />;
      case 'SHIPPED': return <Truck size={18} />;
      case 'PROCESSING': return <Package size={18} />;
      case 'CANCELLED': return <XCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  if (!user) {
    return (
      <div className="stub-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>Login to view order details.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="stub-page">
        <div className="stub-bg"><div className="s-orb orb-gold" /><div className="s-orb orb-purple" /></div>
        <div className="stub-content animate-fade-in">
          <div className="od-loading">
            <div className="od-loading-spinner" />
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="stub-page">
        <div className="stub-bg"><div className="s-orb orb-gold" /><div className="s-orb orb-purple" /></div>
        <div className="stub-content animate-fade-in">
          <button className="stub-back" onClick={() => navigate('/orders')}><ArrowLeft size={16} /> Back to Orders</button>
          <div className="empty-state">
            <span className="empty-icon">😕</span>
            <p>{error || 'Order not found.'}</p>
            <button className="btn-primary" onClick={() => navigate('/orders')}>View All Orders</button>
          </div>
        </div>
      </div>
    );
  }

  const steps = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
  let currentIndex = steps.indexOf(order.status);
  if (currentIndex === -1) currentIndex = 0;

  return (
    <div className="stub-page">
      <div className="stub-bg"><div className="s-orb orb-gold" /><div className="s-orb orb-purple" /></div>
      <div className="stub-content animate-fade-in">
        <button className="stub-back" onClick={() => navigate('/orders')}>
          <ArrowLeft size={16} /> Back to Orders
        </button>

        {/* Order Header */}
        <div className="od-header">
          <div className="od-header-left">
            <h1 className="od-title">
              <Package size={28} /> Order #{order.id}
            </h1>
            <p className="od-date">
              <Clock size={14} />
              Placed on {new Date(order.created_at).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <div className="od-header-right">
            <span className="od-status-badge" style={{
              color: getStatusColor(order.status),
              background: `${getStatusColor(order.status)}15`,
              border: `1px solid ${getStatusColor(order.status)}30`
            }}>
              {getStatusIcon(order.status)}
              {order.status}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'CANCELLED' ? (
          <div className="od-progress-card glass-panel">
            <h3 className="od-section-title">Order Progress</h3>
            <div className="od-progress-track">
              <div className="od-progress-line">
                <div className="od-progress-fill" style={{ width: `${(currentIndex / 2) * 100}%` }} />
              </div>
              {steps.map((step, idx) => (
                <div key={step} className={`od-progress-step ${idx <= currentIndex ? 'active' : ''}`}>
                  <div className="od-step-dot">
                    {idx < currentIndex || order.status === 'DELIVERED' ? '✓' : idx + 1}
                  </div>
                  <span className="od-step-label">{step.charAt(0) + step.slice(1).toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="od-cancelled-banner glass-panel">
            <XCircle size={22} />
            <div>
              <p className="od-cancelled-title">Order Cancelled</p>
              {order.admin_cancellation_reason && (
                <p className="od-cancelled-reason">Reason: {order.admin_cancellation_reason}</p>
              )}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="od-items-card glass-panel">
          <h3 className="od-section-title">
            <ShoppingBag size={18} />
            Items ({order.items.length})
          </h3>
          <div className="od-items-list">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="od-item"
                onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                style={{ cursor: item.product_id ? 'pointer' : 'default' }}
                title={item.product_id ? 'Click to view saree details' : ''}
              >
                <div className="od-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.product_name} />
                  ) : (
                    <div className="od-item-placeholder">🥻</div>
                  )}
                </div>
                <div className="od-item-info">
                  <p className="od-item-name">{item.product_name}</p>
                  <p className="od-item-meta">Qty: {item.quantity}</p>
                  <p className="od-item-price">₹{parseFloat(item.price_at_purchase).toLocaleString()}</p>
                </div>
                <div className="od-item-actions">
                  {order.status === 'DELIVERED' && (
                    <button
                      className="od-review-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReviewProduct({ id: item.product_id, name: item.product_name });
                        setShowReviewModal(true);
                      }}
                    >
                      <Star size={14} fill="currentColor" /> Review
                    </button>
                  )}
                  {item.product_id && (
                    <div className="od-item-arrow">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="od-summary-card glass-panel">
          <h3 className="od-section-title">
            <CreditCard size={18} />
            Order Summary
          </h3>
          <div className="od-summary-rows">
            <div className="od-summary-row">
              <span>Subtotal ({order.items.length} item{order.items.length !== 1 ? 's' : ''})</span>
              <span>₹{parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
            <div className="od-summary-row">
              <span>Delivery</span>
              <span className="od-free-tag">FREE</span>
            </div>
            <div className="od-summary-divider" />
            <div className="od-summary-row od-summary-total">
              <span>Total</span>
              <span>₹{parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cancel Order Button */}
        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <div className="od-cancel-section">
            <button className="od-cancel-btn" onClick={cancelOrder}>
              <XCircle size={16} /> Cancel this Order
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewProduct && (
        <SubmitReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          product={reviewProduct}
          user={user}
          onSuccess={() => {
            if (showMessage) showMessage('Thank you for your review! ✨');
          }}
        />
      )}
    </div>
  );
};

export default OrderDetails;

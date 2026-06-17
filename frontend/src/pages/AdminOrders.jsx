import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminOrders.css';
import { API_URL } from '../config';

const AdminOrders = ({ reopenOrderId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, reason: '' });
  const [orderModal, setOrderModal] = useState({ open: false, order: null });

  const [appliedSearch, setAppliedSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/orders/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchOrders();
    }
  }, [user]);

  // Auto-open order modal when returning from product details
  useEffect(() => {
    if (reopenOrderId && orders.length > 0) {
      const orderToOpen = orders.find(o => String(o.id) === String(reopenOrderId));
      if (orderToOpen) {
        setOrderModal({ open: true, order: orderToOpen });
      }
    }
  }, [reopenOrderId, orders]);

  const updateStatus = async (orderId, newStatus, reason = null) => {
    if (newStatus === 'CANCELLED' && reason === null) {
      setCancelModal({ open: true, orderId, reason: '' });
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/orders/${orderId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus, admin_cancellation_reason: reason })
      });
      if (res.ok) {
        fetchOrders();
        setCancelModal({ open: false, orderId: null, reason: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelSubmit = () => {
    if (!cancelModal.reason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    updateStatus(cancelModal.orderId, 'CANCELLED', cancelModal.reason);
  };

  const handleSearchSubmit = () => {
    setAppliedSearch(searchTerm);
  };

  const validOrders = Array.isArray(orders) ? orders : [];
  
  const query = appliedSearch ? appliedSearch.toLowerCase().trim() : '';
  const isSearching = query.length > 0;

  const getLCSLength = (s1, s2) => {
    let maxLen = 0;
    const dp = Array(s1.length + 1).fill(0).map(() => Array(s2.length + 1).fill(0));
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i-1] === s2[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
          maxLen = Math.max(maxLen, dp[i][j]);
        }
      }
    }
    return maxLen;
  };

  const getMatchScore = (order, q) => {
    if (order.id.toString() === q) return 10000;
    
    let score = 0;
    const userStr = order.user ? order.user.toLowerCase() : '';
    
    if (userStr.includes(q)) score += 1000;
    if (order.id.toString().includes(q)) score += 500;

    const lcs = getLCSLength(userStr, q);
    if (lcs >= 3 || (q.length < 3 && lcs === q.length)) {
      score += (lcs * 10);
    }
    
    return score;
  };

  let filtered = validOrders;
  if (isSearching) {
    filtered = validOrders.map(o => ({ o, score: getMatchScore(o, query) }))
                          .filter(item => item.score > 0)
                          .sort((a, b) => b.score - a.score)
                          .map(item => item.o);
  }

  if (loading) return <div className="admin-content"><p>Loading orders...</p></div>;

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
    <div className="admin-content animate-fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Manage Orders</h2>
          <p className="admin-subtitle">View and update order statuses.</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ display: 'flex', gap: '10px' }}>
        <div className="search-box" style={{ flex: 1 }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by exact Order ID or User substring..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
        </div>
        <button 
          onClick={handleSearchSubmit} 
          className="btn-primary" 
          style={{ padding: '0 24px', borderRadius: 'var(--border-radius-md)', margin: 0 }}
        >
          Search
        </button>
      </div>

      <div className="admin-table-container glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Items</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr 
                key={o.id} 
                onClick={() => setOrderModal({ open: true, order: o })}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td><strong>#{o.id}</strong></td>
                <td>{o.user}</td>
                <td>{o.items.length} items</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>₹{parseFloat(o.total_amount).toLocaleString()}</td>
                <td>
                  <span className={`status-badge`} style={{ background: `${getStatusColor(o.status)}22`, color: getStatusColor(o.status), border: `1px solid ${getStatusColor(o.status)}` }}>
                    {o.status}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select 
                    className="status-select" 
                    value={o.status} 
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--border-subtle)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cancelModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-subtle)', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-primary)' }}>Cancel Order #{cancelModal.orderId}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Please provide a reason for cancelling this order. This will be sent to the user.</p>
            <textarea
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              placeholder="e.g. Item out of stock"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', minHeight: '80px', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setCancelModal({ open: false, orderId: null, reason: '' })}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button 
                onClick={handleCancelSubmit}
                style={{ padding: '8px 16px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {orderModal.open && orderModal.order && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-subtle)', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: 'var(--color-text-primary)' }}>Order #{orderModal.order.id} Details</h3>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Placed on: {new Date(orderModal.order.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setOrderModal({ open: false, order: null })}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-accent-primary)', marginBottom: '10px' }}>Customer Info</h4>
              <p style={{ margin: '5px 0', color: 'var(--color-text-primary)' }}><strong>User:</strong> {orderModal.order.user}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-accent-primary)', marginBottom: '10px' }}>Order Items</h4>
              <div style={{ background: 'var(--color-bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '10px 15px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Product Name</th>
                      <th style={{ padding: '10px 15px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Quantity</th>
                      <th style={{ padding: '10px 15px', color: 'var(--color-text-secondary)', fontSize: '0.85rem', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderModal.order.items.map((item, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => {
                          if (item.product_id) {
                            setOrderModal({ open: false, order: null });
                            navigate(`/product/${item.product_id}`, {
                              state: { adminTab: 'orders', reopenOrderId: orderModal.order.id }
                            });
                          }
                        }}
                        style={{ 
                          borderBottom: '1px solid var(--border-subtle)', 
                          cursor: item.product_id ? 'pointer' : 'default',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => { if (item.product_id) e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        title={item.product_id ? 'Click to view saree details' : ''}
                      >
                        <td style={{ padding: '10px 15px', color: 'var(--color-text-primary)' }}>{item.product_name}</td>
                        <td style={{ padding: '10px 15px', color: 'var(--color-text-primary)' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--color-text-secondary)' }}>
                          {item.product_id && <ChevronRight size={16} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Status</h4>
                <span className="status-badge" style={{ background: `${getStatusColor(orderModal.order.status)}22`, color: getStatusColor(orderModal.order.status), border: `1px solid ${getStatusColor(orderModal.order.status)}`, display: 'inline-block', marginTop: '5px' }}>
                  {orderModal.order.status}
                </span>
                {orderModal.order.admin_cancellation_reason && (
                  <p style={{ margin: '5px 0 0 0', color: '#ff4d4d', fontSize: '0.85rem' }}>
                    Reason: {orderModal.order.admin_cancellation_reason}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Total Amount</h4>
                <p style={{ margin: '5px 0 0 0', color: 'var(--color-accent-primary)', fontSize: '1.4rem', fontWeight: 'bold' }}>
                  ₹{parseFloat(orderModal.order.total_amount).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button 
                className="btn-primary"
                onClick={() => setOrderModal({ open: false, order: null })}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

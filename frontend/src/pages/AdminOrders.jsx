import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminOrders.css';
import { API_URL } from '../config';

const AdminOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, reason: '' });

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

  const validOrders = Array.isArray(orders) ? orders : [];
  const filtered = validOrders.filter(o => 
    o.id.toString().includes(searchTerm) || (o.user && o.user.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Order ID or User..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
              <tr key={o.id}>
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
                <td>
                  <select 
                    className="status-select" 
                    value={o.status} 
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', outline: 'none' }}
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
          <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', border: '1px solid #333', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Cancel Order #{cancelModal.orderId}</h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>Please provide a reason for cancelling this order. This will be sent to the user.</p>
            <textarea
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              placeholder="e.g. Item out of stock"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff', minHeight: '80px', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setCancelModal({ open: false, orderId: null, reason: '' })}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
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
    </div>
  );
};

export default AdminOrders;

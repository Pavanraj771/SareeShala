import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';
import { API_URL } from '../config';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.token) {
      fetch(`${API_URL}/api/orders/my-orders/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

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
                  <div className="order-card glass-panel" key={o.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', alignItems: 'flex-start' }}>
                    
                    {/* Header: Order ID, Date, Status, Total */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{o.id}</p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                          <Clock size={12}/> {new Date(o.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="order-status" style={{ color: getStatusColor(o.status), background: `${getStatusColor(o.status)}18`, border: `1px solid ${getStatusColor(o.status)}44`, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {o.status}
                        </span>
                        <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Total: ₹{parseFloat(o.total_amount).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{ width: '100%' }}>
                      {o.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
                            {item.image ? <img src={item.image} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>🥻</span>}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.95rem' }}>{item.product_name} (x{item.quantity})</p>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>₹{parseFloat(item.price_at_purchase).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;

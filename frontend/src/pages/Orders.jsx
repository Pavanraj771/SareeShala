import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';

// Mock order data
const mockOrders = [
  { id: 'ORD-2401', item: 'Red Banarasi Silk Saree', amount: '₹4,500', status: 'Delivered',  date: '20 Apr 2025', statusColor: '#4caf50' },
  { id: 'ORD-2389', item: 'Blue Kanjivaram Saree',   amount: '₹6,200', status: 'Shipped',    date: '25 Apr 2025', statusColor: '#d4af37' },
  { id: 'ORD-2371', item: 'Green Chiffon Saree',     amount: '₹2,100', status: 'Processing', date: '27 Apr 2025', statusColor: '#9b59b6' },
];

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="stub-page">
      <div className="stub-bg"><div className="s-orb orb-gold" /><div className="s-orb orb-purple" /></div>
      <div className="stub-content animate-fade-in">
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><Package size={28}/> My Orders</h1>
        <p className="stub-sub">{mockOrders.length} orders found</p>

        <div className="orders-list">
          {mockOrders.map((o) => (
            <div className="order-card glass-panel" key={o.id}>
              <div className="order-left">
                <div className="order-saree-thumb">🥻</div>
                <div>
                  <p className="order-item-name">{o.item}</p>
                  <p className="order-id">{o.id} · <Clock size={12}/> {o.date}</p>
                </div>
              </div>
              <div className="order-right">
                <p className="order-amount">{o.amount}</p>
                <span className="order-status" style={{ color: o.statusColor, background: `${o.statusColor}18`, border: `1px solid ${o.statusColor}44` }}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;

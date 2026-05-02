import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Package, Star, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';
import { API_URL } from '../config';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/my-orders/`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const orders = await res.json();
          let notifs = [];
          
          notifs.push({
            id: 'welcome',
            type: 'system',
            title: 'Welcome to SareeShala ✨',
            message: 'Thank you for joining us! Enjoy an exclusive 10% off on your first purchase.',
            time: 'Just now',
            icon: <Star size={18} color="#d4af37" />
          });

          orders.forEach((o) => {
             let title = `Order #${o.id} Update`;
             let msg = `Your order is currently ${o.status.toLowerCase()}.`;
             if (o.status === 'SHIPPED') {
               msg = `Great news! Your order #${o.id} has been shipped and is on its way.`;
             } else if (o.status === 'DELIVERED') {
               msg = `Your order #${o.id} has been delivered. Enjoy your beautiful saree!`;
             } else if (o.status === 'CANCELLED') {
               msg = `Your order #${o.id} has been cancelled.`;
               if (o.admin_cancellation_reason) {
                 msg += ` Reason: ${o.admin_cancellation_reason}`;
               }
             }
             
             notifs.push({
               id: `ord-${o.id}`,
               type: 'order',
               orderId: o.id,
               title: title,
               message: msg,
               time: new Date(o.created_at).toLocaleDateString(),
               icon: <Package size={18} color={o.status === 'CANCELLED' ? '#e74c3c' : '#3498db'} />,
               items: o.items,
               total: o.total_amount
             });
          });

          notifs.push({
            id: 'promo-1',
            type: 'promo',
            title: 'Bridal Collection Live! 💍',
            message: 'Our stunning new Kanjivaram Bridal collection is now available. Shop before stock runs out!',
            time: '2 days ago',
            icon: <Tag size={18} color="#e91e63" />
          });

          setNotifications(notifs);
          localStorage.setItem('seenNotifCount', notifs.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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
      <div className="stub-content animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><Bell size={28}/> Notifications</h1>
        
        {loading ? (
          <p className="stub-sub">Loading notifications...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔕</span>
                <p>No new notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="glass-panel" 
                     style={{ 
                       padding: '1.5rem', 
                       display: 'flex', 
                       flexDirection: 'column',
                       transition: 'transform 0.2s', 
                       cursor: n.type === 'order' ? 'pointer' : 'default',
                       border: expandedId === n.id ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)'
                     }} 
                     onClick={() => n.type === 'order' && setExpandedId(expandedId === n.id ? null : n.id)}
                     onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{n.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{n.time}</span>
                      </div>
                      <p style={{ margin: 0, color: '#ccc', fontSize: '0.95rem', lineHeight: '1.5' }}>{n.message}</p>
                      {n.type === 'order' && <span style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '5px', display: 'inline-block' }}>{expandedId === n.id ? 'Tap to collapse' : 'Tap to view details'}</span>}
                    </div>
                  </div>
                  
                  {expandedId === n.id && n.type === 'order' && n.items && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#d4af37' }}>Order Items</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {n.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                            {item.image ? (
                              <img src={item.image} alt={item.product_name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '4px' }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#fff', fontSize: '0.9rem' }}>{item.product_name}</div>
                              <div style={{ color: '#888', fontSize: '0.8rem' }}>Qty: {item.quantity}</div>
                            </div>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>₹{item.price_at_purchase}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '10px', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>
                        Total: ₹{n.total}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

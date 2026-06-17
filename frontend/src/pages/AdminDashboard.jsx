import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.adminTab || 'dashboard'
  );
  const [newOrderCount, setNewOrderCount] = useState(0);

  // Fetch total order count and compare with last seen count
  useEffect(() => {
    if (!user || !user.token) return;

    const fetchOrderCount = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/admin/orders/`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const totalOrders = data.length;
          const seenCount = parseInt(localStorage.getItem('adminSeenOrderCount') || '0', 10);
          const diff = totalOrders - seenCount;
          setNewOrderCount(diff > 0 ? diff : 0);
        }
      } catch (err) {
        console.error('Failed to fetch order count', err);
      }
    };

    fetchOrderCount();
  }, [user]);

  // When switching to orders tab, mark all orders as "seen"
  const handleOrdersTab = () => {
    // Save current total count to localStorage so badge clears
    if (user && user.token) {
      fetch(`${API_URL}/api/orders/admin/orders/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          localStorage.setItem('adminSeenOrderCount', data.length.toString());
          setNewOrderCount(0);
        }
      })
      .catch(console.error);
    }
    setActiveTab('orders');
  };

  // Basic role check
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-primary)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: '1rem', padding: '10px 20px', background: 'var(--color-accent-primary)', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Go to Login
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--color-text-primary)', padding: '2rem', fontFamily: 'var(--font-sans)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent-primary)', margin: 0, cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>SareeShala</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Admin Dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Welcome, <strong style={{ color: 'var(--color-text-primary)' }}>{user.username}</strong></span>
          <button 
            onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'var(--color-text-primary)', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#e91e63', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </header>
      
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Placeholder cards for admin features */}
          <div 
            style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-subtle)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={() => setActiveTab('products')}
          >
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-accent-primary)', fontSize: '1.3rem' }}>📦 Manage Products</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
              Add, edit, or remove sarees from the catalog. Update prices and inventory.
            </p>
            <button className="btn-primary" style={{ width: 'fit-content', alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.9rem', margin: 0 }}>View Products</button>
          </div>
          <div 
            style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-subtle)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={handleOrdersTab}
          >
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-accent-primary)', fontSize: '1.3rem' }}>🛒 Manage Orders</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
              View and update customer order statuses. Process shipments and returns.
            </p>
            <div style={{ position: 'relative', width: 'fit-content', alignSelf: 'flex-start' }}>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', margin: 0 }}>View Orders</button>
              {newOrderCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  background: '#7c3aed',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.5)',
                  animation: 'pulseIcon 2s infinite',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0'
                }}>
                  {newOrderCount}
                </span>
              )}
            </div>
          </div>
          <div 
            style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-subtle)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={() => setActiveTab('users')}
          >
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-accent-primary)', fontSize: '1.3rem' }}>👥 User Management</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
              View registered customers, their details, and manage accounts.
            </p>
            <button className="btn-primary" style={{ width: 'fit-content', alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.9rem', margin: 0 }}>View Users</button>
          </div>
        </div>
      )}

      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'orders' && <AdminOrders reopenOrderId={location.state?.reopenOrderId} />}
      {activeTab === 'users' && <AdminUsers />}
    </div>
  );
};

export default AdminDashboard;

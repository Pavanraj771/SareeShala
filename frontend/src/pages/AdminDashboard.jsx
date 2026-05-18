import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

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
            onClick={() => setActiveTab('orders')}
          >
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-accent-primary)', fontSize: '1.3rem' }}>🛒 Manage Orders</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 }}>
              View and update customer order statuses. Process shipments and returns.
            </p>
            <button className="btn-primary" style={{ width: 'fit-content', alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.9rem', margin: 0 }}>View Orders</button>
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
      {activeTab === 'orders' && <AdminOrders />}
      {activeTab === 'users' && <AdminUsers />}
    </div>
  );
};

export default AdminDashboard;

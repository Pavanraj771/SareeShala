import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Basic role check
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#fff', minHeight: '100vh', background: '#121212' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: '1rem', padding: '10px 20px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
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
    <div style={{ minHeight: '100vh', background: '#121212', color: '#fff', padding: '2rem', fontFamily: 'var(--font-sans)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: '#d4af37', margin: 0, cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>SareeShala</h1>
          <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Admin Dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#ddd' }}>Welcome, <strong style={{ color: '#fff' }}>{user.username}</strong></span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#e91e63', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </header>
      
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Placeholder cards for admin features */}
          <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#d4af37' }}>📦 Manage Products</h3>
            <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              Add, edit, or remove sarees from the catalog. Update prices and inventory.
            </p>
            <button onClick={() => setActiveTab('products')} style={{ marginTop: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 12px', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>View Products</button>
          </div>
          <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#d4af37' }}>🛒 Manage Orders</h3>
            <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              View and update customer order statuses. Process shipments and returns.
            </p>
            <button style={{ marginTop: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 12px', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>View Orders</button>
          </div>
          <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#d4af37' }}>👥 User Management</h3>
            <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              View registered customers, their details, and manage accounts.
            </p>
            <button onClick={() => setActiveTab('users')} style={{ marginTop: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 12px', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>View Users</button>
          </div>
        </div>
      )}

      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'users' && <AdminUsers />}
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import './AdminUsers.css'; // Let's also create this if needed, or put inline. We will use inline styles.
import { API_URL } from '../config';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState(null);
  const [viewUserDetailsId, setViewUserDetailsId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('summary');
  const { showMessage } = useAuth();
  const navigate = useNavigate();
  
  const token = user?.token || 'admin_token_123'; // fallback for hardcoded admin
  const isDemoAdmin = user?.token === 'admin_token_123';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/admin/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/toggle-block/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to toggle status');
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u));
      setUserDetails(prev => {
        if (prev && prev.profile && prev.profile.id === userId) {
          return { ...prev, profile: { ...prev.profile, is_active: data.is_active } };
        }
        return prev;
      });
      showMessage(data.message || 'User status updated');
    } catch (err) {
      showMessage(err.message);
    }
  };

  const confirmDelete = (userId) => {
    setDeleteConfirmUserId(userId);
  };

  const handleViewDetails = async (userId) => {
    setViewUserDetailsId(userId);
    setDetailsLoading(true);
    setUserDetails(null);
    setActiveDetailTab('summary');
    try {
      const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/details/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch details');
      const data = await response.json();
      setUserDetails(data);
    } catch (err) {
      showMessage(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const executeDelete = async () => {
    const userId = deleteConfirmUserId;
    setDeleteConfirmUserId(null);
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/users/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      // Remove from local state
      setUsers(users.filter(u => u.id !== userId));
      if (viewUserDetailsId === userId) {
        setViewUserDetailsId(null);
      }
      showMessage('User deleted successfully.');
    } catch (err) {
      showMessage(err.message);
    }
  };

  if (loading) {
    return <div style={{ color: '#fff', padding: '2rem' }}>Loading users...</div>;
  }

  if (error) {
    return <div style={{ color: '#ff4d4f', padding: '2rem' }}>Error: {error}</div>;
  }

  return (
    <div className="admin-content animate-fade-in" style={{ background: 'var(--color-bg-primary)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', color: 'var(--color-text-primary)', border: '1px solid var(--border-subtle)' }}>
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-only-col { display: none !important; }
            .mobile-only-btn { display: flex !important; }
          }
          @media (min-width: 769px) {
            .mobile-only-btn { display: none !important; }
          }
        `}
      </style>
      <h2 style={{ color: 'var(--color-accent-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>User Management</h2>
      
      {isDemoAdmin && (
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--color-accent-primary)' }}>
          <p style={{ margin: 0, color: 'var(--color-accent-primary)' }}><strong>Note:</strong> You are using the demo admin account. Real admin functionality is fully active.</p>
        </div>
      )}

      <div style={{ overflowX: 'auto', background: 'var(--color-bg-secondary)', borderRadius: 'var(--border-radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="desktop-only-col" style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Username</th>
              <th className="desktop-only-col" style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Email</th>
              <th className="desktop-only-col" style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Status</th>
              <th className="desktop-only-col" style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Joined</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td className="desktop-only-col" style={{ padding: '1rem', color: 'var(--color-text-primary)' }}>{u.id}</td>
                <td style={{ padding: '1rem', color: 'var(--color-text-primary)' }}>
                  <span style={{ fontWeight: 'bold' }}>{u.username}</span>
                  {u.is_staff && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'var(--color-accent-primary)', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>Admin</span>}
                </td>
                <td className="desktop-only-col" style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                <td className="desktop-only-col" style={{ padding: '1rem' }}>
                  {u.is_deleted_by_user ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#e91e63', background: 'rgba(233, 30, 99, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }} title="This account was deleted by user">
                      <XCircle size={14} /> Deleted by User
                    </span>
                  ) : u.is_active ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      <CheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f44336', background: 'rgba(244, 67, 54, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      <XCircle size={14} /> Blocked
                    </span>
                  )}
                </td>
                <td className="desktop-only-col" style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{u.date_joined.split(' ')[0]}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleViewDetails(u.id)}
                      style={{ 
                        background: 'rgba(33, 150, 243, 0.1)', 
                        color: '#2196f3', 
                        border: '1px solid transparent', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Eye size={14} /> Details
                    </button>
                    <button 
                      className="desktop-only-col"
                      onClick={() => handleToggleBlock(u.id)}
                      disabled={u.is_staff}
                      style={{ 
                        background: u.is_active ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)', 
                        color: u.is_active ? '#ff9800' : '#4caf50', 
                        border: '1px solid transparent', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: u.is_staff ? 'not-allowed' : 'pointer',
                        opacity: u.is_staff ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <ShieldAlert size={14} /> {u.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      className="desktop-only-col"
                      onClick={() => confirmDelete(u.id)}
                      disabled={u.is_staff}
                      style={{ 
                        background: 'rgba(244, 67, 54, 0.1)', 
                        color: '#f44336', 
                        border: '1px solid transparent', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: u.is_staff ? 'not-allowed' : 'pointer',
                        opacity: u.is_staff ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirmUserId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            background: 'var(--color-bg-primary)',
            padding: '2rem',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: 'var(--color-text-primary)', marginTop: 0, marginBottom: '1rem' }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteConfirmUserId(null)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--color-text-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                style={{
                  padding: '8px 16px',
                  background: '#f44336',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {viewUserDetailsId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-bg-primary)',
            padding: 'clamp(1rem, 4vw, 2rem)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '800px',
            width: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setViewUserDetailsId(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              &times;
            </button>
            <h3 style={{ color: 'var(--color-accent-primary)', marginTop: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              User Details
            </h3>

            {detailsLoading ? (
              <div style={{ color: 'var(--color-text-primary)', textAlign: 'center', padding: '2rem' }}>Loading user details...</div>
            ) : userDetails ? (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: 'var(--color-text-primary)'}}>Username:</strong> {userDetails.profile.username}</p>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: 'var(--color-text-primary)'}}>Name:</strong> {userDetails.profile.first_name} {userDetails.profile.last_name}</p>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: 'var(--color-text-primary)'}}>Email:</strong> {userDetails.profile.email}</p>
                  </div>
                  <div>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: 'var(--color-text-primary)'}}>Phone:</strong> {userDetails.profile.phone_number || 'N/A'}</p>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: 'var(--color-text-primary)'}}>Joined:</strong> {userDetails.profile.date_joined}</p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Status:</strong> {userDetails.profile.is_deleted_by_user ? <span style={{color: '#e91e63', fontWeight: 'bold'}}>Deleted by User</span> : userDetails.profile.is_active ? <span style={{color: '#4caf50'}}>Active</span> : <span style={{color: '#f44336'}}>Blocked</span>}
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: 'var(--color-text-primary)'}}>Address:</strong> {userDetails.profile.address || 'N/A'}</p>
                  </div>
                </div>

                {activeDetailTab === 'summary' && (
                  <>
                    <h4 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px', marginBottom: '10px' }}>Activity Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                      <div onClick={() => setActiveDetailTab('orders')} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='var(--border-subtle)'} onMouseOut={e => e.currentTarget.style.background='var(--color-bg-secondary)'}>
                        <div style={{ fontSize: '1.2rem', color: 'var(--color-accent-primary)', fontWeight: 'bold' }}>{userDetails.stats.total_orders}</div>
                        <div style={{ fontSize: '0.8rem' }}>Orders</div>
                      </div>
                      <div onClick={() => setActiveDetailTab('orders')} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='var(--border-subtle)'} onMouseOut={e => e.currentTarget.style.background='var(--color-bg-secondary)'}>
                        <div style={{ fontSize: '1.2rem', color: '#4caf50', fontWeight: 'bold' }}>₹{userDetails.stats.total_spent}</div>
                        <div style={{ fontSize: '0.8rem' }}>Spent</div>
                      </div>
                      <div onClick={() => setActiveDetailTab('cart')} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='var(--border-subtle)'} onMouseOut={e => e.currentTarget.style.background='var(--color-bg-secondary)'}>
                        <div style={{ fontSize: '1.2rem', color: '#2196f3', fontWeight: 'bold' }}>{userDetails.stats.cart_items}</div>
                        <div style={{ fontSize: '0.8rem' }}>Cart Items</div>
                      </div>
                      <div onClick={() => setActiveDetailTab('wishlist')} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='var(--border-subtle)'} onMouseOut={e => e.currentTarget.style.background='var(--color-bg-secondary)'}>
                        <div style={{ fontSize: '1.2rem', color: '#e91e63', fontWeight: 'bold' }}>{userDetails.stats.wishlist_items}</div>
                        <div style={{ fontSize: '0.8rem' }}>Wishlist Items</div>
                      </div>
                    </div>

                    {userDetails.recent_orders?.length > 0 && (
                      <>
                        <h4 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px', marginBottom: '10px' }}>Recent Orders</h4>
                        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '400px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Order ID</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Date</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Status</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userDetails.recent_orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                  <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)' }}>#{order.id}</td>
                                  <td style={{ padding: '10px 12px' }}>{order.created_at}</td>
                                  <td style={{ padding: '10px 12px' }}>{order.status}</td>
                                  <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)' }}>₹{order.total_amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeDetailTab !== 'summary' && (
                  <div>
                    <button 
                      onClick={() => setActiveDetailTab('summary')}
                      style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', fontSize: '0.85rem' }}
                    >
                      &larr; Back to Summary
                    </button>

                    {activeDetailTab === 'orders' && (
                      <>
                        <h4 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px', marginBottom: '10px' }}>All Orders</h4>
                        {userDetails.all_orders?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {userDetails.all_orders.map(order => (
                              <div key={order.id} style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '10px' }}>
                                  <div>
                                    <strong style={{ color: 'var(--color-accent-primary)' }}>Order #{order.id}</strong> <br/>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{order.created_at}</span>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-text-primary)' }}>{order.status}</span><br/>
                                    <strong style={{ color: 'var(--color-text-primary)' }}>Total: ₹{order.total_amount}</strong>
                                  </div>
                                </div>
                                <div>
                                  <h5 style={{ margin: '0 0 10px 0', color: 'var(--color-text-secondary)' }}>Items:</h5>
                                  {order.items && order.items.map(item => (
                                    <div 
                                      key={item.id} 
                                      onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: item.product_id ? 'pointer' : 'default', padding: '5px', borderRadius: '4px', transition: 'background 0.2s' }}
                                      onMouseOver={e => item.product_id && (e.currentTarget.style.background='var(--border-subtle)')} 
                                      onMouseOut={e => e.currentTarget.style.background='transparent'}
                                    >
                                      {item.image ? (
                                        <img src={item.image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                      ) : (
                                        <div style={{ width: '50px', height: '50px', background: 'var(--border-subtle)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>No Img</div>
                                      )}
                                      <div>
                                        <div style={{ fontWeight: 'bold', color: item.product_id ? '#2196f3' : 'var(--color-text-primary)' }}>{item.product_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Qty: {item.quantity} | ₹{item.price} each</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : <p>No orders found.</p>}
                      </>
                    )}

                    {activeDetailTab === 'cart' && (
                      <>
                        <h4 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px', marginBottom: '10px' }}>Cart Items</h4>
                        {userDetails.cart_items?.length > 0 ? (
                          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '500px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Image</th>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Product Name</th>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Price</th>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Qty</th>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Added On</th>
                                </tr>
                              </thead>
                              <tbody>
                                {userDetails.cart_items.map(item => (
                                  <tr 
                                    key={item.id} 
                                    onClick={() => navigate(`/product/${item.product_id}`)}
                                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background='var(--border-subtle)'} 
                                    onMouseOut={e => e.currentTarget.style.background='transparent'}
                                  >
                                    <td style={{ padding: '10px' }}>
                                      {item.image ? (
                                          <img src={item.image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                          <div style={{ width: '50px', height: '50px', background: 'var(--border-subtle)', borderRadius: '4px' }}></div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', color: '#2196f3', fontWeight: 'bold' }}>{item.product_name}</td>
                                    <td style={{ padding: '10px', color: 'var(--color-text-primary)' }}>₹{item.price}</td>
                                    <td style={{ padding: '10px', color: 'var(--color-text-primary)' }}>{item.quantity}</td>
                                    <td style={{ padding: '10px', color: 'var(--color-text-secondary)' }}>{item.added_at}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p>Cart is empty.</p>}
                      </>
                    )}

                    {activeDetailTab === 'wishlist' && (
                      <>
                        <h4 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px', marginBottom: '10px' }}>Wishlist Items</h4>
                        {userDetails.wishlist_items?.length > 0 ? (
                          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '450px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Image</th>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Product Name</th>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Price</th>
                                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Added On</th>
                                </tr>
                              </thead>
                              <tbody>
                                {userDetails.wishlist_items.map(item => (
                                  <tr 
                                    key={item.id} 
                                    onClick={() => navigate(`/product/${item.product_id}`)}
                                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background='var(--border-subtle)'} 
                                    onMouseOut={e => e.currentTarget.style.background='transparent'}
                                  >
                                    <td style={{ padding: '10px' }}>
                                      {item.image ? (
                                          <img src={item.image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                          <div style={{ width: '50px', height: '50px', background: 'var(--border-subtle)', borderRadius: '4px' }}></div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', color: '#2196f3', fontWeight: 'bold' }}>{item.product_name}</td>
                                    <td style={{ padding: '10px', color: 'var(--color-text-primary)' }}>₹{item.price}</td>
                                    <td style={{ padding: '10px', color: 'var(--color-text-secondary)' }}>{item.added_at}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p>Wishlist is empty.</p>}
                      </>
                    )}
                  </div>
                )}
                
                <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', marginRight: '5px' }}>Actions:</span>
                    <button 
                      onClick={() => handleToggleBlock(userDetails.profile.id)}
                      disabled={userDetails.profile.is_staff}
                      style={{ 
                        background: userDetails.profile.is_active ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)', 
                        color: userDetails.profile.is_active ? '#ff9800' : '#4caf50', 
                        border: '1px solid transparent', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: userDetails.profile.is_staff ? 'not-allowed' : 'pointer',
                        opacity: userDetails.profile.is_staff ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <ShieldAlert size={14} /> {userDetails.profile.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      onClick={() => confirmDelete(userDetails.profile.id)}
                      disabled={userDetails.profile.is_staff}
                      style={{ 
                        background: 'rgba(244, 67, 54, 0.1)', 
                        color: '#f44336', 
                        border: '1px solid transparent', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: userDetails.profile.is_staff ? 'not-allowed' : 'pointer',
                        opacity: userDetails.profile.is_staff ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => setViewUserDetailsId(null)}
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#ff4d4f', textAlign: 'center', padding: '2rem' }}>Failed to load user details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

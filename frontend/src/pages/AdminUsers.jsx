import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import './AdminUsers.css'; // Let's also create this if needed, or put inline. We will use inline styles.

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
      const response = await fetch('http://localhost:8000/api/users/admin/users/', {
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
      const response = await fetch(`http://localhost:8000/api/users/admin/users/${userId}/toggle-block/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to toggle status');
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u));
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
      const response = await fetch(`http://localhost:8000/api/users/admin/users/${userId}/details/`, {
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
      const response = await fetch(`http://localhost:8000/api/users/admin/users/${userId}/`, {
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
    <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', color: '#fff' }}>
      <h2 style={{ color: '#d4af37', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>User Management</h2>
      
      {isDemoAdmin && (
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #d4af37' }}>
          <p style={{ margin: 0, color: '#d4af37' }}><strong>Note:</strong> You are using the demo admin account. Real admin functionality is fully active.</p>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '1rem', color: '#aaa', fontWeight: 'normal' }}>ID</th>
              <th style={{ padding: '1rem', color: '#aaa', fontWeight: 'normal' }}>Username</th>
              <th style={{ padding: '1rem', color: '#aaa', fontWeight: 'normal' }}>Email</th>
              <th style={{ padding: '1rem', color: '#aaa', fontWeight: 'normal' }}>Status</th>
              <th style={{ padding: '1rem', color: '#aaa', fontWeight: 'normal' }}>Joined</th>
              <th style={{ padding: '1rem', color: '#aaa', fontWeight: 'normal' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                <td style={{ padding: '1rem' }}>{u.id}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{u.username}</span>
                  {u.is_staff && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#d4af37', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>Admin</span>}
                </td>
                <td style={{ padding: '1rem', color: '#ccc' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  {u.is_active ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      <CheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f44336', background: 'rgba(244, 67, 54, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      <XCircle size={14} /> Blocked
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', color: '#aaa', fontSize: '0.9rem' }}>{u.date_joined.split(' ')[0]}</td>
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
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
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
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e1e1e',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #333',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1rem' }}>Confirm Deletion</h3>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteConfirmUserId(null)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #555',
                  color: '#fff',
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
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#121212',
            padding: '2rem 5%',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setViewUserDetailsId(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              &times;
            </button>
            <h3 style={{ color: '#d4af37', marginTop: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              User Details
            </h3>

            {detailsLoading ? (
              <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading user details...</div>
            ) : userDetails ? (
              <div style={{ color: '#ccc', fontSize: '0.95rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ margin: '5px 0' }}><strong>Username:</strong> {userDetails.profile.username}</p>
                    <p style={{ margin: '5px 0' }}><strong>Name:</strong> {userDetails.profile.first_name} {userDetails.profile.last_name}</p>
                    <p style={{ margin: '5px 0' }}><strong>Email:</strong> {userDetails.profile.email}</p>
                  </div>
                  <div>
                    <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {userDetails.profile.phone_number || 'N/A'}</p>
                    <p style={{ margin: '5px 0' }}><strong>Joined:</strong> {userDetails.profile.date_joined}</p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Status:</strong> {userDetails.profile.is_active ? <span style={{color: '#4caf50'}}>Active</span> : <span style={{color: '#f44336'}}>Blocked</span>}
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ margin: '5px 0' }}><strong>Address:</strong> {userDetails.profile.address || 'N/A'}</p>
                  </div>
                </div>

                {activeDetailTab === 'summary' && (
                  <>
                    <h4 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>Activity Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                      <div onClick={() => setActiveDetailTab('orders')} style={{ background: '#2a2a2a', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#333'} onMouseOut={e => e.currentTarget.style.background='#2a2a2a'}>
                        <div style={{ fontSize: '1.2rem', color: '#d4af37', fontWeight: 'bold' }}>{userDetails.stats.total_orders}</div>
                        <div style={{ fontSize: '0.8rem' }}>Orders</div>
                      </div>
                      <div onClick={() => setActiveDetailTab('orders')} style={{ background: '#2a2a2a', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#333'} onMouseOut={e => e.currentTarget.style.background='#2a2a2a'}>
                        <div style={{ fontSize: '1.2rem', color: '#4caf50', fontWeight: 'bold' }}>₹{userDetails.stats.total_spent}</div>
                        <div style={{ fontSize: '0.8rem' }}>Spent</div>
                      </div>
                      <div onClick={() => setActiveDetailTab('cart')} style={{ background: '#2a2a2a', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#333'} onMouseOut={e => e.currentTarget.style.background='#2a2a2a'}>
                        <div style={{ fontSize: '1.2rem', color: '#2196f3', fontWeight: 'bold' }}>{userDetails.stats.cart_items}</div>
                        <div style={{ fontSize: '0.8rem' }}>Cart Items</div>
                      </div>
                      <div onClick={() => setActiveDetailTab('wishlist')} style={{ background: '#2a2a2a', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#333'} onMouseOut={e => e.currentTarget.style.background='#2a2a2a'}>
                        <div style={{ fontSize: '1.2rem', color: '#e91e63', fontWeight: 'bold' }}>{userDetails.stats.wishlist_items}</div>
                        <div style={{ fontSize: '0.8rem' }}>Wishlist Items</div>
                      </div>
                    </div>

                    {userDetails.recent_orders?.length > 0 && (
                      <>
                        <h4 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>Recent Orders</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #444' }}>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Order ID</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.recent_orders.map(order => (
                              <tr key={order.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '8px' }}>#{order.id}</td>
                                <td style={{ padding: '8px' }}>{order.created_at}</td>
                                <td style={{ padding: '8px' }}>{order.status}</td>
                                <td style={{ padding: '8px' }}>₹{order.total_amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </>
                )}

                {activeDetailTab !== 'summary' && (
                  <div>
                    <button 
                      onClick={() => setActiveDetailTab('summary')}
                      style={{ background: 'transparent', border: '1px solid #555', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', fontSize: '0.85rem' }}
                    >
                      &larr; Back to Summary
                    </button>

                    {activeDetailTab === 'orders' && (
                      <>
                        <h4 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>All Orders</h4>
                        {userDetails.all_orders?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {userDetails.all_orders.map(order => (
                              <div key={order.id} style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '10px' }}>
                                  <div>
                                    <strong style={{ color: '#d4af37' }}>Order #{order.id}</strong> <br/>
                                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{order.created_at}</span>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '4px' }}>{order.status}</span><br/>
                                    <strong>Total: ₹{order.total_amount}</strong>
                                  </div>
                                </div>
                                <div>
                                  <h5 style={{ margin: '0 0 10px 0', color: '#ccc' }}>Items:</h5>
                                  {order.items && order.items.map(item => (
                                    <div 
                                      key={item.id} 
                                      onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: item.product_id ? 'pointer' : 'default', padding: '5px', borderRadius: '4px', transition: 'background 0.2s' }}
                                      onMouseOver={e => item.product_id && (e.currentTarget.style.background='rgba(255,255,255,0.05)')} 
                                      onMouseOut={e => e.currentTarget.style.background='transparent'}
                                    >
                                      {item.image ? (
                                        <img src={item.image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                      ) : (
                                        <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#777' }}>No Img</div>
                                      )}
                                      <div>
                                        <div style={{ fontWeight: 'bold', color: item.product_id ? '#2196f3' : '#fff' }}>{item.product_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Qty: {item.quantity} | ₹{item.price} each</div>
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
                        <h4 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>Cart Items</h4>
                        {userDetails.cart_items?.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Product Image</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Product Name</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Price</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Qty</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Added On</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userDetails.cart_items.map(item => (
                                <tr 
                                  key={item.id} 
                                  onClick={() => navigate(`/product/${item.product_id}`)}
                                  style={{ borderBottom: '1px solid #333', cursor: 'pointer', transition: 'background 0.2s' }}
                                  onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} 
                                  onMouseOut={e => e.currentTarget.style.background='transparent'}
                                >
                                  <td style={{ padding: '8px' }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                      ) : (
                                        <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '4px' }}></div>
                                      )}
                                  </td>
                                  <td style={{ padding: '8px', color: '#2196f3', fontWeight: 'bold' }}>{item.product_name}</td>
                                  <td style={{ padding: '8px' }}>₹{item.price}</td>
                                  <td style={{ padding: '8px' }}>{item.quantity}</td>
                                  <td style={{ padding: '8px', color: '#aaa' }}>{item.added_at}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : <p>Cart is empty.</p>}
                      </>
                    )}

                    {activeDetailTab === 'wishlist' && (
                      <>
                        <h4 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>Wishlist Items</h4>
                        {userDetails.wishlist_items?.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Product Image</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Product Name</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Price</th>
                                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Added On</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userDetails.wishlist_items.map(item => (
                                <tr 
                                  key={item.id} 
                                  onClick={() => navigate(`/product/${item.product_id}`)}
                                  style={{ borderBottom: '1px solid #333', cursor: 'pointer', transition: 'background 0.2s' }}
                                  onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} 
                                  onMouseOut={e => e.currentTarget.style.background='transparent'}
                                >
                                  <td style={{ padding: '8px' }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                      ) : (
                                        <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '4px' }}></div>
                                      )}
                                  </td>
                                  <td style={{ padding: '8px', color: '#2196f3', fontWeight: 'bold' }}>{item.product_name}</td>
                                  <td style={{ padding: '8px' }}>₹{item.price}</td>
                                  <td style={{ padding: '8px', color: '#aaa' }}>{item.added_at}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : <p>Wishlist is empty.</p>}
                      </>
                    )}
                  </div>
                )}
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

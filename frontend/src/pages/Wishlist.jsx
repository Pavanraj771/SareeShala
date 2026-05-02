import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';

const initialWishlist = [
  { id: 1, name: 'Purple Georgette Saree',  price: '₹3,200', tag: 'Party Wear'  },
  { id: 2, name: 'Orange Pure Silk Saree',  price: '₹7,800', tag: 'Bridal'      },
  { id: 3, name: 'Yellow Cotton Saree',     price: '₹1,400', tag: 'Casual'      },
  { id: 4, name: 'Pink Bollywood Saree',    price: '₹2,900', tag: 'Designer'    },
];

const Wishlist = () => {
  const { user, showMessage } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.token) {
      fetch('http://localhost:8000/api/users/wishlist/', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        }
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

  const remove = async (id) => {
    try {
      await fetch('http://localhost:8000/api/users/wishlist/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ product_id: id })
      });
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (id) => {
    try {
      const res = await fetch('http://localhost:8000/api/orders/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ product_id: id, quantity: 1 })
      });
      const data = await res.json();
      if (showMessage) showMessage(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="stub-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>Login to see your wishlist.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="stub-page"><div className="stub-content animate-fade-in"><h1 className="stub-title">Loading...</h1></div></div>;
  }

  return (
    <div className="stub-page">
      <div className="stub-bg"><div className="s-orb orb-gold"/><div className="s-orb orb-purple"/></div>
      <div className="stub-content animate-fade-in">
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <h1 className="stub-title"><Heart size={28}/> My Wishlist</h1>
        <p className="stub-sub">{items.length} items saved</p>

        {items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💔</span>
            <p>Your wishlist is empty.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Browse Sarees</button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => (
              <div className="wishlist-card glass-panel" key={item.id} onClick={() => navigate(`/product/${item.id}`)} style={{ cursor: 'pointer' }}>
                <div className="wishlist-thumb" style={{ padding: 0, overflow: 'hidden' }}>
                  {item.image1 ? <img src={item.image1} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🥻'}
                </div>
                <div className="wishlist-info">
                  <span className="wishlist-tag">{item.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  <h3 className="wishlist-name">{item.name}</h3>
                  <p className="wishlist-price">₹{item.price}</p>
                  <div className="wishlist-actions">
                    <button className="add-cart-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(item.id); }}><ShoppingBag size={14}/> Add to Cart</button>
                    <button className="remove-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(item.id); }}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

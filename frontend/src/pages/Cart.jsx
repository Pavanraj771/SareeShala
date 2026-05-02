import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';
import { API_URL } from '../config';

const Cart = () => {
  const navigate = useNavigate();
  const { user, showMessage } = useAuth();
  const [items, setItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/orders/cart/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setItems(data.items || []);
      setCartTotal(parseFloat(data.cart_total) || 0);
      if (data.items) {
        const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
        localStorage.setItem('seenCartCount', total.toString());
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const update = async (id, delta) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    // We update via POST by sending the exact new quantity or calculating it on backend.
    // Our backend adds quantity on POST, so to decrement we'd need a different approach,
    // or just send delta. Wait, our backend POST does:
    // if not created: cart_item.quantity += quantity.
    // So sending delta as quantity works!
    
    // But if qty becomes 0, we should remove it
    if (item.quantity + delta <= 0) {
      return remove(id);
    }

    try {
      await fetch(`${API_URL}/api/orders/cart/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ product_id: id, quantity: delta })
      });
      fetchCart(); // Refresh cart to get accurate totals
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      await fetch(`${API_URL}/api/orders/cart/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ product_id: id })
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const delivery = items.length > 0 ? 99 : 0;
  const total = cartTotal + delivery;

  if (!user) {
    return (
      <div className="stub-gate">
        <div className="gate-card animate-fade-in">
          <div className="gate-icon">🔒</div>
          <h2>Please Sign In</h2>
          <p>Login to view and manage your cart.</p>
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
        <h1 className="stub-title"><ShoppingBag size={28}/> My Cart</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🛒</span>
            <p>Your cart is empty.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Shop Now</button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-card glass-panel" key={item.id}>
                  <div className="cart-thumb" style={{ padding: 0, overflow: 'hidden' }}>
                    {item.image1 ? <img src={item.image1} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🥻'}
                  </div>
                  <div className="cart-info">
                    <h3 className="cart-name">{item.name}</h3>
                    <p className="cart-unit-price">₹{parseFloat(item.price).toLocaleString()}</p>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => update(item.id, -1)}><Minus size={12}/></button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => update(item.id, +1)}><Plus size={12}/></button>
                    </div>
                  </div>
                  <div className="cart-right">
                    <p className="cart-line-total">₹{parseFloat(item.item_total).toLocaleString()}</p>
                    <button className="remove-btn" onClick={() => remove(item.id)}><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary glass-panel">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Delivery</span><span>₹{delivery}</span></div>
              <div className="summary-divider"/>
              <div className="summary-row summary-total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              <button id="checkout-btn" className="auth-submit" style={{marginTop:'1rem'}} onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button className="demo-btn" style={{marginTop:'0.5rem'}} onClick={() => navigate('/')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

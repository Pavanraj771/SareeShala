import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StubPage.css';
import { API_URL } from '../config';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, showMessage } = useAuth();
  
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    address: user?.address || '',
    city: '',
    pincode: '',
    phone: user?.phone_number || ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/cart/`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        setCartTotal(parseFloat(data.cart_total) || 0);
        setLoading(false);
        if (!data.items || data.items.length === 0) {
          showMessage('Your cart is empty.');
          navigate('/cart');
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchCart();
  }, [user, navigate, showMessage]);

  const handleChange = (e) => {
    setShippingDetails({...shippingDetails, [e.target.name]: e.target.value});
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingDetails.address || !shippingDetails.city || !shippingDetails.pincode) {
      showMessage('Please complete your shipping address.');
      return;
    }

    setProcessing(true);

    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/checkout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            payment_method: paymentMethod,
            shipping_address: `${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.pincode}`
          })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('seenCartCount', '0');
          showMessage(`Order placed successfully via ${paymentMethod.toUpperCase()}!`);
          navigate('/orders');
        } else {
          showMessage(data.error || 'Failed to place order.');
          setProcessing(false);
        }
      } catch (err) {
        console.error(err);
        showMessage('Error processing payment.');
        setProcessing(false);
      }
    }, 1500);
  };

  const delivery = cartTotal > 0 ? 99 : 0;
  const total = cartTotal + delivery;

  if (loading) return <div className="stub-page"><div className="stub-content animate-fade-in"><h1 className="stub-title">Loading Checkout...</h1></div></div>;

  return (
    <div className="stub-page" style={{ paddingBottom: '4rem' }}>
      <div className="stub-bg"><div className="s-orb orb-gold"/><div className="s-orb orb-purple"/></div>
      <div className="stub-content animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button className="stub-back" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back to Cart</button>
        <h1 className="stub-title"><ShieldCheck size={28}/> Secure Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }} className="checkout-grid">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20}/> Shipping Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Full Name</label>
                  <input required name="fullName" value={shippingDetails.fullName} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Phone Number</label>
                  <input required name="phone" value={shippingDetails.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Address</label>
                <textarea required name="address" value={shippingDetails.address} onChange={handleChange} rows="2" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: 'rgba(0,0,0,0.2)', color: '#fff', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>City</label>
                  <input required name="city" value={shippingDetails.city} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>PIN Code</label>
                  <input required name="pincode" value={shippingDetails.pincode} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20}/> Payment Method
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: `1px solid ${paymentMethod === 'upi' ? '#d4af37' : '#444'}`, borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'upi' ? 'rgba(212,175,55,0.05)' : 'transparent', transition: 'all 0.2s' }}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold' }}>UPI (Google Pay, PhonePe, Paytm)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: `1px solid ${paymentMethod === 'card' ? '#d4af37' : '#444'}`, borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'card' ? 'rgba(212,175,55,0.05)' : 'transparent', transition: 'all 0.2s' }}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold' }}>Credit / Debit Card</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: `1px solid ${paymentMethod === 'cod' ? '#d4af37' : '#444'}`, borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'cod' ? 'rgba(212,175,55,0.05)' : 'transparent', transition: 'all 0.2s' }}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold' }}>Cash on Delivery</span>
                </label>
              </div>
            </form>
          </div>

          <div className="cart-summary glass-panel" style={{ alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <h3 className="summary-title">Payment Summary</h3>
            <div className="summary-row"><span>Cart Value</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Delivery Fee</span><span>₹{delivery}</span></div>
            <div className="summary-divider"/>
            <div className="summary-row summary-total"><span>Amount to Pay</span><span style={{ color: '#d4af37' }}>₹{total.toLocaleString()}</span></div>
            <button type="submit" form="checkout-form" className="auth-submit" style={{marginTop:'1.5rem', height: '50px', fontSize: '1.1rem'}} disabled={processing}>
              {processing ? <><Loader2 className="spin" size={20} style={{ marginRight: '8px', display: 'inline' }} /> Processing...</> : 'Pay & Place Order'}
            </button>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#888', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <ShieldCheck size={14}/> Secure Encrypted Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

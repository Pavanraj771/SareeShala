import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingBag, Heart, Star, MessageSquare } from 'lucide-react';
import ProductReviewsModal from '../components/ProductReviewsModal';
import { useAuth } from '../context/AuthContext';
import './ProductDetails.css';
import { API_URL } from '../config';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, showMessage } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const isAdmin = user?.is_staff || user?.token === 'admin_token_123';

  useEffect(() => {
    if (location.state?.adminTab) {
      setAnalyticsLoading(true);
      axios.get(`${API_URL}/api/products/${id}/analytics/`)
        .then(res => {
          setAnalytics(res.data);
        })
        .catch(err => {
          console.error("Failed to fetch analytics:", err);
        })
        .finally(() => {
          setAnalyticsLoading(false);
        });
    }
  }, [id, location.state?.adminTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${id}/`);
        setProduct(res.data);
        setMainImage(res.data.image1 || res.data.image1_url || 'https://via.placeholder.com/400');
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch product details.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (user && user.token) {
      fetch(`${API_URL}/api/users/wishlist/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Check if this specific product id is in the wishlist
          const found = data.some(item => item.id === parseInt(id));
          setIsLiked(found);
        }
      })
      .catch(console.error);
    }
  }, [user, id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      if (showMessage) showMessage('Please log in to add items to your wishlist.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/users/wishlist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ product_id: id })
      });
      const data = await res.json();
      setIsLiked(data.liked);
      if (showMessage) showMessage(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users/reviews/product/${id}/`);
      setReviews(res.data);
      setShowReviews(true);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      if (showMessage) showMessage('Failed to load reviews.');
    } finally {
      setReviewsLoading(false);
    }
  };

  const addToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      if (showMessage) showMessage('Please log in to add items to your cart.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/orders/cart/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ product_id: id, quantity: 1 })
      });
      const data = await res.json();
      if (showMessage) showMessage(data.message);
      
      // Dispatch custom event to notify Navbar immediately
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-state">Loading product details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!product) return null;

  const images = [
    product.image1 || product.image1_url,
    product.image2 || product.image2_url,
    product.image3 || product.image3_url,
    product.image4 || product.image4_url,
    product.image5 || product.image5_url
  ].filter(Boolean);

  return (
    <div className="product-details-container animate-fade-in">
      <button className="back-btn" onClick={() => {
        if (location.state?.adminTab) {
          navigate('/admin', { state: { adminTab: location.state.adminTab, reopenOrderId: location.state.reopenOrderId } });
        } else {
          navigate(-1);
        }
      }}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="product-content">
        <div className="product-gallery">
          <div className="main-image-container">
            <img src={mainImage} alt={product.name} className="main-image" />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`${product.name} ${idx + 1}`} 
                  className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title text-gradient">{product.name}</h1>
          <p className="product-price">₹{product.price}</p>
          
          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          {product.color_variants && product.color_variants.length > 1 && (
            <div className="product-variants" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#ccc', marginBottom: '10px' }}>Available Colors</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {product.color_variants.map(variant => (
                  <div 
                    key={variant.id}
                    onClick={() => navigate(`/product/${variant.id}`, { state: location.state })}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '6px',
                      cursor: 'pointer' 
                    }}
                  >
                    <div 
                      title={variant.color_name}
                      style={{ 
                        width: '35px', 
                        height: '35px', 
                        borderRadius: '50%', 
                        background: variant.color_hex || '#ccc', 
                        border: variant.id === parseInt(id) ? '3px solid #d4af37' : '1px solid #555',
                        boxShadow: variant.id === parseInt(id) ? '0 0 10px rgba(212,175,55,0.5)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.15)';
                        e.currentTarget.style.borderColor = '#d4af37';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        if (variant.id !== parseInt(id)) e.currentTarget.style.borderColor = '#555';
                      }}
                    />
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: variant.id === parseInt(id) ? '#d4af37' : '#aaa', 
                      fontWeight: variant.id === parseInt(id) ? 'bold' : 'normal',
                      textAlign: 'center',
                      maxWidth: '80px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {variant.color_name || 'Unnamed'}
                    </span>
                  </div>
                ))}
              </div>
              {product.color_name && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '12px' }}>Selected: <strong>{product.color_name}</strong></p>}
            </div>
          )}

          <div className="product-description">
            <h3>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
          </div>
          
          {!isAdmin && (
            <div className="product-actions" style={{ display: 'flex', gap: '15px', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className={`details-like-btn ${isLiked ? 'liked' : ''}`}
                onClick={toggleWishlist}
                aria-label="Toggle Wishlist"
              >
                <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              </button>

              <button 
                className="btn-primary add-to-cart-btn" 
                disabled={product.stock <= 0} 
                style={{ margin: 0, flex: 2 }}
                onClick={addToCart}
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>

              <button 
                className="btn-secondary reviews-btn" 
                style={{ 
                  margin: 0, 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onClick={fetchReviews}
                disabled={reviewsLoading}
              >
                <MessageSquare size={20} /> {reviewsLoading ? 'Loading...' : 'Reviews'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Performance Analytics */}
      {location.state?.adminTab && (
        <div style={{
          marginTop: '2.5rem',
          padding: '2rem',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            color: 'var(--color-accent-primary)',
            fontFamily: 'var(--font-serif)',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShoppingBag size={20} /> Admin Performance Insights
          </h2>

          {analyticsLoading ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading analytics...</p>
          ) : analytics ? (
            <div>
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}>
                  <Heart size={24} style={{ color: '#e74c3c', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{analytics.wishlist_count}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Times Wishlisted</p>
                </div>

                <div style={{
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}>
                  <ShoppingBag size={24} style={{ color: '#3498db', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{analytics.total_ordered}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Units Ordered (across {analytics.total_orders} orders)</p>
                </div>

                <div style={{
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        size={16} 
                        style={{ 
                          fill: s <= Math.round(analytics.avg_rating || 0) ? '#f39c12' : 'none', 
                          color: s <= Math.round(analytics.avg_rating || 0) ? '#f39c12' : 'var(--color-text-secondary)' 
                        }} 
                      />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {analytics.avg_rating ? parseFloat(analytics.avg_rating).toFixed(1) : '0.0'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Average Customer Rating ({analytics.review_count} reviews)</p>
                </div>
              </div>

              {/* Reviews detail section */}
              <div>
                <h3 style={{
                  fontSize: '1.05rem',
                  color: 'var(--color-text-primary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <MessageSquare size={18} style={{ color: 'var(--color-accent-primary)' }} /> Customer Feedback Reviews
                </h3>

                {analytics.reviews && analytics.reviews.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    maxHeight: '350px',
                    overflowY: 'auto',
                    paddingRight: '5px'
                  }}>
                    {analytics.reviews.map(r => (
                      <div key={r.id} style={{
                        padding: '1.25rem',
                        background: 'var(--color-bg-primary)',
                        borderRadius: 'var(--border-radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ color: 'var(--color-text-primary)' }}>{r.user}</strong>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star 
                                key={s} 
                                size={14} 
                                style={{ 
                                  fill: s <= r.rating ? '#f39c12' : 'none', 
                                  color: s <= r.rating ? '#f39c12' : 'var(--color-text-secondary)' 
                                }} 
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{r.comment}</p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {new Date(r.created_at).toLocaleDateString()} at {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No reviews have been written for this product yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)' }}>Failed to load product analytics.</p>
          )}
        </div>
      )}

      {/* Reviews Modal */}
      <ProductReviewsModal 
        isOpen={showReviews} 
        onClose={() => setShowReviews(false)} 
        reviews={reviews} 
        loading={reviewsLoading} 
      />
    </div>
  );
};

export default ProductDetails;

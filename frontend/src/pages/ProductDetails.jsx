import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProductDetails.css';
import { API_URL } from '../config';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showMessage } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const isAdmin = user?.is_staff || user?.token === 'admin_token_123';

  useEffect(() => {
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
      <button className="back-btn" onClick={() => navigate(-1)}>
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
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.color_variants.map(variant => (
                  <div 
                    key={variant.id}
                    onClick={() => navigate(`/product/${variant.id}`)}
                    title={variant.color_name}
                    style={{ 
                      width: '35px', 
                      height: '35px', 
                      borderRadius: '50%', 
                      background: variant.color_hex || '#ccc', 
                      cursor: 'pointer',
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
                ))}
              </div>
              {product.color_name && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>Selected: <strong>{product.color_name}</strong></p>}
            </div>
          )}

          <div className="product-description">
            <h3>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
          </div>
          
          {!isAdmin && (
            <div className="product-actions" style={{ display: 'flex', gap: '15px', marginTop: '1rem', alignItems: 'center' }}>
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
                style={{ margin: 0, flex: 1 }}
                onClick={addToCart}
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

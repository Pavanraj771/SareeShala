import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ArrowRight, Menu, X, Heart, Moon, Sun, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import ProductReviewsModal from '../components/ProductReviewsModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Home.css';
import { API_URL } from '../config';

let cachedProducts = null;

const Home = ({ searchQuery }) => {
  const [products, setProducts] = useState(cachedProducts || []);
  const [wishlist, setWishlist] = useState(new Set());
  
  const [showReviews, setShowReviews] = useState(false);
  const [selectedProductReviews, setSelectedProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, showMessage } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/`);
        const data = await res.json();
        cachedProducts = data;
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user && user.token) {
      fetch(`${API_URL}/api/users/wishlist/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWishlist(new Set(data.map(item => item.id)));
        }
      })
      .catch(err => console.error(err));
    } else {
      setWishlist(new Set());
    }
  }, [user]);

  const fetchProductReviews = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    setReviewsLoading(true);
    setShowReviews(true);
    try {
      const res = await fetch(`${API_URL}/api/users/reviews/product/${productId}/`);
      const data = await res.json();
      setSelectedProductReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
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
        body: JSON.stringify({ product_id: productId })
      });
      const data = await res.json();
      
      setWishlist(prev => {
        const next = new Set(prev);
        if (data.liked) next.add(productId);
        else next.delete(productId);
        return next;
      });
      
      if (showMessage) showMessage(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Check if query is a number (price filter)
    const priceQuery = parseFloat(query);
    if (!isNaN(priceQuery)) {
      return product.price <= priceQuery;
    }

    // Otherwise search in name and description
    return (
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  });

  const bestSellers = [...filteredProducts].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0));

  return (
    <div className="home-container">
      {/* New Arrivals Section */}
      <section className="collections-section" id="new">
        <div className="section-header">
          <h2 className="section-title">New <span className="text-gradient">Arrivals</span></h2>
          <p className="section-subtitle">
            Our latest additions, carefully curated for you.
          </p>
        </div>

        <div className="collections-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredProducts.slice(0, 12).map(product => (
            <div 
              key={`new-${product.id}`} 
              className="collection-card" 
              onClick={() => navigate(`/product/${product.id}`)} 
              style={{ cursor: 'pointer', height: '400px' }}
            >
              <div className="new-badge">NEW</div>
              <img src={product.image1 || product.image1_url || 'https://via.placeholder.com/300x400'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <button 
                className={`like-btn ${wishlist.has(product.id) ? 'liked' : ''}`}
                onClick={(e) => toggleWishlist(e, product.id)}
                aria-label="Toggle Wishlist"
              >
                <Heart size={20} fill={wishlist.has(product.id) ? "currentColor" : "none"} />
              </button>

              <button 
                className="review-btn-card"
                onClick={(e) => fetchProductReviews(e, product.id)}
                aria-label="View Reviews"
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  right: '15px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 5,
                  transition: 'all 0.3s ease'
                }}
              >
                <MessageSquare size={18} />
              </button>

              <div className="collection-overlay" style={{ height: '50%', justifyContent: 'flex-end', padding: '1.5rem' }}>
                <h3 className="collection-name" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                <div style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}>₹{product.price}</div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length > 12 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button 
              className="btn-primary" 
              onClick={() => document.getElementById('all-collections')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '0.8rem 2.5rem' }}
            >
              Explore More <ArrowRight size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Best Sellers Section */}
      <section className="collections-section" id="bestsellers" style={{ background: 'var(--color-bg-primary)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="section-header">
          <h2 className="section-title">Best <span className="text-gradient">Sellers</span></h2>
          <p className="section-subtitle">
            Our most loved sarees, ranked by popularity.
          </p>
        </div>

        <div className="collections-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {bestSellers.map(product => (
            <div 
              key={`best-${product.id}`} 
              className="collection-card" 
              onClick={() => navigate(`/product/${product.id}`)} 
              style={{ cursor: 'pointer', height: '400px' }}
            >
              <img src={product.image1 || product.image1_url || 'https://via.placeholder.com/300x400'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <button 
                className={`like-btn ${wishlist.has(product.id) ? 'liked' : ''}`}
                onClick={(e) => toggleWishlist(e, product.id)}
                aria-label="Toggle Wishlist"
              >
                <Heart size={20} fill={wishlist.has(product.id) ? "currentColor" : "none"} />
              </button>

              <button 
                className="review-btn-card"
                onClick={(e) => fetchProductReviews(e, product.id)}
                aria-label="View Reviews"
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  right: '15px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 5,
                  transition: 'all 0.3s ease'
                }}
              >
                <MessageSquare size={18} />
              </button>

              <div className="collection-overlay" style={{ height: '50%', justifyContent: 'flex-end', padding: '1.5rem' }}>
                <h3 className="collection-name" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                <div style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}>₹{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Collections Section */}
      <section className="collections-section" id="all-collections" style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="section-header">
          <h2 className="section-title">All <span className="text-gradient">Collections</span></h2>
          <p className="section-subtitle">
            Browse our entire handcrafted range.
          </p>
        </div>

        <div className="collections-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredProducts.map(product => (
            <div 
              key={`all-${product.id}`} 
              className="collection-card" 
              onClick={() => navigate(`/product/${product.id}`)} 
              style={{ cursor: 'pointer', height: '400px' }}
            >
              <img src={product.image1 || product.image1_url || 'https://via.placeholder.com/300x400'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <button 
                className={`like-btn ${wishlist.has(product.id) ? 'liked' : ''}`}
                onClick={(e) => toggleWishlist(e, product.id)}
                aria-label="Toggle Wishlist"
              >
                <Heart size={20} fill={wishlist.has(product.id) ? "currentColor" : "none"} />
              </button>

              <button 
                className="review-btn-card"
                onClick={(e) => fetchProductReviews(e, product.id)}
                aria-label="View Reviews"
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  right: '15px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 5,
                  transition: 'all 0.3s ease'
                }}
              >
                <MessageSquare size={18} />
              </button>

              <div className="collection-overlay" style={{ height: '50%', justifyContent: 'flex-end', padding: '1.5rem' }}>
                <h3 className="collection-name" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                <div style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}>₹{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-image">
            <img src="/hero_saree.png" alt="Our Story" />
            <div className="about-image-overlay"></div>
          </div>
          <div className="about-content">
            <h2 className="section-title">Our <span className="text-gradient">Story</span></h2>
            <p className="about-desc">
              At SareeShala, we believe that every saree tells a story. Founded with a passion for preserving India's rich handloom heritage, we work directly with master weavers across the country to bring you authentic, premium quality sarees.
            </p>
            <p className="about-desc">
              Our journey began with a simple vision: to make traditional elegance accessible while ensuring fair compensation for the artisans who keep these ancient crafts alive. Each piece in our collection is carefully curated, representing weeks of meticulous craftsmanship.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <h3 className="stat-number">50+</h3>
                <p className="stat-label">Master Weavers</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-number">1000+</h3>
                <p className="stat-label">Happy Customers</p>
              </div>
              <div className="stat-item">
                <h3 className="stat-number">100%</h3>
                <p className="stat-label">Authentic</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProductReviewsModal 
        isOpen={showReviews} 
        onClose={() => setShowReviews(false)} 
        reviews={selectedProductReviews} 
        loading={reviewsLoading} 
      />
    </div>
  );
};

export default Home;

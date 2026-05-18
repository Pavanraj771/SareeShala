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

  const query = searchQuery ? searchQuery.toLowerCase().trim() : '';
  const isSearching = query.length > 0;

  // Find longest common substring length (simple dynamic programming)
  const getLCSLength = (s1, s2) => {
    let maxLen = 0;
    const dp = Array(s1.length + 1).fill(0).map(() => Array(s2.length + 1).fill(0));
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i-1] === s2[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
          maxLen = Math.max(maxLen, dp[i][j]);
        }
      }
    }
    return maxLen;
  };

  const getMatchScore = (product, q) => {
    // 1. Exact ID Match (highest priority)
    if (product.id.toString() === q) return 10000;
    
    let score = 0;
    const nameLower = product.name.toLowerCase();
    const descLower = product.description ? product.description.toLowerCase() : '';
    
    // 2. Exact substring match in name
    if (nameLower.includes(q)) score += 1000;
    
    // 3. Exact substring match in description
    if (descLower.includes(q)) score += 500;
    
    // 4. Longest Common Substring match between name and query
    const lcs = getLCSLength(nameLower, q);
    if (lcs >= 3 || (q.length < 3 && lcs === q.length)) {
      score += (lcs * 10);
    }
    
    return score;
  };

  let displayProducts = [];
  if (isSearching) {
    displayProducts = products.map(p => ({ p, score: getMatchScore(p, query) }))
                              .filter(item => item.score > 0)
                              .sort((a, b) => b.score - a.score)
                              .map(item => item.p);
  } else {
    displayProducts = products;
  }

  const bestSellers = [...products].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0));

  const ProductCard = ({ product }) => (
    <div 
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}>₹{product.price}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>ID: {product.id}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      {isSearching ? (
        <section className="collections-section" id="matched-products">
          <div className="section-header">
            <h2 className="section-title">Matched <span className="text-gradient">Products</span></h2>
            <p className="section-subtitle">
              Found {displayProducts.length} results for "{searchQuery}"
            </p>
          </div>
          
          {displayProducts.length > 0 ? (
            <div className="collections-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {displayProducts.map(product => (
                <ProductCard key={`search-${product.id}`} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
                <h3>No products found matching your search.</h3>
                <p>Try searching by exact Product ID or different keywords.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* New Arrivals Section */}
          <section className="collections-section" id="new">
            <div className="section-header">
              <h2 className="section-title">New <span className="text-gradient">Arrivals</span></h2>
              <p className="section-subtitle">
                Our latest additions, carefully curated for you.
              </p>
            </div>

            <div className="collections-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {displayProducts.slice(0, 12).map(product => (
                <div style={{ position: 'relative' }} key={`new-${product.id}`}>
                  <div className="new-badge" style={{ zIndex: 10 }}>NEW</div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {displayProducts.length > 12 && (
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
                <ProductCard key={`best-${product.id}`} product={product} />
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
              {displayProducts.map(product => (
                <ProductCard key={`all-${product.id}`} product={product} />
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
        </>
      )}
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

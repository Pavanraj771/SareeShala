import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ArrowRight, Menu, X, Heart, Moon, Sun, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import ProductReviewsModal from '../components/ProductReviewsModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Home.css';
import { API_URL } from '../config';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [unseenCartCount, setUnseenCartCount] = useState(0);
  const [unseenNotifCount, setUnseenNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [showReviews, setShowReviews] = useState(false);
  const [selectedProductReviews, setSelectedProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, showMessage } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProducts();
    
    if (user && user.token) {
      // Fetch Cart Count
      fetch(`${API_URL}/api/orders/cart/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const count = data.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
          const seenCount = parseInt(localStorage.getItem('seenCartCount') || '0', 10);
          setUnseenCartCount(Math.max(0, count - seenCount));
        }
      })
      .catch(console.error);

      // Fetch Notifications for Count
      fetch(`${API_URL}/api/users/notifications/`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unseen = data.filter(n => !n.is_seen).length;
          setUnseenNotifCount(unseen);
        }
      })
      .catch(console.error);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

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
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div 
          className="logo text-gradient" 
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}
          style={{ cursor: 'pointer' }}
        >
          SAREESHALA
        </div>
        
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#new" className="nav-item" onClick={() => setMobileMenuOpen(false)}>New Arrivals</a>
          <a href="#bestsellers" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Best Sellers</a>
          <span className="nav-item" onClick={() => { setMobileMenuOpen(false); navigate('/notifications'); }} style={{cursor: 'pointer', position: 'relative'}}>
            Notifications
            {unseenNotifCount > 0 && (
              <span className="nav-badge" style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#e74c3c', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>
                {unseenNotifCount}
              </span>
            )}
          </span>
          <a href="#about" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Our Story</a>
        </div>
        
        <div className="nav-actions">
          {isSearchOpen && (
            <div className="search-bar-container animate-fade-in">
              <input 
                type="text" 
                placeholder="Search sarees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
            </div>
          )}
          <button 
            id="search-btn" 
            className={`action-btn ${isSearchOpen ? 'active' : ''}`} 
            aria-label="Search"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery('');
            }}
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          
          {/* Theme Toggle */}
          <button 
            className="action-btn theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button id="cart-nav-btn" className="action-btn" style={{ position: 'relative' }} aria-label="Cart" onClick={() => navigate('/cart')}>
            <ShoppingBag size={20} />
            {unseenCartCount > 0 && (
              <span className="nav-badge" style={{ position: 'absolute', top: '0', right: '0', background: '#e74c3c', color: 'white', fontSize: '0.65rem', padding: '2px 5px', borderRadius: '10px', transform: 'translate(25%, -25%)' }}>
                {unseenCartCount}
              </span>
            )}
          </button>
          <ProfileDropdown />
          <button className="action-btn mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>


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

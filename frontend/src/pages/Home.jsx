import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ArrowRight, Menu, X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  
  const navigate = useNavigate();
  const { user, showMessage } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/products/');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && user.token) {
      fetch('http://localhost:8000/api/users/wishlist/', {
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

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (showMessage) showMessage('Please log in to add items to your wishlist.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:8000/api/users/wishlist/', {
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

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo text-gradient">SAREESHALA</div>
        
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#new" className="nav-item" onClick={() => setMobileMenuOpen(false)}>New Arrivals</a>
          <a href="#collections" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Collections</a>
          <a href="#bridal" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Bridal</a>
          <a href="#about" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Our Story</a>
        </div>
        
        <div className="nav-actions">
          <button id="search-btn" className="action-btn" aria-label="Search">
            <Search size={20} />
          </button>
          <button id="cart-nav-btn" className="action-btn" aria-label="Cart" onClick={() => navigate('/cart')}>
            <ShoppingBag size={20} />
          </button>
          <ProfileDropdown />
          <button className="action-btn mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img src="/hero_saree.png" alt="Elegant Saree" />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content animate-fade-in delay-200">
          <span className="hero-subtitle">The Artisan Collection</span>
          <h1 className="hero-title">Elegance Woven<br/>in <span className="text-gradient">Tradition</span></h1>
          <p className="hero-desc">
            Discover our hand-picked selection of premium silk sarees, 
            crafted by master weavers across India. Experience the true 
            essence of royal heritage.
          </p>
          <button className="btn-primary">
            Explore Collection <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Collections Section */}
      <section className="collections-section" id="collections">
        <div className="section-header">
          <h2 className="section-title">New <span className="text-gradient">Arrivals</span></h2>
          <p className="section-subtitle">
            Explore our latest additions to the collection, from Kanchipuram to Banaras.
          </p>
        </div>

        <div className="collections-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {products.map(product => (
            <div 
              key={product.id} 
              className="collection-card" 
              onClick={() => navigate(`/product/${product.id}`)} 
              style={{ cursor: 'pointer', height: '400px' }}
            >
              <img src={product.image1 || 'https://via.placeholder.com/300x400'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <button 
                className={`like-btn ${wishlist.has(product.id) ? 'liked' : ''}`}
                onClick={(e) => toggleWishlist(e, product.id)}
                aria-label="Toggle Wishlist"
              >
                <Heart size={20} fill={wishlist.has(product.id) ? "currentColor" : "none"} />
              </button>

              <div className="collection-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', height: '50%', justifyContent: 'flex-end', padding: '1.5rem' }}>
                <h3 className="collection-name" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                <div style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{product.price}</div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>No products found. Stay tuned for new arrivals!</p>
          )}
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
    </div>
  );
};

export default Home;

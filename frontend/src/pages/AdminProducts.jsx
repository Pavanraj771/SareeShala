import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { API_URL } from '../config';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image1: null, image1_url: '',
    image2: null, image2_url: '',
    image3: null, image3_url: '',
    image4: null, image4_url: '',
    image5: null, image5_url: '',
    color_name: '',
    color_hex: '#ffffff',
    parent_product: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [fieldName]: e.target.files[0] });
    }
  };

  const openAddModal = () => {
    setFormData({ 
      name: '', description: '', price: '', stock: '', 
      image1: null, image1_url: '',
      image2: null, image2_url: '',
      image3: null, image3_url: '',
      image4: null, image4_url: '',
      image5: null, image5_url: '',
      color_name: '',
      color_hex: '#ffffff',
      parent_product: ''
    });
    setEditId(null);
    setParentSearchTerm('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image1: null, image1_url: product.image1_url || '',
      image2: null, image2_url: product.image2_url || '',
      image3: null, image3_url: product.image3_url || '',
      image4: null, image4_url: product.image4_url || '',
      image5: null, image5_url: product.image5_url || '',
      color_name: product.color_name || '',
      color_hex: product.color_hex || '#ffffff',
      parent_product: product.parent_product || ''
    });
    setEditId(product.id);
    const parent = products.find(p => p.id === product.parent_product);
    setParentSearchTerm(parent ? parent.name : '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    if (formData.image1) data.append('image1', formData.image1);
    data.append('image1_url', formData.image1_url);
    if (formData.image2) data.append('image2', formData.image2);
    data.append('image2_url', formData.image2_url);
    if (formData.image3) data.append('image3', formData.image3);
    data.append('image3_url', formData.image3_url);
    if (formData.image4) data.append('image4', formData.image4);
    data.append('image4_url', formData.image4_url);
    if (formData.image5) data.append('image5', formData.image5);
    data.append('image5_url', formData.image5_url);
    data.append('color_name', formData.color_name);
    data.append('color_hex', formData.color_hex);
    if (formData.parent_product) data.append('parent_product', formData.parent_product);

    try {
      if (editId) {
        await axios.put(`${API_URL}/api/products/${editId}/`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await axios.post(`${API_URL}/api/products/`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}/`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  return (
    <div className="admin-content animate-fade-in" style={{ background: 'var(--color-bg-primary)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--color-accent-primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>Product Management</h2>
        <button onClick={openAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, padding: '8px 16px', fontSize: '0.9rem' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: 'var(--color-bg-secondary)', borderRadius: 'var(--border-radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--color-text-primary)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Image</th>
              <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Name</th>
              <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Price</th>
              <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Stock</th>
              <th style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => navigate(`/product/${p.id}`, { state: { adminTab: 'products' } })}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                title="Click to view saree details"
              >
                <td style={{ padding: '12px' }}>
                  <img src={p.image1 || p.image1_url || 'https://via.placeholder.com/50'} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ padding: '12px' }}>₹{p.price}</td>
                <td style={{ padding: '12px' }}>{p.stock}</td>
                <td style={{ padding: '12px' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => openEditModal(p)} 
                      style={{ 
                        background: 'rgba(52, 152, 219, 0.1)', 
                        color: '#3498db', 
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
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      style={{ 
                        background: 'rgba(231, 76, 60, 0.1)', 
                        color: '#e74c3c', 
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
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No products found. Add some!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--color-text-primary)' }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Price (₹)</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Stock</label>
                  <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Color Name (e.g. Ruby Red)</label>
                  <input name="color_name" value={formData.color_name} onChange={handleInputChange} placeholder="Ruby Red" style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Color Hex (for UI circles)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="color" name="color_hex" value={formData.color_hex} onChange={handleInputChange} style={{ width: '40px', height: '40px', padding: '0', background: 'none', border: 'none', cursor: 'pointer' }} />
                    <input name="color_hex" value={formData.color_hex} onChange={handleInputChange} placeholder="#FF0000" style={{ flex: 1, padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)' }} />
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Parent Product (Link as Variant)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Search by Name or ID..." 
                    value={parentSearchTerm} 
                    onChange={(e) => {
                      setParentSearchTerm(e.target.value);
                      setShowParentDropdown(true);
                      if (!e.target.value) setFormData({...formData, parent_product: ''});
                    }}
                    onFocus={() => setShowParentDropdown(true)}
                    style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)' }}
                  />
                  {showParentDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-md)', marginTop: '5px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      <div 
                        onClick={() => { setFormData({...formData, parent_product: ''}); setParentSearchTerm(''); setShowParentDropdown(false); }}
                        style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', color: 'var(--color-text-secondary)', fontSize: '0.85rem', transition: 'background 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-primary)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        None (This is a main product)
                      </div>
                      {products
                        .filter(p => !p.parent_product && p.id !== editId)
                        .filter(p => p.name.toLowerCase().includes(parentSearchTerm.toLowerCase()) || p.id.toString().includes(parentSearchTerm))
                        .map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              setFormData({...formData, parent_product: p.id});
                              setParentSearchTerm(p.name);
                              setShowParentDropdown(false);
                            }}
                            style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-primary)', transition: 'background 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-primary)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <span>{p.name}</span>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>ID: {p.id}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>Search and select a parent saree to make this a color variant.</p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}>Product Images (Choose File OR provide URL)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <div key={num} style={{ marginBottom: '15px', padding: '10px', background: 'var(--color-bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--color-accent-primary)' }}>Image {num}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, `image${num}`)} 
                          style={{ width: '100%', padding: '5px', background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)', fontSize: '0.75rem' }} 
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>OR</span>
                          <input 
                            type="text" 
                            name={`image${num}_url`} 
                            placeholder="Image URL" 
                            value={formData[`image${num}_url`]} 
                            onChange={handleInputChange} 
                            style={{ flex: 1, padding: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--color-text-primary)', fontSize: '0.8rem' }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {editId && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '10px' }}>* Uploading a new file or updating a URL will replace the current image in that slot.</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--color-text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', margin: 0 }}>{editId ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

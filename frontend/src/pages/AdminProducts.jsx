import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/products/');
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
    setFormData({ name: '', description: '', price: '', stock: '', image1: null, image2: null, image3: null, image4: null, image5: null });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image1: null,
      image2: null,
      image3: null,
      image4: null,
      image5: null
    });
    setEditId(product.id);
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
    if (formData.image2) data.append('image2', formData.image2);
    if (formData.image3) data.append('image3', formData.image3);
    if (formData.image4) data.append('image4', formData.image4);
    if (formData.image5) data.append('image5', formData.image5);

    try {
      if (editId) {
        await axios.put(`http://localhost:8000/api/products/${editId}/`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await axios.post('http://localhost:8000/api/products/', data, { headers: { 'Content-Type': 'multipart/form-data' }});
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
      await axios.delete(`http://localhost:8000/api/products/${id}/`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#d4af37', margin: 0 }}>Product Management</h2>
        <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: 'var(--color-accent-gradient)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px', color: '#aaa' }}>Image</th>
              <th style={{ padding: '12px', color: '#aaa' }}>Name</th>
              <th style={{ padding: '12px', color: '#aaa' }}>Price</th>
              <th style={{ padding: '12px', color: '#aaa' }}>Stock</th>
              <th style={{ padding: '12px', color: '#aaa' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                <td style={{ padding: '12px' }}>
                  <img src={p.image1 || 'https://via.placeholder.com/50'} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name}</td>
                <td style={{ padding: '12px' }}>₹{p.price}</td>
                <td style={{ padding: '12px' }}>{p.stock}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => openEditModal(p)} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', marginRight: '10px' }}><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No products found. Add some!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.85rem' }}>Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.85rem' }}>Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.85rem' }}>Price (₹)</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.85rem' }}>Stock</label>
                  <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.85rem' }}>Images (Up to 5)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image1')} style={{ width: '100%', padding: '5px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image2')} style={{ width: '100%', padding: '5px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image3')} style={{ width: '100%', padding: '5px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image4')} style={{ width: '100%', padding: '5px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image5')} style={{ width: '100%', padding: '5px', background: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                </div>
                {editId && <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>Uploading a new file replaces the existing image.</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#fff', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-accent-gradient)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{editId ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

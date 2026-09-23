import React, { useState, useEffect } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../../services/api';

const ProductManager = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        is_active: true
    });
    
    // Image state
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(productsRes.data?.items || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                stock: product.stock?.toString() || '',
                category_id: product.category_id?.toString() || '',
                is_active: product.is_active
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category_id: '',
                is_active: true
            });
        }
        setSelectedImage(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                category_id: formData.category_id ? parseInt(formData.category_id, 10) : null
            };

            let savedProduct;
            if (editingProduct) {
                const res = await updateProduct(editingProduct.id, payload);
                savedProduct = res.data;
                alert("Product updated!");
            } else {
                const res = await createProduct(payload);
                savedProduct = res.data;
                alert("Product created!");
            }

            if (selectedImage && savedProduct?.id) {
                await uploadProductImage(savedProduct.id, selectedImage);
                alert("Image uploaded!");
            }

            handleCloseModal();
            fetchData();
        } catch (error: any) {
            console.error("Failed to save product", error);
            alert("Error saving product: " + (error.response?.data?.message || "Check inputs"));
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete", error);
                alert("Failed to delete product.");
            }
        }
    };

    if (loading) return <p>Loading products...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Product Management</h2>
                <button onClick={() => handleOpenModal()} style={btnStyle}>+ Add Product</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Image</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Stock</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={tdStyle}>{p.id}</td>
                            <td style={tdStyle}>
                                {p.images && p.images.length > 0 ? (
                                    <img src={`http://localhost:8000${p.images[0].url}`} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                ) : (
                                    <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>No Img</div>
                                )}
                            </td>
                            <td style={tdStyle}>{p.name}</td>
                            <td style={tdStyle}>${p.price}</td>
                            <td style={tdStyle}>{p.stock}</td>
                            <td style={tdStyle}>{p.is_active ? 'Active' : 'Inactive'}</td>
                            <td style={tdStyle}>
                                <button onClick={() => handleOpenModal(p)} style={{ ...btnStyle, background: '#f39c12', marginRight: '0.5rem' }}>Edit</button>
                                <button onClick={() => handleDelete(p.id)} style={{ ...btnStyle, background: '#e74c3c' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={inputStyle} />
                            <input type="number" placeholder="Price" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} />
                            <input type="number" placeholder="Stock" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={inputStyle} />
                            
                            <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={inputStyle}>
                                <option value="">Select Category (Optional)</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <label>
                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                                Active
                            </label>

                            <div>
                                <label>Image: </label>
                                {editingProduct?.images && editingProduct.images.length > 0 && (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <img src={`http://localhost:8000${editingProduct.images[0].url}`} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </div>
                                )}
                                <input type="file" onChange={e => setSelectedImage(e.target.files ? e.target.files[0] : null)} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" style={btnStyle}>Save</button>
                                <button type="button" onClick={handleCloseModal} style={{ ...btnStyle, background: '#95a5a6' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple inline styles for admin panel
const btnStyle = { padding: '0.5rem 1rem', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const thStyle = { padding: '1rem', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '1rem' };
const inputStyle = { padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContentStyle: React.CSSProperties = { background: '#fff', padding: '2rem', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' };

export default ProductManager;

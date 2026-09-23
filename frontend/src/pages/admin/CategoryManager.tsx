import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';

const CategoryManager = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getCategories();
            const sortedCategories = (response.data || []).sort((a: any, b: any) => a.id - b.id);
            setCategories(sortedCategories);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            alert("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                alert("Category updated!");
            } else {
                await createCategory(formData);
                alert("Category created!");
            }
            handleCloseModal();
            fetchData();
        } catch (error: any) {
            console.error("Failed to save category", error);
            alert("Error saving category: " + (error.response?.data?.message || "Check inputs"));
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this category? This might affect products linked to it!")) {
            try {
                await deleteCategory(id);
                fetchData();
            } catch (error: any) {
                console.error("Failed to delete category", error);
                alert("Failed to delete category: " + (error.response?.data?.message || "Error"));
            }
        }
    };

    if (loading) return <p>Loading categories...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Category Management</h2>
                <button onClick={() => handleOpenModal()} style={btnStyle}>+ Add Category</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Slug</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={tdStyle}>{c.id}</td>
                            <td style={tdStyle}>{c.name}</td>
                            <td style={tdStyle}>{c.description || <span style={{ color: '#999' }}>None</span>}</td>
                            <td style={tdStyle}>{c.slug}</td>
                            <td style={tdStyle}>
                                <button onClick={() => handleOpenModal(c)} style={{ ...btnStyle, background: '#f39c12', marginRight: '0.5rem' }}>Edit</button>
                                <button onClick={() => handleDelete(c.id)} style={{ ...btnStyle, background: '#e74c3c' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {categories.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>No categories found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input 
                                type="text" 
                                placeholder="Name" 
                                required 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                style={inputStyle} 
                            />
                            <textarea 
                                placeholder="Description (Optional)" 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                style={{ ...inputStyle, minHeight: '80px' }} 
                            />

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
const modalContentStyle: React.CSSProperties = { background: '#fff', padding: '2rem', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' };

export default CategoryManager;

import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    slug: string;
    images: { id: number; url: string; is_primary: boolean }[];
    category: { id: number; name: string } | null;
}
const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();
    useEffect(() => {
        // This function runs when the component mounts
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                setProducts(response.data.items);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Failed to load products. Is your backend running?");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []); // The empty array means this runs only once on load
    if (loading) return <div>Loading products...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    return (
        <div>
            <h1>Our Products</h1>

            {/* A simple CSS grid to display products nicely */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                {products.map((product) => (
                    <Link key={product.id} to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            border: '1px solid #ccc',
                            padding: '1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Show primary image if available, else a placeholder */}
                            <div style={{ height: '150px', background: '#f5f5f5', marginBottom: '1rem' }}>
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images.find(img => img.is_primary)?.url || product.images[0].url}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <p style={{ textAlign: 'center', paddingTop: '60px' }}>No Image</p>
                                )}
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>

                            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2ecc71', margin: '0 0 1rem 0', flexGrow: 1 }}>
                                ${product.price.toFixed(2)}
                            </p>

                            <button 
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent navigating to details page when clicking Add to Cart
                                    addToCart(product);
                                    alert('Added to cart!');
                                }}
                                style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginTop: 'auto'
                            }}>
                                Add to Cart
                            </button>
                        </div>
                    </Link>
                ))}

                {products.length === 0 && <p>No products found.</p>}
            </div>
        </div >
    );
};
export default Products;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import type { Product } from './Products';

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (id) {
                    const response = await getProductById(id);
                    setProduct(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div>Loading product details...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!product) return <div>Product not found.</div>;

    const primaryImage = product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
                {/* Left Side: Image, Name, Price */}
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '1rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {primaryImage ? (
                            <img
                                src={`http://localhost:8000${primaryImage}`}
                                alt={product.name}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <p>No Image</p>
                        )}
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h1>
                        <p style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#2ecc71', margin: 0 }}>
                            ${product.price.toFixed(2)}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            addToCart(product);
                            alert('Added to cart!');
                        }}
                        style={{
                            padding: '1rem',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginTop: '1rem'
                        }}
                    >
                        Add to Cart
                    </button>
                </div>

                {/* Right Side: Description */}
                <div style={{ flex: '1 1 400px' }}>
                    <h2>Description</h2>
                    <div style={{ lineHeight: '1.6', color: '#444' }}>
                        {product.description ? (
                            <p>{product.description}</p>
                        ) : (
                            <p style={{ fontStyle: 'italic', color: '#888' }}>No description available for this product.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;

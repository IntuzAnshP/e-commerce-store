import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();

    if (!cartItems || cartItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything yet.</p>
                <Link to="/products" style={{ color: '#007bff', textDecoration: 'none' }}>
                    Continue Shopping
                </Link>
            </div>
        );
    }

    // Since our backend returns cart items, we'll map over them
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1>Shopping Cart</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                {cartItems.map((item) => (
                    <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                    }}>
                        <div>
                            {/* NOTE: If your backend returns the product details inside the item, use item.product.name. 
                                Adjust this based on your actual data structure! */}
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Product ID: {item.product_id}</h3>
                            <p style={{ margin: 0, color: '#555' }}>Quantity: {item.quantity}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => item.id && updateQuantity(item.id, item.quantity + 1)}
                                style={{ padding: '0.5rem', cursor: 'pointer' }}
                            >
                                +
                            </button>
                            <button
                                onClick={() => item.id && updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                style={{ padding: '0.5rem', cursor: 'pointer' }}
                            >
                                -
                            </button>
                            <button
                                onClick={() => item.id && removeFromCart(item.id)}
                                style={{ padding: '0.5rem', cursor: 'pointer', background: '#ff4d4d', color: 'white', border: 'none' }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button style={{
                    padding: '1rem 2rem',
                    background: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1.1rem',
                    cursor: 'pointer'
                }}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;

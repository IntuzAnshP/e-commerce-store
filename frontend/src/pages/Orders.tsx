import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../services/api';
import { Link } from 'react-router-dom';

interface OrderItem {
    id: number;
    quantity: int;
    unit_price: number;
    product: {
        id: number;
        name: string;
        price: number;
        images: { url: string; is_primary: boolean }[];
    };
}

interface Order {
    id: number;
    status: string;
    total_amount: number;
    shipping_address: {
        address_line_1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    created_at: string;
    items: OrderItem[];
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getUserOrders();
                setOrders(response.data || []);
            } catch (err: any) {
                console.error('Failed to fetch orders', err);
                setError('Failed to load your orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading your orders...</div>;
    
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;

    if (orders.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h2>No Orders Yet</h2>
                <p>You haven't placed any orders.</p>
                <Link to="/products" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
            <h1>My Orders</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                {orders.map(order => (
                    <div key={order.id} style={{ 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        {/* Order Header */}
                        <div style={{ 
                            background: '#f8f9fa', 
                            padding: '1rem', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #e0e0e0',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <p style={{ margin: '0 0 0.25rem 0', color: '#555', fontSize: '0.9rem' }}>ORDER PLACED</p>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 0.25rem 0', color: '#555', fontSize: '0.9rem' }}>TOTAL</p>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>${order.total_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 0.25rem 0', color: '#555', fontSize: '0.9rem' }}>SHIP TO</p>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{order.shipping_address.city}, {order.shipping_address.country}</p>
                            </div>
                            <div style={{ textAlign: 'right', flexGrow: 1 }}>
                                <p style={{ margin: '0 0 0.25rem 0', color: '#555', fontSize: '0.9rem' }}>ORDER # {order.id}</p>
                                <p style={{ 
                                    margin: 0, 
                                    fontWeight: 'bold', 
                                    color: order.status === 'delivered' ? '#2ecc71' : 
                                           order.status === 'cancelled' ? '#e74c3c' : '#f39c12'
                                }}>
                                    {order.status.toUpperCase()}
                                </p>
                            </div>
                        </div>
                        
                        {/* Order Items */}
                        <div style={{ padding: '1rem' }}>
                            {order.items.map(item => {
                                const primaryImage = item.product.images?.find(img => img.is_primary)?.url || item.product.images?.[0]?.url;
                                return (
                                    <div key={item.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                        <div style={{ width: '80px', height: '80px', flexShrink: 0, background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                                            {primaryImage ? (
                                                <img src={primaryImage} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.8rem' }}>No Img</div>
                                            )}
                                        </div>
                                        <div style={{ flexGrow: 1 }}>
                                            <Link to={`/products/${item.product.id}`} style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                {item.product.name}
                                            </Link>
                                            <p style={{ margin: '0.5rem 0 0 0', color: '#555' }}>Quantity: {item.quantity}</p>
                                            <p style={{ margin: '0.25rem 0 0 0', color: '#555' }}>Unit Price: ${item.unit_price.toFixed(2)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            ${(item.quantity * item.unit_price).toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';

const OrderManager = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrders();
            let items = response.data?.items || [];
            
            if (statusFilter) {
                items = items.filter((order: any) => order.status === statusFilter);
            }
            
            // Sort by order ID ascending
            items = items.sort((a: any, b: any) => a.id - b.id);
            setOrders(items);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            alert("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update order status.");
        }
    };

    if (loading && orders.length === 0) return <p>Loading orders...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Order Management</h2>
                <div>
                    <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Filter by Status:</label>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">All Orders</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={thStyle}>Order ID</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Customer</th>
                        <th style={thStyle}>Items</th>
                        <th style={thStyle}>Total Amount</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={tdStyle}>#{order.id}</td>
                            <td style={tdStyle}>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td style={tdStyle}>
                                {order.shipping_address?.full_name || 'N/A'}<br/>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {order.shipping_address?.city}, {order.shipping_address?.country}
                                </span>
                            </td>
                            <td style={tdStyle}>
                                {order.items?.length || 0} items
                            </td>
                            <td style={tdStyle}>${order.total_amount?.toFixed(2)}</td>
                            <td style={tdStyle}>
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    style={{
                                        ...inputStyle,
                                        background: getStatusColor(order.status),
                                        color: order.status === 'pending' ? 'black' : 'white',
                                        fontWeight: 'bold',
                                        border: 'none'
                                    }}
                                >
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status} style={{ background: 'white', color: 'black' }}>
                                            {status.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td style={tdStyle}>
                                <button onClick={() => setSelectedOrder(order)} style={btnStyle}>Details</button>
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal */}
            {selectedOrder && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Order #{selectedOrder.id} Details</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
                        
                        <h4>Shipping Address</h4>
                        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
                            <p style={{ margin: '0.2rem 0' }}><strong>Name:</strong> {selectedOrder.shipping_address?.full_name}</p>
                            <p style={{ margin: '0.2rem 0' }}><strong>Address:</strong> {selectedOrder.shipping_address?.address_line_1}</p>
                            <p style={{ margin: '0.2rem 0' }}><strong>City/State:</strong> {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                            <p style={{ margin: '0.2rem 0' }}><strong>Country/ZIP:</strong> {selectedOrder.shipping_address?.country}, {selectedOrder.shipping_address?.postal_code}</p>
                        </div>

                        <h4 style={{ marginTop: '1.5rem' }}>Items Purchased</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '0.5rem 0' }}>Product</th>
                                    <th style={{ padding: '0.5rem 0' }}>Qty</th>
                                    <th style={{ padding: '0.5rem 0' }}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.items?.map((item: any) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.5rem 0' }}>{item.product?.name || `Product ID: ${item.product_id}`}</td>
                                        <td style={{ padding: '0.5rem 0' }}>{item.quantity}</td>
                                        <td style={{ padding: '0.5rem 0' }}>${item.unit_price?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h3 style={{ textAlign: 'right', marginTop: '1rem', color: '#2ecc71' }}>Total: ${selectedOrder.total_amount?.toFixed(2)}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for status badge colors
const getStatusColor = (status: string) => {
    switch(status) {
        case 'pending': return '#f1c40f';
        case 'processing': return '#3498db';
        case 'shipped': return '#9b59b6';
        case 'delivered': return '#2ecc71';
        case 'cancelled': return '#e74c3c';
        default: return '#95a5a6';
    }
};

const thStyle = { padding: '1rem', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '1rem' };
const inputStyle = { padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' };
const btnStyle = { padding: '0.5rem 1rem', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContentStyle: React.CSSProperties = { background: '#fff', padding: '2rem', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto' };

export default OrderManager;

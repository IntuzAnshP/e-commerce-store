import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (!stats) return <div style={{ color: 'red' }}>Failed to load dashboard statistics.</div>;

    return (
        <div>
            <h2>Admin Dashboard</h2>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                {/* Revenue Card */}
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Total Revenue</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71', margin: '0.5rem 0' }}>
                        ${stats.total_revenue?.toFixed(2) || '0.00'}
                    </p>
                </div>

                {/* Total Orders Card */}
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Total Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', margin: '0.5rem 0' }}>
                        {stats.total_orders || 0}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Orders By Status */}
                <div style={{ flex: '1 1 300px', ...cardStyle, background: '#fff' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Orders By Status</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={listItemStyle}>
                            <span>Pending</span>
                            <span style={badgeStyle('#f1c40f', 'black')}>{stats.orders_by_status?.pending || 0}</span>
                        </li>
                        <li style={listItemStyle}>
                            <span>Processing</span>
                            <span style={badgeStyle('#3498db', 'white')}>{stats.orders_by_status?.processing || 0}</span>
                        </li>
                        <li style={listItemStyle}>
                            <span>Shipped</span>
                            <span style={badgeStyle('#9b59b6', 'white')}>{stats.orders_by_status?.shipped || 0}</span>
                        </li>
                        <li style={listItemStyle}>
                            <span>Delivered</span>
                            <span style={badgeStyle('#2ecc71', 'white')}>{stats.orders_by_status?.delivered || 0}</span>
                        </li>
                        <li style={listItemStyle}>
                            <span>Cancelled</span>
                            <span style={badgeStyle('#e74c3c', 'white')}>{stats.orders_by_status?.cancelled || 0}</span>
                        </li>
                    </ul>
                </div>

                {/* Low Stock Alerts */}
                <div style={{ flex: '1 1 400px', ...cardStyle, background: '#fff' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#e74c3c' }}>
                        Low Stock Alerts
                    </h3>
                    
                    {stats.low_stock_products?.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: '#666', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '0.5rem 0' }}>Product</th>
                                    <th style={{ padding: '0.5rem 0' }}>Stock</th>
                                    <th style={{ padding: '0.5rem 0' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.low_stock_products.map((p: any) => (
                                    <tr key={p.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '0.5rem 0' }}>{p.name}</td>
                                        <td style={{ padding: '0.5rem 0', fontWeight: 'bold', color: '#e74c3c' }}>{p.stock} left</td>
                                        <td style={{ padding: '0.5rem 0' }}>
                                            <Link to="/admin/products" style={{ color: '#3498db', textDecoration: 'none' }}>
                                                Restock
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '2rem 0', textAlign: 'center', color: '#2ecc71' }}>
                            <p>All products have sufficient stock!</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

const cardStyle = { 
    background: '#f8f9fa', 
    padding: '1.5rem', 
    borderRadius: '8px', 
    border: '1px solid #eee',
    minWidth: '200px'
};

const cardTitleStyle = { 
    margin: 0, 
    color: '#666', 
    fontSize: '1rem',
    textTransform: 'uppercase' as const 
};

const listItemStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0.75rem 0', 
    borderBottom: '1px solid #f5f5f5' 
};

const badgeStyle = (bg: string, color: string) => ({
    background: bg,
    color: color,
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 'bold'
});

export default AdminDashboard;

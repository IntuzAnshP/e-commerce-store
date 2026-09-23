import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '80vh', borderTop: '1px solid #ddd' }}>
            <div style={{
                width: '250px',
                background: '#f8f9fa',
                padding: '2rem',
                borderRight: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Admin Menu</h3>
                <Link to="/admin" style={linkStyle}>Dashboard</Link>
                <Link to="/admin/products" style={linkStyle}>Products</Link>
                <Link to="/admin/categories" style={linkStyle}>Categories</Link>
                <Link to="/admin/orders" style={linkStyle}>Orders</Link>
            </div>
            
            <div style={{ flex: 1, padding: '2rem' }}>
                <Outlet />
            </div>
        </div>
    );
};

const linkStyle = {
    color: '#333',
    textDecoration: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    display: 'block'
};

export default AdminLayout;

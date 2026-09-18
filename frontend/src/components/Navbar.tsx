import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav style={{
            padding: '1rem', background: '#ffffffff', color: '#000000ff', marginBottom: '2rem'
        }}>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
                <li><Link to='/home' style={{ color: '#000000ff', textDecoration: 'none' }}>Home</Link></li>
                <li><Link to='/products' style={{ color: '#000000ff', textDecoration: 'none' }}>Products</Link></li>
                <li><Link to='/' style={{ color: '#000000ff', textDecoration: 'none' }}>Login</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;    
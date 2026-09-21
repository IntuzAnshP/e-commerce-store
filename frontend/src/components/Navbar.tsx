import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
    // These hooks magically give us access to the global state!
    const { isAuthenticated, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Send them back to login page
    };

    // Calculate total unique items in the cart
    const totalItems = cartItems ? cartItems.length : 0;

    return (
        <nav style={{
            padding: '1rem', background: '#ffffffff', color: '#000000ff', marginBottom: '2rem',
            borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'
        }}>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
                <li><Link to='/home' style={{ color: '#000000ff', textDecoration: 'none' }}>Home</Link></li>
                <li><Link to='/products' style={{ color: '#000000ff', textDecoration: 'none' }}>Shop</Link></li>
            </ul>

            <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
                <li>
                    <Link to='/cart' style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                        Cart ({totalItems})
                    </Link>
                </li>

                {isAuthenticated ? (
                    <>
                        <li>
                            <Link to='/orders' style={{ color: '#000000ff', textDecoration: 'none' }}>
                                My Orders
                            </Link>
                        </li>
                        <li>
                            <Link to='/profile' style={{ color: '#000000ff', textDecoration: 'none' }}>
                                My Profile
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                style={{ background: 'none', border: 'none', color: '#000000ff', cursor: 'pointer', padding: 0 }}
                            >
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li><Link to='/' style={{ color: '#000000ff', textDecoration: 'none' }}>Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;

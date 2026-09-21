import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, getUserProfile } from '../services/api';
import { useCart } from '../context/CartContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    const [addressFullName, setAddressFullName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileAddress = async () => {
            try {
                const response = await getUserProfile();
                const user = response.data;
                if (user && user.address) {
                    setAddressFullName(user.address.full_name || '');
                    setAddressLine1(user.address.address_line_1 || '');
                    setCity(user.address.city || '');
                    setState(user.address.state || '');
                    setPostalCode(user.address.postal_code || '');
                    setCountry(user.address.country || '');
                }
            } catch (err) {
                console.error("Failed to load user profile for checkout", err);
                // Non-blocking error, user can still type their address manually
            }
        };

        fetchProfileAddress();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const shippingAddress = {
            full_name: addressFullName,
            address_line_1: addressLine1,
            city,
            state,
            postal_code: postalCode,
            country
        };

        try {
            await createOrder(shippingAddress);
            
            // Backend clears cart, but frontend needs to clear local context
            await clearCart(); 
            
            navigate('/orders');
        } catch (err: any) {
            console.error('Failed to create order', err);
            setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <h1>Checkout</h1>
            <p style={{ color: '#555', marginBottom: '2rem' }}>Please enter your shipping address to complete the order.</p>

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', background: '#fee', borderRadius: '4px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Recipient Full Name</label>
                    <input
                        type="text"
                        value={addressFullName}
                        onChange={(e) => setAddressFullName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Address Line 1</label>
                    <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>State/Province</label>
                        <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Postal Code</label>
                        <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Country</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        background: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '1rem'
                    }}
                >
                    {loading ? 'Processing...' : 'Place Order'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;

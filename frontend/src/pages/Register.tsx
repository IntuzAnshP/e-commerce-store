import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';


const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // We use this to redirect the user after they register
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await registerUser(email, password, fullName);
            alert("Registration successful! You can now log in.");
            navigate('/'); // Send them to the login page!

        } catch (err: any) {
            console.error("Registration failed:", err);
            
            let errMsg = "Failed to register";
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errMsg = err.response.data.detail[0]?.msg || errMsg;
                } else if (typeof err.response.data.detail === 'string') {
                    errMsg = err.response.data.detail;
                }
            } else if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
            <h1>Register</h1>

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#fee' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name (Optional)</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.75rem',
                        background: '#2ecc71', // A nice green for register
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/" style={{ color: '#007bff' }}>Login here</Link>
            </p>
        </div>
    );
};
export default Register;

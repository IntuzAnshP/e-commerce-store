import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await loginUser(email, password);

            const { access_token } = response.data;

            // Save the token via AuthContext
            login(access_token);

            // Redirect them to the home page
            navigate('/home');

        } catch (err: any) {
            console.error("Login failed:", err);
            
            let errMsg = "Invalid email or password";
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
            <h1>Login</h1>

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#fee' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: '#007bff' }}>Register here</Link>
            </p>
        </div>
    );
};

export default Login;
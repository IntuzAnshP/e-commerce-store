import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, changePassword } from '../services/api';

const Profile = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    
    // Structured Address Fields
    const [addressFullName, setAddressFullName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [stateField, setStateField] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [loading, setLoading] = useState(true);
    
    // Status messages
    const [infoMsg, setInfoMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [passMsg, setPassMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                const user = response.data;
                setEmail(user.email || '');
                setFullName(user.full_name || '');
                
                if (user.address) {
                    setAddressFullName(user.address.full_name || '');
                    setAddressLine1(user.address.address_line_1 || '');
                    setCity(user.address.city || '');
                    setStateField(user.address.state || '');
                    setPostalCode(user.address.postal_code || '');
                    setCountry(user.address.country || '');
                }
            } catch (err) {
                console.error("Failed to load profile", err);
                setInfoMsg({ type: 'error', text: 'Failed to load profile data.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setInfoMsg(null);
        try {
            const addressObj = {
                full_name: addressFullName,
                address_line_1: addressLine1,
                city: city,
                state: stateField,
                postal_code: postalCode,
                country: country
            };

            await updateUserProfile({
                full_name: fullName,
                address: addressObj
            });
            setInfoMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            console.error("Failed to update profile", err);
            
            let errMsg = 'Failed to update profile.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errMsg = err.response.data.detail[0]?.msg || errMsg;
                } else if (typeof err.response.data.detail === 'string') {
                    errMsg = err.response.data.detail;
                }
            } else if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            
            setInfoMsg({ type: 'error', text: errMsg });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg(null);
        try {
            await changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });
            setPassMsg({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            console.error("Failed to change password", err);
            
            let errMsg = 'Failed to change password.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errMsg = err.response.data.detail[0]?.msg || errMsg;
                } else if (typeof err.response.data.detail === 'string') {
                    errMsg = err.response.data.detail;
                }
            } else if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            
            setPassMsg({ type: 'error', text: errMsg });
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                
                {/* Personal Information Section */}
                <section style={{ 
                    background: '#fff', 
                    padding: '2rem', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #eaeaea'
                }}>
                    <h2 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Personal Information
                    </h2>
                    
                    {infoMsg && (
                        <div style={{ 
                            padding: '1rem', 
                            marginBottom: '1.5rem', 
                            borderRadius: '4px',
                            background: infoMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                            color: infoMsg.type === 'success' ? '#155724' : '#721c24'
                        }}>
                            {infoMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5', color: '#777' }}
                                title="Email address cannot be changed."
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Shipping Address</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Recipient Full Name</label>
                                    <input
                                        type="text"
                                        value={addressFullName}
                                        onChange={(e) => setAddressFullName(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        placeholder="John Doe"
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Address Line 1</label>
                                    <input
                                        type="text"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        placeholder="123 Main St"
                                    />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>State/Province</label>
                                        <input
                                            type="text"
                                            value={stateField}
                                            onChange={(e) => setStateField(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Postal Code</label>
                                        <input
                                            type="text"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Country</label>
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" style={{
                            padding: '0.75rem 1.5rem',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                            marginTop: '0.5rem'
                        }}>
                            Save Changes
                        </button>
                    </form>
                </section>


                {/* Change Password Section */}
                <section style={{ 
                    background: '#fff', 
                    padding: '2rem', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #eaeaea'
                }}>
                    <h2 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Change Password
                    </h2>
                    
                    {passMsg && (
                        <div style={{ 
                            padding: '1rem', 
                            marginBottom: '1.5rem', 
                            borderRadius: '4px',
                            background: passMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                            color: passMsg.type === 'success' ? '#155724' : '#721c24'
                        }}>
                            {passMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="Min 8 chars, 1 uppercase, 1 special char"
                            />
                        </div>

                        <button type="submit" style={{
                            padding: '0.75rem 1.5rem',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                            marginTop: '0.5rem'
                        }}>
                            Update Password
                        </button>
                    </form>
                </section>

            </div>
        </div>
    );
};

export default Profile;

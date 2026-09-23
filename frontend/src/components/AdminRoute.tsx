import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Since user fetch is async on initial load, we might need a loading state, 
    // but for simplicity, we'll assume if authenticated but no user yet, it's loading.
    if (!user) {
        return <div>Loading...</div>;
    }

    if (user.role !== 'admin') {
        // Redirect non-admins to home page
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;

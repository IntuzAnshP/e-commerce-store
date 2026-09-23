import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';

interface User {
    id: number;
    email: string;
    full_name?: string;
    role: string;
}

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    user: User | null;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    const response = await getUserProfile();
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user profile, logging out", error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
        };
        fetchUser();
    }, []);

    const login = async (accessToken: string, refreshToken: string) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setToken(accessToken);
        try {
            const response = await getUserProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user profile on login", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated: !!token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

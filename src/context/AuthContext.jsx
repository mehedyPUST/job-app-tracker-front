// src/context/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const response = await api.getMe();

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await api.login({ email, password });

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);

                if (response.user.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/jobs');
                }

                return { success: true, user: response.user };
            } else {
                setError(response.message || 'Login failed');
                return { success: false, error: response.message };
            }
        } catch (error) {
            setError(error.message || 'Login failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await api.register(userData);

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                router.push('/jobs');
                return { success: true, user: response.user };
            } else {
                setError(response.message || 'Registration failed');
                return { success: false, error: response.message };
            }
        } catch (error) {
            setError(error.message || 'Registration failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
            setUser(null);
            setIsAuthenticated(false);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            setIsAuthenticated(false);
            router.push('/login');
        }
    };

    const demoLogin = async (role) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await api.demoLogin(role);

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);

                if (role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/jobs');
                }

                return { success: true, user: response.user };
            } else {
                setError(response.message || 'Demo login failed');
                return { success: false, error: response.message };
            }
        } catch (error) {
            setError(error.message || 'Demo login failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        demoLogin,
        checkAuth,
        setUser,
        setIsAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
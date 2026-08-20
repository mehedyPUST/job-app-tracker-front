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

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check if user is authenticated
     */
    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const response = await api.getMe();

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                setError(null);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                // If token is invalid, clear it
                if (response.message?.includes('token')) {
                    await logout();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login user
     */
    const login = async (email, password) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await api.login({ email, password });

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                setError(null);

                // Redirect based on role
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
            const errorMessage = error.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register user
     */
    const register = async (userData) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await api.register(userData);

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                setError(null);
                router.push('/jobs');
                return { success: true, user: response.user };
            } else {
                setError(response.message || 'Registration failed');
                return { success: false, error: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout user - Clear all auth state and cookies
     */
    const logout = async () => {
        try {
            setIsLoading(true);

            // Call logout API to clear cookie
            await api.logout();

            // Clear all local state
            setUser(null);
            setIsAuthenticated(false);
            setError(null);

            // Clear any stored tokens from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('token');
                sessionStorage.clear();
            }

            // Clear all cookies manually
            if (typeof document !== 'undefined') {
                document.cookie.split(';').forEach(cookie => {
                    const [name] = cookie.trim().split('=');
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                });
            }

            // Redirect to login page
            router.push('/login');
            router.refresh(); // Force refresh to clear server-side state

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);

            // Even if API fails, clear local state
            setUser(null);
            setIsAuthenticated(false);
            setError(null);

            // Clear cookies manually
            if (typeof document !== 'undefined') {
                document.cookie.split(';').forEach(cookie => {
                    const [name] = cookie.trim().split('=');
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                });
            }

            router.push('/login');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Demo login for testing
     */
    const demoLogin = async (role) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await api.demoLogin(role);

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                setError(null);

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
            const errorMessage = error.message || 'Demo login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Update user data in context
     */
    const updateUser = (updatedUser) => {
        setUser(prev => ({
            ...prev,
            ...updatedUser
        }));
    };

    /**
     * Clear error
     */
    const clearError = () => {
        setError(null);
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
        updateUser,
        clearError,
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
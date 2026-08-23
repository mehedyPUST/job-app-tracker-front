// src/app/(auth)/login/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight,
    Leaf,
    Briefcase,
    FileCheck,
    Award
} from 'lucide-react';

export default function LoginPage() {
    const { login, demoLogin, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSuccess(false);
        setErrors({});
        const result = await login(formData.email, formData.password);
        if (result.success) {
            setSuccess(true);
        } else {
            setErrors({ submit: result.error });
        }
    };

    const handleDemoLogin = async (role) => {
        setErrors({});
        await demoLogin(role);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-app-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-app-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 group">
                        <Leaf className="w-8 h-8 text-app-accent-readable group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-2xl font-bold text-app-text">JobTracker</span>
                    </Link>
                    <h2 className="mt-4 text-2xl font-bold text-app-text">Welcome back</h2>
                    <p className="mt-2 text-sm text-app-muted">
                        Sign in to track your job applications
                    </p>
                </div>

                <div className="bg-app-card rounded-2xl border border-app-border p-6 md:p-8 shadow-2xl shadow-app-accent/20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-app-muted mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-2.5 bg-app-bg border ${errors.email ? 'border-red-500' : 'border-app-border'
                                        } rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors`}
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-app-muted mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-2.5 bg-app-bg border ${errors.password ? 'border-red-500' : 'border-app-border'
                                        } rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted-2 hover:text-app-muted transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {errors.submit && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-sm text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className={`w-full py-3 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-app-accent/20 hover:shadow-app-accent/20 flex items-center justify-center gap-2 ${(isLoading || success) ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-app-accent-text border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-app-muted">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-app-accent-readable hover:text-app-accent-readable/80 font-medium transition-colors hover:underline"
                            >
                                Create one now
                            </Link>
                        </p>
                    </form>

                    <div className="mt-6 pt-6 border-t border-app-border">
                        <p className="text-center text-xs text-app-muted-2 mb-3">Demo Accounts</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleDemoLogin('jobSeeker')}
                                disabled={isLoading || success}
                                className="px-3 py-2 text-xs bg-app-accent-muted hover:bg-app-accent-muted text-app-accent-readable rounded-lg transition-colors border border-app-border"
                            >
                                Job Seeker Demo
                            </button>
                            <button
                                onClick={() => handleDemoLogin('admin')}
                                disabled={isLoading || success}
                                className="px-3 py-2 text-xs bg-app-accent-muted hover:bg-app-accent-muted text-app-accent-readable rounded-lg transition-colors border border-app-border"
                            >
                                Admin Demo
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-app-border grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <Briefcase className="w-5 h-5 text-app-accent-readable mx-auto mb-1" />
                            <p className="text-xs text-app-muted">Track Jobs</p>
                        </div>
                        <div className="text-center">
                            <FileCheck className="w-5 h-5 text-app-accent-readable mx-auto mb-1" />
                            <p className="text-xs text-app-muted">Monitor Status</p>
                        </div>
                        <div className="text-center">
                            <Award className="w-5 h-5 text-app-accent-readable mx-auto mb-1" />
                            <p className="text-xs text-app-muted">Get Hired</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
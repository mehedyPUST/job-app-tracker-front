// src/app/(auth)/register/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight,
    Leaf,
    Briefcase,
    FileCheck,
    Award
} from 'lucide-react';

export default function RegisterPage() {
    const { register, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase and number';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
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
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'jobSeeker'
        });
        if (result.success) {
            setSuccess(true);
        } else {
            setErrors({ submit: result.error });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#001E2B] py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#00ED64] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00ED64] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 group">
                        <Leaf className="w-8 h-8 text-[#00ED64] group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-2xl font-bold text-white">JobTracker</span>
                    </Link>
                    <h2 className="mt-4 text-2xl font-bold text-white">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Start tracking your job applications today
                    </p>
                </div>

                <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6 md:p-8 shadow-2xl shadow-[#00ED64]/5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-2.5 bg-[#001E2B] border ${errors.name ? 'border-red-500' : 'border-[#00684A]/30'
                                        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-2.5 bg-[#001E2B] border ${errors.email ? 'border-red-500' : 'border-[#00684A]/30'
                                        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-2.5 bg-[#001E2B] border ${errors.password ? 'border-red-500' : 'border-[#00684A]/30'
                                        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
                            <p className="mt-1.5 text-xs text-gray-500">
                                Must be 8+ chars with uppercase, lowercase & number
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-2.5 bg-[#001E2B] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#00684A]/30'
                                        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.confirmPassword}
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
                            className={`w-full py-3 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center justify-center gap-2 ${(isLoading || success) ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-[#00ED64] hover:text-[#00ED64]/80 font-medium transition-colors hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#00684A]/20 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <Briefcase className="w-5 h-5 text-[#00ED64] mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Track Jobs</p>
                        </div>
                        <div className="text-center">
                            <FileCheck className="w-5 h-5 text-[#00ED64] mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Monitor Status</p>
                        </div>
                        <div className="text-center">
                            <Award className="w-5 h-5 text-[#00ED64] mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Get Hired</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
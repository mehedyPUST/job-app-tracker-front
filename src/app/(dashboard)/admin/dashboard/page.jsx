// src/app/(dashboard)/admin/dashboard/page.jsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, TrendingUp, UserCheck, FileCheck } from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#00ED64] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Welcome back, {user?.name}! Here's your platform overview
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <Users className="w-5 h-5 text-[#00ED64]" />
                            <span className="text-xs text-gray-500">Users</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Total registered</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                            <span className="text-xs text-gray-500">Applications</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Total tracked</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <UserCheck className="w-5 h-5 text-green-400" />
                            <span className="text-xs text-gray-500">Active Users</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Last 30 days</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-gray-500">Growth</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0%</p>
                        <p className="text-xs text-gray-400">This month</p>
                    </div>
                </div>

                <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                    <h3 className="text-white font-semibold mb-4">Recent Users</h3>
                    <p className="text-gray-400 text-sm">No users registered yet.</p>
                </div>
            </div>
        </div>
    );
}
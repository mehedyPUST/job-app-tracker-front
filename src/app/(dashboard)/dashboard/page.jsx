// src/app/(dashboard)/dashboard/page.jsx
'use client';

import { Suspense, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    FileCheck,
    Eye,
    ClipboardList,
    UserCheck,
    Award,
    XCircle,
    TrendingUp,
    PlusCircle
} from 'lucide-react';

// Inner component that uses hooks (useAuth, useRouter) – safe
function DashboardContent() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#00ED64] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Here's what's happening with your job applications
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <Briefcase className="w-5 h-5 text-[#00ED64]" />
                            <span className="text-xs text-gray-500">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Applications</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <FileCheck className="w-5 h-5 text-blue-400" />
                            <span className="text-xs text-gray-500">Applied</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Active</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <Eye className="w-5 h-5 text-cyan-400" />
                            <span className="text-xs text-gray-500">Viewed</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Resume viewed</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <ClipboardList className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-gray-500">Test</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Online/Offline</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <UserCheck className="w-5 h-5 text-purple-400" />
                            <span className="text-xs text-gray-500">Interview</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Scheduled</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <Award className="w-5 h-5 text-green-400" />
                            <span className="text-xs text-gray-500">Offered</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Job offers</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-xs text-gray-500">Rejected</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">0</p>
                        <p className="text-xs text-gray-400">Not selected</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#00ED64]" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => router.push('/jobs?action=add')}
                                className="px-4 py-3 bg-[#00ED64]/10 hover:bg-[#00ED64]/20 text-[#00ED64] rounded-lg transition-all border border-[#00ED64]/20 flex items-center justify-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Application
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#00ED64]" />
                            Quick Stats
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Start adding your job applications to see statistics here!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export with Suspense boundary to avoid useSearchParams error
export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#00ED64] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">Loading dashboard...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
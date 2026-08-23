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
            <div className="min-h-screen bg-app-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-app-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-app-muted mt-4">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-app-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-app-text">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-app-muted mt-1">
                        Here's what's happening with your job applications
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                    <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
                        <div className="flex items-center justify-between">
                            <Briefcase className="w-5 h-5 text-app-accent-readable" />
                            <span className="text-xs text-app-muted-2">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-app-text mt-2">0</p>
                        <p className="text-xs text-app-muted">Applications</p>
                    </div>

                    <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
                        <div className="flex items-center justify-between">
                            <FileCheck className="w-5 h-5 text-blue-400" />
                            <span className="text-xs text-app-muted-2">Applied</span>
                        </div>
                        <p className="text-2xl font-bold text-app-text mt-2">0</p>
                        <p className="text-xs text-app-muted">Active</p>
                    </div>

                    <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
                        <div className="flex items-center justify-between">
                            <Eye className="w-5 h-5 text-cyan-400" />
                            <span className="text-xs text-app-muted-2">Viewed</span>
                        </div>
                        <p className="text-2xl font-bold text-app-text mt-2">0</p>
                        <p className="text-xs text-app-muted">Resume viewed</p>
                    </div>

                    <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
                        <div className="flex items-center justify-between">
                            <ClipboardList className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-app-muted-2">Test</span>
                        </div>
                        <p className="text-2xl font-bold text-app-text mt-2">0</p>
                        <p className="text-xs text-app-muted">Online/Offline</p>
                    </div>

                    <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
                        <div className="flex items-center justify-between">
                            <UserCheck className="w-5 h-5 text-purple-400" />
                            <span className="text-xs text-app-muted-2">Interview</span>
                        </div>
                        <p className="text-2xl font-bold text-app-text mt-2">0</p>
                        <p className="text-xs text-app-muted">Scheduled</p>
                    </div>

                    <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
                        <div className="flex items-center justify-between">
                            <Award className="w-5 h-5 text-green-400" />
                            <span className="text-xs text-app-muted-2">Offered</span>
                        </div>
                        <p className="text-2xl font-bold text-app-text mt-2">0</p>
                        <p className="text-xs text-app-muted">Job offers</p>
                    </div>

                    <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
                        <div className="flex items-center justify-between">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-xs text-app-muted-2">Rejected</span>
                        </div>
                        <p className="text-2xl font-bold text-app-text mt-2">0</p>
                        <p className="text-xs text-app-muted">Not selected</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-app-card rounded-xl border border-app-border p-6">
                        <h3 className="text-app-text font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-app-accent-readable" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => router.push('/jobs?action=add')}
                                className="px-4 py-3 bg-app-accent-muted hover:bg-app-accent/20 text-app-accent-readable rounded-lg transition-all border border-app-accent-border flex items-center justify-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Application
                            </button>
                        </div>
                    </div>

                    <div className="bg-app-card rounded-xl border border-app-border p-6">
                        <h3 className="text-app-text font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-app-accent-readable" />
                            Quick Stats
                        </h3>
                        <p className="text-app-muted text-sm">
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
            <div className="min-h-screen bg-app-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-app-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-app-muted mt-4">Loading dashboard...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
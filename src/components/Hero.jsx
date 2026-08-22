// components/Hero.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    Briefcase,
    Send,
    Eye,
    Star,
    ClipboardList,
    UserCheck,
    Award,
    XCircle,
    ArrowRight,
    TrendingUp,
    Clock,
    BarChart3,
    PlusCircle,
    Clock8,
    Loader2,
    LayoutDashboard
} from 'lucide-react';

// Matches backend validStatuses exactly
const STATUS_META = {
    applied: { label: 'Applied', icon: Send, color: 'text-blue-400', border: 'border-blue-400/20' },
    resume_viewed: { label: 'Resume Viewed', icon: Eye, color: 'text-cyan-400', border: 'border-cyan-400/20' },
    shortlisted: { label: 'Shortlisted', icon: Star, color: 'text-yellow-400', border: 'border-yellow-400/20' },
    online_test: { label: 'Online Test', icon: ClipboardList, color: 'text-purple-400', border: 'border-purple-400/20' },
    interview: { label: 'Interview', icon: UserCheck, color: 'text-indigo-400', border: 'border-indigo-400/20' },
    got_hired: { label: 'Got Hired', icon: Award, color: 'text-green-400', border: 'border-green-400/20' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', border: 'border-red-400/20' },
    no_response: { label: 'No Response', icon: Clock8, color: 'text-gray-400', border: 'border-gray-400/20' },
    no_action: { label: 'No Action Yet', icon: Briefcase, color: 'text-gray-400', border: 'border-gray-400/20' },
};

const STATUS_FLOW = [
    'applied',
    'resume_viewed',
    'shortlisted',
    'online_test',
    'interview',
    'got_hired',
];

// Fallback demo numbers when user is not logged in
const DEMO_COUNTS = {
    applied: 24,
    resume_viewed: 18,
    shortlisted: 9,
    online_test: 6,
    interview: 5,
    got_hired: 2,
    rejected: 7,
    no_response: 4,
};

export default function Hero() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    // Fetch real stats when session is authenticated
    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || user?.role === 'admin') {
            setStats(null);
            setStatsError(null);
            return;
        }

        let cancelled = false;

        const loadStats = async () => {
            setStatsLoading(true);
            setStatsError(null);
            try {
                const res = await api.getJobStats();
                if (cancelled) return;

                if (res?.success && res.stats) {
                    setStats(res.stats);
                } else {
                    setStats({ total: 0, statuses: {} });
                    setStatsError(res?.message || 'Could not load stats');
                }
            } catch (err) {
                if (!cancelled) {
                    setStats({ total: 0, statuses: {} });
                    setStatsError(err.message || 'Network error');
                }
            } finally {
                if (!cancelled) setStatsLoading(false);
            }
        };

        loadStats();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, authLoading, user?.role]);

    const isLoggedIn = !authLoading && isAuthenticated;
    const isJobSeeker = isLoggedIn && user?.role !== 'admin';
    const isAdmin = isLoggedIn && user?.role === 'admin';

    // Build display cards: live data for job seekers, demo for guests
    const displayCards = (() => {
        const keys = [
            'applied',
            'resume_viewed',
            'shortlisted',
            'online_test',
            'interview',
            'got_hired',
            'rejected',
            'no_response',
        ];

        return keys.map((key) => {
            const meta = STATUS_META[key];
            let count = DEMO_COUNTS[key] ?? 0;

            if (isJobSeeker && stats) {
                count = stats.statuses?.[key] ?? 0;
            }

            return { key, ...meta, count };
        });
    })();

    const totalApplications =
        isJobSeeker && stats
            ? stats.total ?? 0
            : Object.values(DEMO_COUNTS).reduce((a, b) => a + b, 0);

    const interviewCount =
        isJobSeeker && stats
            ? (stats.statuses?.interview ?? 0)
            : DEMO_COUNTS.interview;

    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
        <section className="relative bg-[#001E2B] overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#00ED64] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00ED64] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 bg-[#00ED64]/10 border border-[#00ED64]/20 rounded-full px-4 py-2">
                            <TrendingUp className="w-4 h-4 text-[#00ED64]" />
                            <span className="text-[#00ED64] text-sm font-medium">
                                {isJobSeeker
                                    ? 'Your Application Tracker'
                                    : isAdmin
                                        ? 'Admin Console'
                                        : 'Track Your Job Applications'}
                            </span>
                        </div>

                        {/* Heading — session-aware */}
                        {isJobSeeker ? (
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Welcome back,{' '}
                                <span className="text-[#00ED64]">{firstName}</span>
                                <br />
                                <span className="text-gray-300 text-3xl md:text-4xl lg:text-5xl">
                                    {totalApplications > 0
                                        ? `You have ${totalApplications} application${totalApplications === 1 ? '' : 's'} tracked`
                                        : 'Start tracking your applications'}
                                </span>
                            </h1>
                        ) : isAdmin ? (
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Welcome,{' '}
                                <span className="text-[#00ED64]">{firstName}</span>
                                <br />
                                <span className="text-gray-300 text-3xl md:text-4xl lg:text-5xl">
                                    Manage the JobTracker platform
                                </span>
                            </h1>
                        ) : (
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Track Every{' '}
                                <span className="text-[#00ED64] relative">
                                    Job Application
                                    <svg className="absolute -bottom-2 left-0 w-full h-2" viewBox="0 0 100 8">
                                        <path d="M0 4 Q25 0 50 4 Q75 8 100 4" stroke="#00ED64" strokeWidth="2" fill="none" />
                                    </svg>
                                </span>
                                <br />
                                <span className="text-gray-300">In One Place</span>
                            </h1>
                        )}

                        {/* Description */}
                        <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                            {isJobSeeker
                                ? 'Pick up where you left off. Review status, add new roles, and keep your search organized.'
                                : isAdmin
                                    ? 'Review users, monitor activity, and keep the platform running smoothly.'
                                    : 'Never lose track of your job applications again. Organize, monitor, and analyze your entire job search journey — from Applied to Got Hired.'}
                        </p>

                        {/* Status flow (marketing + logged-in) */}
                        {!isAdmin && (
                            <div className="flex flex-wrap items-center gap-2 py-2">
                                {STATUS_FLOW.map((key, index) => {
                                    const meta = STATUS_META[key];
                                    const Icon = meta.icon;
                                    return (
                                        <div key={key} className="flex items-center gap-2">
                                            <span
                                                className={`px-2.5 py-1.5 bg-[#00684A]/20 ${meta.color} rounded-full border ${meta.border} flex items-center gap-1.5 text-xs font-medium`}
                                            >
                                                <Icon className="w-3 h-3" />
                                                {meta.label}
                                            </span>
                                            {index < STATUS_FLOW.length - 1 && (
                                                <ArrowRight className="w-3 h-3 text-gray-500 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* CTA Buttons — session-aware */}
                        <div className="flex flex-wrap gap-4">
                            {authLoading ? (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Checking session…
                                </div>
                            ) : isJobSeeker ? (
                                <>
                                    <Link
                                        href="/jobs"
                                        className="px-8 py-3.5 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center gap-2"
                                    >
                                        <Briefcase className="w-5 h-5" />
                                        Go to My Jobs
                                    </Link>
                                    <Link
                                        href="/jobs?action=add"
                                        className="px-8 py-3.5 border border-[#00ED64]/30 hover:border-[#00ED64] text-[#00ED64] hover:bg-[#00ED64]/10 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Add Application
                                    </Link>
                                </>
                            ) : isAdmin ? (
                                <Link
                                    href="/admin/dashboard"
                                    className="px-8 py-3.5 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Open Admin Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="px-8 py-3.5 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center gap-2"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Start Tracking Now
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="px-8 py-3.5 border border-[#00ED64]/30 hover:border-[#00ED64] text-[#00ED64] hover:bg-[#00ED64]/10 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                                    >
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Bottom stats strip */}
                        <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-[#00684A]/20">
                            {isJobSeeker ? (
                                <>
                                    <div>
                                        <p className="text-white font-bold text-xl">
                                            {statsLoading ? '—' : totalApplications}
                                        </p>
                                        <p className="text-gray-400 text-xs">Your Applications</p>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-xl">
                                            {statsLoading ? '—' : interviewCount}
                                        </p>
                                        <p className="text-gray-400 text-xs">In Interview</p>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-xl">
                                            {statsLoading
                                                ? '—'
                                                : (stats?.statuses?.got_hired ?? 0)}
                                        </p>
                                        <p className="text-gray-400 text-xs">Got Hired</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-white font-bold text-xl">9</p>
                                        <p className="text-gray-400 text-xs">Application Statuses</p>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-xl">Analytics</p>
                                        <p className="text-gray-400 text-xs">Built-in Insights</p>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-xl">Free</p>
                                        <p className="text-gray-400 text-xs">To Get Started</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Content — live or demo tracker card */}
                    <div className="relative flex justify-center items-center">
                        <div className="relative w-full max-w-lg">
                            <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6 shadow-2xl shadow-[#00ED64]/5">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#00ED64]" />
                                        {isJobSeeker ? 'Your Applications' : 'My Applications'}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        {isJobSeeker
                                            ? statsLoading
                                                ? 'Loading…'
                                                : `${totalApplications} total`
                                            : 'Preview'}
                                    </span>
                                </div>

                                {/* Status grid */}
                                {statsLoading && isJobSeeker ? (
                                    <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#00ED64]" />
                                        <span className="text-sm">Loading your stats…</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {displayCards.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <div
                                                    key={item.key}
                                                    className="bg-[#001E2B] p-3 rounded-lg border border-[#00684A]/20"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400 text-xs truncate pr-1">
                                                            {item.label}
                                                        </span>
                                                        <Icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                                                    </div>
                                                    <p className="text-white font-bold text-xl mt-1">
                                                        {item.count}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Error hint (non-blocking) */}
                                {statsError && isJobSeeker && (
                                    <p className="mt-3 text-xs text-yellow-500/80">
                                        Stats could not be refreshed. Showing zeros.
                                    </p>
                                )}

                                {/* Mini chart (visual only) */}
                                <div className="mt-4 pt-4 border-t border-[#00684A]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs">
                                            {isJobSeeker ? 'Status overview' : 'Weekly Activity'}
                                        </span>
                                        <BarChart3 className="w-3.5 h-3.5 text-[#00ED64]" />
                                    </div>
                                    <div className="flex items-end gap-1.5 h-12">
                                        {displayCards.slice(0, 7).map((item, i) => {
                                            const max = Math.max(
                                                ...displayCards.map((c) => c.count),
                                                1
                                            );
                                            const h = Math.max(4, Math.round((item.count / max) * 48));
                                            return (
                                                <div
                                                    key={item.key}
                                                    className="flex-1 bg-[#00ED64]/20 rounded-t-sm hover:bg-[#00ED64]/40 transition-all cursor-pointer"
                                                    style={{ height: `${h}px` }}
                                                    title={`${item.label}: ${item.count}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -top-3 -right-3 bg-[#00ED64] text-[#001E2B] px-4 py-2 rounded-lg shadow-lg shadow-[#00ED64]/20 text-sm font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {isJobSeeker
                                    ? interviewCount > 0
                                        ? `${interviewCount} Interview${interviewCount === 1 ? '' : 's'}`
                                        : 'No interviews yet'
                                    : '3 Interviews This Week'}
                            </div>

                            <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#00ED64]/10 rounded-full blur-xl" />
                            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-[#00ED64]/10 rounded-full blur-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

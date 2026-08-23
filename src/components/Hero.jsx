// src/components/Hero.jsx
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
    Clock8,
    Loader2,
    LayoutDashboard,
    PlusCircle,
    BarChart3,
} from 'lucide-react';

const STATUS_META = {
    applied: { label: 'Applied', icon: Send, color: 'text-blue-400', ring: 'ring-blue-400/20' },
    resume_viewed: { label: 'Resume Viewed', icon: Eye, color: 'text-cyan-400', ring: 'ring-cyan-400/20' },
    shortlisted: { label: 'Shortlisted', icon: Star, color: 'text-yellow-400', ring: 'ring-yellow-400/20' },
    online_test: { label: 'Online Test', icon: ClipboardList, color: 'text-purple-400', ring: 'ring-purple-400/20' },
    interview: { label: 'Interview', icon: UserCheck, color: 'text-indigo-400', ring: 'ring-indigo-400/20' },
    got_hired: { label: 'Got Hired', icon: Award, color: 'text-green-400', ring: 'ring-green-400/20' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', ring: 'ring-red-400/20' },
    no_response: { label: 'No Response', icon: Clock8, color: 'text-gray-400', ring: 'ring-gray-400/20' },
};

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

const CARD_KEYS = [
    'applied',
    'resume_viewed',
    'shortlisted',
    'online_test',
    'interview',
    'got_hired',
    'rejected',
    'no_response',
];

export default function Hero() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role === 'admin') {
            setStats(null);
            return;
        }

        let cancelled = false;
        (async () => {
            setStatsLoading(true);
            try {
                const res = await api.getJobStats();
                if (!cancelled && res?.success && res.stats) {
                    setStats(res.stats);
                } else if (!cancelled) {
                    setStats({ total: 0 });
                }
            } catch {
                if (!cancelled) setStats({ total: 0 });
            } finally {
                if (!cancelled) setStatsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isAuthenticated, authLoading, user?.role]);

    const isLoggedIn = !authLoading && isAuthenticated;
    const isJobSeeker = isLoggedIn && user?.role !== 'admin';
    const isAdmin = isLoggedIn && user?.role === 'admin';

    // API shape from /jobs/stats/summary:
    // { success, stats: { total, applied, resume_viewed, interview, got_hired, ... } }
    // (flat keys — not nested under stats.statuses)
    const getCount = (key) => {
        if (!stats) return 0;
        if (typeof stats[key] === 'number') return stats[key];
        if (stats.statuses && typeof stats.statuses[key] === 'number') return stats.statuses[key];
        return 0;
    };

    const displayCards = CARD_KEYS.map((key) => {
        const meta = STATUS_META[key];
        const count = isJobSeeker && stats ? getCount(key) : (DEMO_COUNTS[key] ?? 0);
        return { key, ...meta, count };
    });

    const totalApps =
        isJobSeeker && stats
            ? (typeof stats.total === 'number' ? stats.total : 0)
            : Object.values(DEMO_COUNTS).reduce((a, b) => a + b, 0);
    const interviewCount = isJobSeeker && stats ? getCount('interview') : DEMO_COUNTS.interview;
    const hiredCount = isJobSeeker && stats ? getCount('got_hired') : DEMO_COUNTS.got_hired;

    return (
        <section className="relative overflow-hidden bg-[#001E2B] border-b border-[#00684A]/20">
            {/* soft glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00ED64]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left — copy + CTAs */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ED64]/10 border border-[#00ED64]/20 text-[#00ED64] text-xs font-medium mb-6">
                            <Briefcase className="w-3.5 h-3.5" />
                            Job application tracker
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                            Track every application.
                            <span className="block text-[#00ED64] mt-1">Land the right role.</span>
                        </h1>

                        <p className="mt-5 text-gray-400 text-base sm:text-lg max-w-lg leading-relaxed">
                            Organize applications, log interviews and outcomes, and see what’s working —
                            all in one clean dashboard.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {isAdmin ? (
                                <Link
                                    href="/admin/dashboard"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg text-sm transition-all shadow-lg shadow-[#00ED64]/20"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Admin Dashboard
                                </Link>
                            ) : isJobSeeker ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg text-sm transition-all shadow-lg shadow-[#00ED64]/20"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Open Dashboard
                                    </Link>
                                    <Link
                                        href="/jobs?action=add"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#00684A]/50 hover:border-[#00ED64]/50 text-white font-medium rounded-lg text-sm transition-all"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Add Application
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg text-sm transition-all shadow-lg shadow-[#00ED64]/20"
                                    >
                                        Get started free
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#00684A]/50 hover:border-[#00ED64]/50 text-white font-medium rounded-lg text-sm transition-all"
                                    >
                                        Sign in
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* quick stats strip for logged-in job seekers */}
                        {isJobSeeker && (
                            <div className="mt-8 flex flex-wrap gap-6 text-sm">
                                {statsLoading ? (
                                    <Loader2 className="w-4 h-4 text-[#00ED64] animate-spin" />
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-2xl font-bold text-white">{totalApps}</p>
                                            <p className="text-gray-500 text-xs">Applications</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-indigo-400">{interviewCount}</p>
                                            <p className="text-gray-500 text-xs">Interviews</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-400">{hiredCount}</p>
                                            <p className="text-gray-500 text-xs">Offers</p>
                                        </div>
                                        <Link
                                            href="/analytics"
                                            className="self-center text-[#00ED64] text-xs font-medium hover:underline inline-flex items-center gap-1"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            View analytics
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — status pipeline cards */}
                    <div className="relative">
                        <div className="bg-[#002433]/80 backdrop-blur border border-[#00684A]/30 rounded-2xl p-5 sm:p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-white">
                                    {isJobSeeker ? 'Your pipeline' : 'Sample pipeline'}
                                </p>
                                {statsLoading && (
                                    <Loader2 className="w-4 h-4 text-[#00ED64] animate-spin" />
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {displayCards.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.key}
                                            className={`rounded-xl bg-[#001E2B] border border-[#00684A]/20 p-3 ring-1 ${item.ring} transition-transform hover:scale-[1.02]`}
                                        >
                                            <Icon className={`w-4 h-4 ${item.color} mb-2`} />
                                            <p className="text-lg font-bold text-white leading-none">
                                                {item.count}
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                                                {item.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* mini bar visualization */}
                            <div className="mt-5 pt-4 border-t border-[#00684A]/20">
                                <div className="flex items-end gap-1 h-10">
                                    {displayCards.slice(0, 6).map((item) => {
                                        const max = Math.max(...displayCards.map((c) => c.count), 1);
                                        const h = Math.max(4, Math.round((item.count / max) * 40));
                                        return (
                                            <div
                                                key={item.key}
                                                className="flex-1 bg-[#00ED64]/25 hover:bg-[#00ED64]/45 rounded-t transition-all"
                                                style={{ height: `${h}px` }}
                                                title={`${item.label}: ${item.count}`}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-gray-600 mt-2 text-center">
                                    {isJobSeeker ? 'Live counts from your applications' : 'Demo data — sign up to track yours'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
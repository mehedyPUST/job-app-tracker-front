// components/Hero.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Briefcase,
    FileCheck,
    Eye,
    ClipboardList,
    UserCheck,
    Award,
    XCircle,
    ArrowRight,
    TrendingUp,
    Clock,
    BarChart3,
    PlusCircle
} from 'lucide-react';

export default function Hero() {
    const [email, setEmail] = useState('');

    const handleGetStarted = (e) => {
        e.preventDefault();
        // Redirect to register
        window.location.href = '/register';
    };

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
                                Track Your Job Applications
                            </span>
                        </div>

                        {/* Heading */}
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

                        {/* Description */}
                        <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                            Never lose track of your job applications again. Organize, monitor,
                            and analyze your entire job search journey from application to offer.
                        </p>

                        {/* Application Status Flow */}
                        <div className="flex flex-wrap items-center gap-3 py-2">
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="px-3 py-1.5 bg-[#00684A]/20 text-[#00ED64] rounded-full border border-[#00ED64]/20 flex items-center gap-1.5">
                                    <Briefcase className="w-3 h-3" />
                                    Applied
                                </span>
                                <ArrowRight className="w-3 h-3 text-gray-500" />
                                <span className="px-3 py-1.5 bg-[#00684A]/20 text-gray-300 rounded-full border border-gray-700 flex items-center gap-1.5">
                                    <Eye className="w-3 h-3" />
                                    Viewed
                                </span>
                                <ArrowRight className="w-3 h-3 text-gray-500" />
                                <span className="px-3 py-1.5 bg-[#00684A]/20 text-yellow-400 rounded-full border border-yellow-400/20 flex items-center gap-1.5">
                                    <ClipboardList className="w-3 h-3" />
                                    Test
                                </span>
                                <ArrowRight className="w-3 h-3 text-gray-500" />
                                <span className="px-3 py-1.5 bg-[#00684A]/20 text-blue-400 rounded-full border border-blue-400/20 flex items-center gap-1.5">
                                    <UserCheck className="w-3 h-3" />
                                    Interview
                                </span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
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
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-[#00684A]/20">
                            <div>
                                <p className="text-white font-bold text-xl">500+</p>
                                <p className="text-gray-400 text-xs">Applications Tracked</p>
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl">85%</p>
                                <p className="text-gray-400 text-xs">Success Rate</p>
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl">50+</p>
                                <p className="text-gray-400 text-xs">Companies</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Application Tracker Preview */}
                    <div className="relative flex justify-center items-center">
                        <div className="relative w-full max-w-lg">
                            {/* Status Cards */}
                            <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6 shadow-2xl shadow-[#00ED64]/5">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#00ED64]" />
                                        My Applications
                                    </h3>
                                    <span className="text-xs text-gray-400">Last 30 days</span>
                                </div>

                                {/* Status Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#001E2B] p-3 rounded-lg border border-[#00684A]/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Applied</span>
                                            <Briefcase className="w-3.5 h-3.5 text-[#00ED64]" />
                                        </div>
                                        <p className="text-white font-bold text-xl mt-1">24</p>
                                    </div>

                                    <div className="bg-[#001E2B] p-3 rounded-lg border border-[#00684A]/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Viewed</span>
                                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <p className="text-white font-bold text-xl mt-1">18</p>
                                    </div>

                                    <div className="bg-[#001E2B] p-3 rounded-lg border border-[#00684A]/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Test</span>
                                            <ClipboardList className="w-3.5 h-3.5 text-yellow-400" />
                                        </div>
                                        <p className="text-white font-bold text-xl mt-1">8</p>
                                    </div>

                                    <div className="bg-[#001E2B] p-3 rounded-lg border border-[#00684A]/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Interview</span>
                                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <p className="text-white font-bold text-xl mt-1">5</p>
                                    </div>

                                    <div className="bg-[#001E2B] p-3 rounded-lg border border-[#00684A]/20 col-span-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Offered</span>
                                            <Award className="w-3.5 h-3.5 text-green-400" />
                                        </div>
                                        <p className="text-white font-bold text-xl mt-1">2</p>
                                    </div>

                                    <div className="bg-[#001E2B] p-3 rounded-lg border border-[#00684A]/20 col-span-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Rejected</span>
                                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                                        </div>
                                        <p className="text-white font-bold text-xl mt-1">6</p>
                                    </div>
                                </div>

                                {/* Mini Chart Preview */}
                                <div className="mt-4 pt-4 border-t border-[#00684A]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs">Weekly Activity</span>
                                        <BarChart3 className="w-3.5 h-3.5 text-[#00ED64]" />
                                    </div>
                                    <div className="flex items-end gap-1.5 h-12">
                                        {[3, 5, 2, 7, 4, 6, 3].map((height, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-[#00ED64]/20 rounded-t-sm hover:bg-[#00ED64]/40 transition-all cursor-pointer"
                                                style={{ height: `${height * 8}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating Status Badge */}
                            <div className="absolute -top-3 -right-3 bg-[#00ED64] text-[#001E2B] px-4 py-2 rounded-lg shadow-lg shadow-[#00ED64]/20 text-sm font-bold flex items-center gap-2 animate-bounce">
                                <Clock className="w-4 h-4" />
                                3 Interviews This Week
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#00ED64]/10 rounded-full blur-xl" />
                            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-[#00ED64]/10 rounded-full blur-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
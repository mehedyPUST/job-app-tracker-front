// src/app/(dashboard)/analytics/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    LineChart,
    Line,
    ComposedChart
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    Loader2,
    Award,
    Briefcase,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Building2,
    Eye,
    Mail,
    Phone,
    CalendarDays,
    ArrowUp,
    ArrowDown,
    Minus,
    AlertCircle,
    Sparkles,
    Target,
    Rocket
} from 'lucide-react';

// Status colors for charts
const STATUS_COLORS = {
    applied: '#3B82F6',
    resume_viewed: '#06B6D4',
    shortlisted: '#EAB308',
    online_test: '#8B5CF6',
    interview: '#6366F1',
    got_hired: '#22C55E',
    rejected: '#EF4444',
    no_response: '#6B7280',
    no_action: '#9CA3AF'
};

const STATUS_LABELS = {
    applied: 'Applied',
    resume_viewed: 'Resume Viewed',
    shortlisted: 'Shortlisted',
    online_test: 'Online Test',
    interview: 'Interview',
    got_hired: 'Got Hired',
    rejected: 'Rejected',
    no_response: 'No Response',
    no_action: 'No Action Yet'
};

// Status flow order for funnel
const STATUS_FLOW = [
    'applied',
    'resume_viewed',
    'shortlisted',
    'online_test',
    'interview',
    'got_hired'
];

export default function AnalyticsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('all');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchJobs();
        }
    }, [isAuthenticated]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.getJobs();
            if (response.success) {
                setJobs(response.jobs || []);
            } else {
                setError(response.message || 'Failed to load data');
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // CALCULATE KEY METRICS
    // ============================================

    // Get jobs within time range
    const getFilteredJobs = () => {
        if (timeRange === 'all') return jobs;

        const now = new Date();
        const cutoff = new Date();
        if (timeRange === '30days') cutoff.setDate(now.getDate() - 30);
        else if (timeRange === '60days') cutoff.setDate(now.getDate() - 60);
        else if (timeRange === '90days') cutoff.setDate(now.getDate() - 90);

        return jobs.filter(job => {
            const date = new Date(job.appliedDate || job.createdAt);
            return date >= cutoff;
        });
    };

    const filteredJobs = getFilteredJobs();

    // Total applications
    const totalApplications = filteredJobs.length;

    // Success metrics
    const offersReceived = filteredJobs.filter(j => j.status === 'got_hired').length;
    const interviewsReceived = filteredJobs.filter(j =>
        j.status === 'interview' || j.status === 'online_test'
    ).length;
    const shortlisted = filteredJobs.filter(j => j.status === 'shortlisted').length;
    const rejected = filteredJobs.filter(j => j.status === 'rejected').length;
    const noResponse = filteredJobs.filter(j => j.status === 'no_response').length;
    const noAction = filteredJobs.filter(j => j.status === 'no_action').length;
    const activeApplications = filteredJobs.filter(j =>
        j.status !== 'got_hired' &&
        j.status !== 'rejected' &&
        j.status !== 'no_response'
    ).length;

    // Calculate rates
    const interviewRate = totalApplications > 0
        ? ((interviewsReceived / totalApplications) * 100).toFixed(1)
        : 0;

    const offerRate = totalApplications > 0
        ? ((offersReceived / totalApplications) * 100).toFixed(1)
        : 0;

    const rejectionRate = totalApplications > 0
        ? ((rejected / totalApplications) * 100).toFixed(1)
        : 0;

    const successRate = interviewsReceived > 0
        ? ((offersReceived / interviewsReceived) * 100).toFixed(1)
        : 0;

    // Conversion funnel data
    const getFunnelData = () => {
        const counts = {};
        let currentCount = totalApplications;

        STATUS_FLOW.forEach(status => {
            const count = filteredJobs.filter(j => j.status === status).length;
            counts[status] = {
                label: STATUS_LABELS[status],
                count: count,
                percentage: totalApplications > 0 ? ((count / totalApplications) * 100).toFixed(1) : 0,
                dropoff: STATUS_FLOW.indexOf(status) > 0
                    ? ((1 - (count / currentCount)) * 100).toFixed(1)
                    : 0
            };
            currentCount = count || 1;
        });

        return counts;
    };

    const funnelData = getFunnelData();

    // Monthly trend data
    const getMonthlyTrend = () => {
        const months = {};
        filteredJobs.forEach(job => {
            const date = new Date(job.appliedDate || job.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!months[key]) {
                months[key] = {
                    month: label,
                    applied: 0,
                    interviews: 0,
                    offers: 0,
                    rejected: 0
                };
            }

            months[key].applied++;
            if (job.status === 'interview') months[key].interviews++;
            if (job.status === 'got_hired') months[key].offers++;
            if (job.status === 'rejected') months[key].rejected++;
        });

        // Sort by date
        return Object.keys(months)
            .sort()
            .map(key => months[key])
            .slice(-6);
    };

    const monthlyTrend = getMonthlyTrend();

    // Company analysis
    const getCompanyAnalysis = () => {
        const companies = {};
        filteredJobs.forEach(job => {
            const name = job.company || 'Unknown';
            if (!companies[name]) {
                companies[name] = { applied: 0, interview: 0, offered: 0, rejected: 0 };
            }
            companies[name].applied++;
            if (job.status === 'interview' || job.status === 'online_test') {
                companies[name].interview++;
            }
            if (job.status === 'got_hired') companies[name].offered++;
            if (job.status === 'rejected') companies[name].rejected++;
        });

        return Object.entries(companies)
            .map(([name, data]) => ({
                name,
                ...data,
                successRate: data.applied > 0 ? ((data.offered / data.applied) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.applied - a.applied)
            .slice(0, 5);
    };

    const companyAnalysis = getCompanyAnalysis();

    // Status distribution for pie chart
    const getStatusDistribution = () => {
        const statusCount = {};
        filteredJobs.forEach(job => {
            statusCount[job.status] = (statusCount[job.status] || 0) + 1;
        });
        return Object.entries(statusCount)
            .map(([status, count]) => ({
                name: STATUS_LABELS[status] || status,
                value: count,
                color: STATUS_COLORS[status] || '#9CA3AF'
            }))
            .sort((a, b) => b.value - a.value);
    };

    const statusDistribution = getStatusDistribution();

    // Weekly activity
    const getWeeklyActivity = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = days.map(day => ({ day, applied: 0, interviews: 0, offers: 0 }));
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);

        filteredJobs.forEach(job => {
            const date = new Date(job.appliedDate || job.createdAt);
            if (date >= weekStart && date <= now) {
                const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
                if (dayIndex >= 0 && dayIndex < 7) {
                    weekData[dayIndex].applied++;
                    if (job.status === 'interview' || job.status === 'online_test') {
                        weekData[dayIndex].interviews++;
                    }
                    if (job.status === 'got_hired') weekData[dayIndex].offers++;
                }
            }
        });
        return weekData;
    };

    const weeklyActivity = getWeeklyActivity();

    // Application velocity
    const getApplicationVelocity = () => {
        if (totalApplications === 0) return { daily: 0, weekly: 0, monthly: 0 };

        const now = new Date();
        const firstDate = new Date(filteredJobs.reduce((min, job) => {
            const date = new Date(job.appliedDate || job.createdAt);
            return date < min ? date : min;
        }, new Date()));

        const daysDiff = Math.max(1, Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24)));
        return {
            daily: (totalApplications / daysDiff).toFixed(1),
            weekly: (totalApplications / (daysDiff / 7)).toFixed(1),
            monthly: (totalApplications / (daysDiff / 30)).toFixed(1)
        };
    };

    const velocity = getApplicationVelocity();

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#00ED64] animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-[#00ED64]" />
                            Job Search Analytics
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Track your progress and optimize your job search strategy
                        </p>
                    </div>

                    {/* Time Range Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 mr-2">Time:</span>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-1.5 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent"
                        >
                            <option value="all">All Time</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="60days">Last 60 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {totalApplications === 0 ? (
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00ED64]/10 rounded-full mb-4">
                            <Target className="w-10 h-10 text-[#00ED64]" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">No Data Yet</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Start adding your job applications to see analytics and insights about your job search journey.
                        </p>
                        <button
                            onClick={() => router.push('/jobs?action=add')}
                            className="mt-6 px-6 py-3 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40"
                        >
                            <Briefcase className="w-4 h-4" />
                            Add Your First Application
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ============================================ */}
                        {/* KEY METRICS CARDS */}
                        {/* ============================================ */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#00ED64]" />
                                        <span className="text-xs text-gray-500">Total Apps</span>
                                    </div>
                                    <span className="text-xs text-gray-500">📊</span>
                                </div>
                                <p className="text-2xl font-bold text-white mt-2">{totalApplications}</p>
                                <p className="text-xs text-gray-400">
                                    {velocity.daily} / day on average
                                </p>
                            </div>

                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs text-gray-500">Interviews</span>
                                    </div>
                                    <span className="text-xs text-gray-500">🎯</span>
                                </div>
                                <p className="text-2xl font-bold text-white mt-2">{interviewsReceived}</p>
                                <p className="text-xs text-gray-400">
                                    {interviewRate}% of applications
                                </p>
                            </div>

                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-green-400" />
                                        <span className="text-xs text-gray-500">Offers</span>
                                    </div>
                                    <span className="text-xs text-gray-500">🏆</span>
                                </div>
                                <p className="text-2xl font-bold text-white mt-2">{offersReceived}</p>
                                <p className="text-xs text-gray-400">
                                    {offerRate}% of applications
                                </p>
                            </div>

                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-400" />
                                        <span className="text-xs text-gray-500">Active</span>
                                    </div>
                                    <span className="text-xs text-gray-500">⏳</span>
                                </div>
                                <p className="text-2xl font-bold text-white mt-2">{activeApplications}</p>
                                <p className="text-xs text-gray-400">
                                    Still in progress
                                </p>
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* SUCCESS RATES */}
                        {/* ============================================ */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${offerRate > 20 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                    <span className="text-xs text-gray-400">Success Rate</span>
                                </div>
                                <p className="text-xl font-bold text-white mt-1">{offerRate}%</p>
                                <p className="text-xs text-gray-500">Applications → Offers</p>
                            </div>

                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${interviewRate > 30 ? 'bg-purple-400' : 'bg-yellow-400'}`} />
                                    <span className="text-xs text-gray-400">Interview Rate</span>
                                </div>
                                <p className="text-xl font-bold text-white mt-1">{interviewRate}%</p>
                                <p className="text-xs text-gray-500">Applications → Interviews</p>
                            </div>

                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${rejectionRate < 30 ? 'bg-green-400' : 'bg-red-400'}`} />
                                    <span className="text-xs text-gray-400">Rejection Rate</span>
                                </div>
                                <p className="text-xl font-bold text-white mt-1">{rejectionRate}%</p>
                                <p className="text-xs text-gray-500">Applications rejected</p>
                            </div>

                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${successRate > 30 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                    <span className="text-xs text-gray-400">Interview → Offer</span>
                                </div>
                                <p className="text-xl font-bold text-white mt-1">{successRate}%</p>
                                <p className="text-xs text-gray-500">Interviews → Offers</p>
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* CHARTS GRID */}
                        {/* ============================================ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Status Distribution - Pie Chart */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <PieChartIcon className="w-5 h-5 text-[#00ED64]" />
                                    Application Status Breakdown
                                </h3>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={90}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#001E2B',
                                                    borderColor: '#00684A',
                                                    color: '#fff'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Conversion Funnel */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-[#00ED64]" />
                                    Application Funnel
                                </h3>
                                <div className="space-y-3">
                                    {STATUS_FLOW.map((status, index) => {
                                        const data = funnelData[status];
                                        if (!data) return null;
                                        const isLast = index === STATUS_FLOW.length - 1;
                                        const barWidth = data.percentage;

                                        return (
                                            <div key={status} className="relative">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 text-right">
                                                        <span className="text-xs text-gray-400">{data.label}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div
                                                            className={`h-8 rounded-lg transition-all duration-500 flex items-center px-3`}
                                                            style={{
                                                                width: `${Math.max(barWidth, 5)}%`,
                                                                backgroundColor: STATUS_COLORS[status],
                                                                opacity: barWidth > 0 ? 0.8 : 0.3
                                                            }}
                                                        >
                                                            <span className="text-xs font-medium text-white">
                                                                {data.count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-16 text-left">
                                                        <span className="text-xs text-gray-400">{data.percentage}%</span>
                                                    </div>
                                                </div>
                                                {data.dropoff > 0 && !isLast && (
                                                    <div className="ml-24 text-xs text-red-400">
                                                        ↓ {data.dropoff}% dropoff
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Monthly Trend - Area Chart */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6 lg:col-span-2">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[#00ED64]" />
                                    Monthly Progress Trend
                                </h3>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={monthlyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#00684A" />
                                            <XAxis dataKey="month" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#001E2B',
                                                    borderColor: '#00684A',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="applied"
                                                name="Applications"
                                                stroke="#00ED64"
                                                fill="#00ED64"
                                                fillOpacity={0.2}
                                            />
                                            <Bar dataKey="interviews" name="Interviews" fill="#8B5CF6" />
                                            <Bar dataKey="offers" name="Offers" fill="#22C55E" />
                                            <Line
                                                type="monotone"
                                                dataKey="applied"
                                                name="Trend"
                                                stroke="#00ED64"
                                                strokeWidth={2}
                                                dot={{ fill: '#00ED64', r: 4 }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Weekly Activity */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#00ED64]" />
                                    Weekly Activity
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyActivity}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#00684A" />
                                            <XAxis dataKey="day" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#001E2B',
                                                    borderColor: '#00684A',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="applied" name="Applied" fill="#00ED64" />
                                            <Bar dataKey="interviews" name="Interviews" fill="#8B5CF6" />
                                            <Bar dataKey="offers" name="Offers" fill="#22C55E" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Company Analysis */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-[#00ED64]" />
                                    Top Companies
                                </h3>
                                <div className="space-y-4">
                                    {companyAnalysis.map((company, index) => (
                                        <div key={company.name} className="bg-[#001E2B] rounded-lg p-3 border border-[#00684A]/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-500">#{index + 1}</span>
                                                    <span className="text-white font-medium text-sm">{company.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span className="text-gray-400">
                                                        <Briefcase className="inline w-3 h-3 mr-1" />
                                                        {company.applied}
                                                    </span>
                                                    <span className="text-purple-400">
                                                        <Users className="inline w-3 h-3 mr-1" />
                                                        {company.interview}
                                                    </span>
                                                    <span className="text-green-400">
                                                        <Award className="inline w-3 h-3 mr-1" />
                                                        {company.offered}
                                                    </span>
                                                    <span className={`${company.successRate > 20 ? 'text-green-400' : 'text-gray-400'}`}>
                                                        {company.successRate}%
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Success bar */}
                                            <div className="mt-2 w-full bg-[#001E2B] rounded-full h-1.5">
                                                <div
                                                    className="bg-[#00ED64] h-1.5 rounded-full transition-all"
                                                    style={{ width: `${Math.min(company.successRate, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* INSIGHTS SECTION */}
                        {/* ============================================ */}
                        <div className="mt-6 bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#00ED64]" />
                                Key Insights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Insight 1 */}
                                <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${offerRate > 20 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                        <span className="text-xs text-gray-400">Success Rate</span>
                                    </div>
                                    <p className="text-white font-medium">
                                        {offerRate > 20
                                            ? `✅ Great! You're converting ${offerRate}% of applications to offers.`
                                            : `📈 Your success rate is ${offerRate}%. Try applying to more targeted roles.`}
                                    </p>
                                </div>

                                {/* Insight 2 */}
                                <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${interviewRate > 30 ? 'bg-purple-400' : 'bg-yellow-400'}`} />
                                        <span className="text-xs text-gray-400">Interview Rate</span>
                                    </div>
                                    <p className="text-white font-medium">
                                        {interviewRate > 30
                                            ? `🎯 Excellent! You're getting interviews for ${interviewRate}% of applications.`
                                            : `📋 ${interviewRate}% interview rate. Consider tailoring your resume more.`}
                                    </p>
                                </div>

                                {/* Insight 3 */}
                                <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${rejectionRate > 40 ? 'bg-red-400' : 'bg-green-400'}`} />
                                        <span className="text-xs text-gray-400">Rejection Rate</span>
                                    </div>
                                    <p className="text-white font-medium">
                                        {rejectionRate > 40
                                            ? `⚠️ ${rejectionRate}% rejection rate. Review your application strategy.`
                                            : `💪 Only ${rejectionRate}% rejections. Keep up the good work!`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
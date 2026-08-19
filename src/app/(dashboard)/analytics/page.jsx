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
    Area
} from 'recharts';
import {
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    Loader2,
    Award,
    Briefcase,
    CheckCircle,
    XCircle
} from 'lucide-react';

const STATUS_LABELS = {
    applied: 'Applied',
    resume_viewed: 'Resume Viewed',
    shortlisted: 'Shortlisted',
    online_test: 'Online Test',
    interview: 'Interview',
    got_hired: 'Got Hired',
    rejected: 'Rejected',
    no_response: 'No Response'
};

const STATUS_COLORS = {
    applied: '#3B82F6',
    resume_viewed: '#06B6D4',
    shortlisted: '#EAB308',
    online_test: '#8B5CF6',
    interview: '#6366F1',
    got_hired: '#22C55E',
    rejected: '#EF4444',
    no_response: '#6B7280'
};

export default function AnalyticsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    // Process data for charts
    const getStatusDistribution = () => {
        const statusCount = {};
        jobs.forEach(job => {
            statusCount[job.status] = (statusCount[job.status] || 0) + 1;
        });
        return Object.entries(statusCount).map(([status, count]) => ({
            name: STATUS_LABELS[status] || status,
            value: count,
            color: STATUS_COLORS[status] || '#6B7280'
        }));
    };

    const getMonthlyApplications = () => {
        const months = {};
        jobs.forEach(job => {
            const date = new Date(job.appliedDate || job.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleString('default', { month: 'short' });
            if (!months[monthKey]) {
                months[monthKey] = { month: monthLabel, count: 0, interviews: 0, offers: 0 };
            }
            months[monthKey].count++;
            if (job.status === 'interview') months[monthKey].interviews++;
            if (job.status === 'got_hired') months[monthKey].offers++;
        });
        return Object.values(months).slice(-6);
    };

    const getWeeklyActivity = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = days.map(day => ({ day, applied: 0, interviews: 0 }));
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);

        jobs.forEach(job => {
            const date = new Date(job.appliedDate || job.createdAt);
            if (date >= weekStart && date <= now) {
                const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
                if (dayIndex >= 0 && dayIndex < 7) {
                    weekData[dayIndex].applied++;
                    if (job.status === 'interview') weekData[dayIndex].interviews++;
                }
            }
        });
        return weekData;
    };

    const getStats = () => {
        const total = jobs.length;
        const interviews = jobs.filter(j => j.status === 'interview' || j.status === 'online_test').length;
        const offers = jobs.filter(j => j.status === 'got_hired').length;
        const rejected = jobs.filter(j => j.status === 'rejected').length;
        const acceptanceRate = total > 0 ? ((offers / total) * 100).toFixed(1) : 0;
        return { total, interviews, offers, rejected, acceptanceRate };
    };

    const stats = getStats();
    const statusData = getStatusDistribution();
    const monthlyData = getMonthlyApplications();
    const weeklyData = getWeeklyActivity();

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Analytics</h1>
                    <p className="text-gray-400 mt-1">
                        Visual insights into your job application journey
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <Briefcase className="w-5 h-5 text-[#00ED64]" />
                            <span className="text-xs text-gray-500">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
                        <p className="text-xs text-gray-400">Applications</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <span className="text-xs text-gray-500">Interviews</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{stats.interviews}</p>
                        <p className="text-xs text-gray-400">Scheduled</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <Award className="w-5 h-5 text-green-400" />
                            <span className="text-xs text-gray-500">Offers</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{stats.offers}</p>
                        <p className="text-xs text-gray-400">Got hired</p>
                    </div>

                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                        <div className="flex items-center justify-between">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-gray-500">Success Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">{stats.acceptanceRate}%</p>
                        <p className="text-xs text-gray-400">Offers / Applications</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {jobs.length === 0 ? (
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00ED64]/10 rounded-full mb-4">
                            <PieChartIcon className="w-10 h-10 text-[#00ED64]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No data yet</h3>
                        <p className="text-gray-400">
                            Add some jobs to see analytics and insights about your applications.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Distribution - Pie Chart */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <PieChartIcon className="w-5 h-5 text-[#00ED64]" />
                                    Status Distribution
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusData.map((entry, index) => (
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

                            {/* Monthly Applications - Bar Chart */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-[#00ED64]" />
                                    Monthly Applications
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
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
                                            <Bar dataKey="count" name="Applications" fill="#00ED64" />
                                            <Bar dataKey="interviews" name="Interviews" fill="#8B5CF6" />
                                            <Bar dataKey="offers" name="Offers" fill="#22C55E" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Weekly Activity - Area Chart */}
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-6 lg:col-span-2">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[#00ED64]" />
                                    Weekly Activity
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weeklyData}>
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
                                            <Area
                                                type="monotone"
                                                dataKey="applied"
                                                name="Applied"
                                                stroke="#00ED64"
                                                fill="#00ED64"
                                                fillOpacity={0.2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="interviews"
                                                name="Interviews"
                                                stroke="#8B5CF6"
                                                fill="#8B5CF6"
                                                fillOpacity={0.2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#00ED64]" />
                                    <div>
                                        <p className="text-xs text-gray-500">Active Applications</p>
                                        <p className="text-white font-semibold">
                                            {statusData.filter(s => s.name !== 'Rejected' && s.name !== 'No Response')
                                                .reduce((sum, s) => sum + s.value, 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-5 h-5 text-red-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Rejected</p>
                                        <p className="text-white font-semibold">
                                            {statusData.find(s => s.name === 'Rejected')?.value || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4">
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Conversion Rate</p>
                                        <p className="text-white font-semibold">
                                            {jobs.length > 0 ? ((statusData.find(s => s.name === 'Got Hired')?.value || 0) / jobs.length * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
// src/app/(dashboard)/analytics/page.jsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { normalizeStatusHistory } from '@/lib/statusLogic';
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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
    Line,
} from 'recharts';
import {
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    Loader2,
    Award,
    Briefcase,
    AlertCircle,
    Target,
    Rocket,
    UserCheck,
    RefreshCw,
    GitBranch,
    Clock,
    Activity,
    Layers,
} from 'lucide-react';

const STATUS_COLORS = {
    applied: '#3B82F6',
    resume_viewed: '#06B6D4',
    shortlisted: '#EAB308',
    online_test: '#8B5CF6',
    interview: '#6366F1',
    got_hired: '#22C55E',
    rejected: '#EF4444',
    no_response: '#6B7280',
    no_action: '#9CA3AF',
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
    no_action: 'No Action Yet',
};

const PIPELINE = [
    'applied',
    'resume_viewed',
    'shortlisted',
    'online_test',
    'interview',
    'got_hired',
];

const tooltipStyle = {
    backgroundColor: '#001E2B',
    borderColor: '#00684A',
    borderRadius: 8,
    color: '#fff',
    fontSize: 12,
};

function jobHasStatus(job, key) {
    if (!job) return false;
    if (job.status === key) return true;
    return normalizeStatusHistory(job).some((h) => h.status === key);
}

function statusDate(job, key) {
    const h = normalizeStatusHistory(job).find((x) => x.status === key);
    if (h?.date) return new Date(h.date);
    if (job.status === key) return new Date(job.updatedAt || job.createdAt);
    return null;
}

function daysBetween(a, b) {
    if (!a || !b) return null;
    return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export default function AnalyticsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/login');
    }, [authLoading, isAuthenticated, router]);

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const [jobsRes, statsRes] = await Promise.all([
                api.getJobs(),
                api.getJobStats(),
            ]);
            if (jobsRes?.success) setJobs(jobsRes.jobs || []);
            else setError(jobsRes?.message || 'Failed to load jobs');
            if (statsRes?.success && statsRes.stats) setStats(statsRes.stats);
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) loadData();
    }, [isAuthenticated, loadData]);

    const filteredJobs = useMemo(() => {
        if (timeRange === 'all') return jobs;
        const days = { '30days': 30, '60days': 60, '90days': 90 }[timeRange] || 0;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return jobs.filter((j) => new Date(j.appliedDate || j.createdAt) >= cutoff);
    }, [jobs, timeRange]);

    /* ─── core metrics ─── */
    const metrics = useMemo(() => {
        const total = filteredJobs.length;
        const countEver = (k) => filteredJobs.filter((j) => jobHasStatus(j, k)).length;
        const countCurrent = (k) => filteredJobs.filter((j) => j.status === k).length;

        const interviews = countEver('interview');
        const hired = countEver('got_hired');
        const rejected = countCurrent('rejected');
        const active = filteredJobs.filter(
            (j) => !['got_hired', 'rejected', 'no_response'].includes(j.status)
        ).length;

        const pct = (n) => (total > 0 ? ((n / total) * 100).toFixed(1) : '0.0');

        // Timing: applied → interview / offer
        const toInterview = [];
        const toOffer = [];
        filteredJobs.forEach((j) => {
            const applied = statusDate(j, 'applied') || new Date(j.appliedDate || j.createdAt);
            const iv = statusDate(j, 'interview');
            const of = statusDate(j, 'got_hired');
            if (applied && iv) {
                const d = daysBetween(applied, iv);
                if (d != null) toInterview.push(d);
            }
            if (applied && of) {
                const d = daysBetween(applied, of);
                if (d != null) toOffer.push(d);
            }
        });
        const avg = (arr) =>
            arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

        return {
            total: timeRange === 'all' && stats?.total != null ? stats.total : total,
            interviews,
            hired,
            rejected,
            active,
            shortlisted: countEver('shortlisted'),
            onlineTest: countEver('online_test'),
            noResponse: countCurrent('no_response'),
            interviewRate: pct(interviews),
            offerRate: pct(hired),
            rejectionRate: pct(rejected),
            conversionRate:
                interviews > 0 ? ((hired / interviews) * 100).toFixed(1) : '0.0',
            avgDaysToInterview: avg(toInterview),
            avgDaysToOffer: avg(toOffer),
            sampleInterview: toInterview.length,
            sampleOffer: toOffer.length,
        };
    }, [filteredJobs, stats, timeRange]);

    /* ─── stage conversion ladder ─── */
    const conversionLadder = useMemo(() => {
        const counts = PIPELINE.map((s) => ({
            key: s,
            label: STATUS_LABELS[s],
            count: filteredJobs.filter((j) => jobHasStatus(j, s)).length,
            color: STATUS_COLORS[s],
        }));
        return counts.map((step, i) => {
            const prev = i === 0 ? metrics.total : counts[i - 1].count;
            const rate = prev > 0 ? Math.round((step.count / prev) * 100) : 0;
            return { ...step, fromPrev: rate, prevLabel: i === 0 ? 'Apps' : counts[i - 1].label };
        });
    }, [filteredJobs, metrics.total]);

    /* ─── funnel ─── */
    const funnelData = useMemo(
        () =>
            PIPELINE.map((status) => {
                const count = filteredJobs.filter((j) => jobHasStatus(j, status)).length;
                return {
                    name: STATUS_LABELS[status],
                    count,
                    fill: STATUS_COLORS[status],
                    pct: metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0,
                };
            }),
        [filteredJobs, metrics.total]
    );

    /* ─── status pie ─── */
    const statusDistribution = useMemo(() => {
        const counts = {};
        filteredJobs.forEach((j) => {
            const s = j.status || 'no_action';
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([key, value]) => ({
                name: STATUS_LABELS[key] || key,
                value,
                color: STATUS_COLORS[key] || '#9CA3AF',
                key,
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredJobs]);

    /* ─── radar (pipeline coverage) ─── */
    const radarData = useMemo(() => {
        const max = Math.max(metrics.total, 1);
        return PIPELINE.map((s) => ({
            stage: STATUS_LABELS[s].replace(' ', '\n'),
            fullMark: max,
            value: filteredJobs.filter((j) => jobHasStatus(j, s)).length,
        }));
    }, [filteredJobs, metrics.total]);

    /* ─── monthly stacked + line ─── */
    const monthlyTrend = useMemo(() => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                key,
                label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                applications: 0,
                interviews: 0,
                offers: 0,
                rejected: 0,
            });
        }
        const map = Object.fromEntries(months.map((m) => [m.key, m]));
        filteredJobs.forEach((j) => {
            const d = new Date(j.appliedDate || j.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!map[key]) return;
            map[key].applications += 1;
            if (jobHasStatus(j, 'interview')) map[key].interviews += 1;
            if (jobHasStatus(j, 'got_hired')) map[key].offers += 1;
            if (j.status === 'rejected') map[key].rejected += 1;
        });
        return months;
    }, [filteredJobs]);

    /* ─── weekly heatmap (12 weeks) ─── */
    const weeklyHeatmap = useMemo(() => {
        const weeks = [];
        const now = new Date();
        // start of current week (Mon)
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const day = start.getDay();
        start.setDate(start.getDate() - ((day + 6) % 7));

        for (let w = 11; w >= 0; w--) {
            const ws = new Date(start);
            ws.setDate(ws.getDate() - w * 7);
            const we = new Date(ws);
            we.setDate(we.getDate() + 7);
            const label = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            let count = 0;
            filteredJobs.forEach((j) => {
                const d = new Date(j.appliedDate || j.createdAt);
                if (d >= ws && d < we) count += 1;
            });
            weeks.push({ label, count, key: ws.toISOString() });
        }
        return weeks;
    }, [filteredJobs]);

    const heatMax = Math.max(...weeklyHeatmap.map((w) => w.count), 1);

    /* ─── top companies ─── */
    const topCompanies = useMemo(() => {
        const map = {};
        filteredJobs.forEach((j) => {
            const c = (j.company || 'Unknown').trim();
            if (!map[c]) map[c] = { name: c, total: 0, interview: 0, hired: 0 };
            map[c].total += 1;
            if (jobHasStatus(j, 'interview')) map[c].interview += 1;
            if (jobHasStatus(j, 'got_hired')) map[c].hired += 1;
        });
        return Object.values(map)
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);
    }, [filteredJobs]);

    /* ─── outcome breakdown ─── */
    const outcomes = useMemo(() => {
        const hired = filteredJobs.filter((j) => j.status === 'got_hired').length;
        const rejected = filteredJobs.filter((j) => j.status === 'rejected').length;
        const noResponse = filteredJobs.filter((j) => j.status === 'no_response').length;
        const active = filteredJobs.length - hired - rejected - noResponse;
        return [
            { name: 'Active', value: active, color: '#00ED64' },
            { name: 'Hired', value: hired, color: '#22C55E' },
            { name: 'Rejected', value: rejected, color: '#EF4444' },
            { name: 'No Response', value: noResponse, color: '#6B7280' },
        ].filter((o) => o.value > 0);
    }, [filteredJobs]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-app-accent-readable animate-spin mx-auto" />
                    <p className="text-app-muted mt-4">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const m = metrics;

    return (
        <div className="min-h-screen bg-app-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-app-text flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-app-accent-readable" />
                            Job Search Analytics
                        </h1>
                        <p className="text-app-muted mt-1">
                            Pipeline intelligence powered by your live application data
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            className="p-2 rounded-lg border border-app-border text-app-muted hover:text-app-accent-readable hover:border-app-accent-border transition-all disabled:opacity-50"
                            title="Refresh from API"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-app-muted-2" />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-1.5 bg-app-bg border border-app-border rounded-lg text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent"
                            >
                                <option value="all">All Time</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="60days">Last 60 Days</option>
                                <option value="90days">Last 90 Days</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={() => loadData(true)}
                            className="ml-auto text-xs text-app-accent-readable hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {m.total === 0 ? (
                    <div className="bg-app-card rounded-2xl border border-app-border p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-app-accent-muted rounded-full mb-4">
                            <Target className="w-10 h-10 text-app-accent-readable" />
                        </div>
                        <h3 className="text-2xl font-semibold text-app-text mb-2">No Data Yet</h3>
                        <p className="text-app-muted max-w-md mx-auto">
                            Add job applications to unlock advanced pipeline analytics.
                        </p>
                        <button
                            onClick={() => router.push('/jobs?action=add')}
                            className="mt-6 px-6 py-3 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-app-accent/20"
                        >
                            <Briefcase className="w-4 h-4" />
                            Add Your First Application
                        </button>
                    </div>
                ) : (
                    <>
                        {/* KPI row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <Kpi icon={Briefcase} label="Total Apps" value={m.total} sub="Tracked applications" color="text-app-accent-readable" />
                            <Kpi icon={UserCheck} label="Interviews" value={m.interviews} sub={`${m.interviewRate}% rate`} color="text-indigo-400" />
                            <Kpi icon={Award} label="Offers" value={m.hired} sub={`${m.offerRate}% rate`} color="text-green-400" />
                            <Kpi icon={Rocket} label="Active" value={m.active} sub={`${m.rejected} rejected`} color="text-app-accent-readable" />
                        </div>

                        {/* Timing + rates */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <Rate label="Interview Rate" value={`${m.interviewRate}%`} hint="Apps → Interview" good={+m.interviewRate >= 20} />
                            <Rate label="Offer Rate" value={`${m.offerRate}%`} hint="Apps → Hired" good={+m.offerRate >= 10} />
                            <Rate
                                label="Avg days → Interview"
                                value={m.avgDaysToInterview != null ? `${m.avgDaysToInterview}d` : '—'}
                                hint={m.sampleInterview ? `${m.sampleInterview} samples` : 'Need status dates'}
                                good
                            />
                            <Rate
                                label="Avg days → Offer"
                                value={m.avgDaysToOffer != null ? `${m.avgDaysToOffer}d` : '—'}
                                hint={m.sampleOffer ? `${m.sampleOffer} samples` : 'Need status dates'}
                                good
                            />
                        </div>

                        {/* Conversion ladder + Funnel */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <Card title="Stage Conversion" icon={GitBranch} subtitle="Drop-off between consecutive stages">
                                <div className="space-y-3">
                                    {conversionLadder.map((step, i) => (
                                        <div key={step.key} className="flex items-center gap-3">
                                            <div className="w-24 sm:w-28 text-xs text-app-muted shrink-0 text-right">
                                                {step.label}
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-7 bg-app-bg rounded-md overflow-hidden relative">
                                                    <div
                                                        className="h-full rounded-md transition-all duration-700"
                                                        style={{
                                                            width: `${Math.max(
                                                                metrics.total > 0
                                                                    ? (step.count / metrics.total) * 100
                                                                    : 0,
                                                                step.count > 0 ? 4 : 0
                                                            )}%`,
                                                            backgroundColor: step.color,
                                                        }}
                                                    />
                                                    <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-medium text-app-text/90 tabular-nums">
                                                        {step.count}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-14 text-right shrink-0">
                                                {i === 0 ? (
                                                    <span className="text-[11px] text-gray-600">base</span>
                                                ) : (
                                                    <span
                                                        className={`text-[11px] font-medium tabular-nums ${step.fromPrev >= 50
                                                                ? 'text-green-400'
                                                                : step.fromPrev >= 25
                                                                    ? 'text-yellow-400'
                                                                    : 'text-red-400'
                                                            }`}
                                                    >
                                                        {step.fromPrev}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-gray-600 mt-4">
                                    % = conversion from previous stage · bars scaled to total apps
                                </p>
                            </Card>

                            <Card title="Pipeline Funnel" icon={TrendingUp} subtitle="Jobs that ever reached each stage">
                                <div className="space-y-3.5">
                                    {funnelData.map((item) => (
                                        <div key={item.name}>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="text-app-muted">{item.name}</span>
                                                <span className="text-app-muted tabular-nums">
                                                    {item.count}
                                                    <span className="text-gray-600 ml-1.5">({item.pct}%)</span>
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-app-bg rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${Math.max(item.pct, item.count > 0 ? 3 : 0)}%`,
                                                        backgroundColor: item.fill,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Pie + Radar + Outcomes */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <Card title="Current Status" icon={PieChartIcon} subtitle="Where apps stand now">
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusDistribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                paddingAngle={2}
                                            >
                                                {statusDistribution.map((e) => (
                                                    <Cell key={e.key} fill={e.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Legend
                                                wrapperStyle={{ fontSize: 11 }}
                                                formatter={(v) => <span className="text-app-muted">{v}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card title="Pipeline Radar" icon={Activity} subtitle="Coverage across stages">
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="#00684A60" />
                                            <PolarAngleAxis
                                                dataKey="stage"
                                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                            />
                                            <PolarRadiusAxis
                                                tick={{ fill: '#6B7280', fontSize: 10 }}
                                                axisLine={false}
                                            />
                                            <Radar
                                                name="Count"
                                                dataKey="value"
                                                stroke="#00ED64"
                                                fill="#00ED64"
                                                fillOpacity={0.25}
                                                strokeWidth={2}
                                            />
                                            <Tooltip contentStyle={tooltipStyle} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card title="Outcomes" icon={Layers} subtitle="Final disposition">
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={outcomes}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                paddingAngle={2}
                                            >
                                                {outcomes.map((e) => (
                                                    <Cell key={e.name} fill={e.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Legend
                                                wrapperStyle={{ fontSize: 11 }}
                                                formatter={(v) => <span className="text-app-muted">{v}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* 6-month composed chart */}
                        <Card
                            title="6-Month Trend"
                            icon={BarChart3}
                            subtitle="Applications, interviews, offers & rejections"
                            className="mb-8"
                        >
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#00684A40" />
                                        <XAxis dataKey="label" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} allowDecimals={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="applications" name="Applications" fill="#00ED64" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="interviews" name="Interviews" fill="#6366F1" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="offers" name="Offers" fill="#22C55E" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
                                        <Line
                                            type="monotone"
                                            dataKey="rejected"
                                            name="Rejected"
                                            stroke="#EF4444"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#EF4444' }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Weekly activity heatmap */}
                        <Card
                            title="Weekly Activity"
                            icon={Calendar}
                            subtitle="Applications submitted per week (last 12 weeks)"
                            className="mb-8"
                        >
                            <div className="flex items-end gap-1.5 sm:gap-2 h-28">
                                {weeklyHeatmap.map((w) => {
                                    const intensity = w.count / heatMax;
                                    const h = Math.max(8, Math.round(intensity * 100));
                                    return (
                                        <div key={w.key} className="flex-1 flex flex-col items-center gap-1.5 group">
                                            <span className="text-[10px] text-app-muted-2 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                                                {w.count}
                                            </span>
                                            <div
                                                className="w-full rounded-t-md transition-all duration-300 hover:brightness-125"
                                                style={{
                                                    height: `${h}%`,
                                                    backgroundColor:
                                                        w.count === 0
                                                            ? '#002433'
                                                            : `rgba(0, 237, 100, ${0.2 + intensity * 0.8})`,
                                                    border: w.count === 0 ? '1px solid #00684A30' : 'none',
                                                }}
                                                title={`${w.label}: ${w.count}`}
                                            />
                                            <span className="text-[9px] sm:text-[10px] text-gray-600 truncate max-w-full">
                                                {w.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Top companies */}
                        {topCompanies.length > 0 && (
                            <Card title="Top Companies" icon={Briefcase} subtitle="Where you applied most">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-app-muted-2 border-b border-app-border">
                                                <th className="pb-3 font-medium">Company</th>
                                                <th className="pb-3 font-medium text-right">Apps</th>
                                                <th className="pb-3 font-medium text-right">Interviews</th>
                                                <th className="pb-3 font-medium text-right">Offers</th>
                                                <th className="pb-3 font-medium text-right hidden sm:table-cell">
                                                    Conv.
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topCompanies.map((c) => (
                                                <tr
                                                    key={c.name}
                                                    className="border-b border-app-border last:border-0 hover:bg-app-bg/50 transition-colors"
                                                >
                                                    <td className="py-3 text-app-text font-medium">{c.name}</td>
                                                    <td className="py-3 text-right text-app-muted tabular-nums">
                                                        {c.total}
                                                    </td>
                                                    <td className="py-3 text-right text-indigo-400 tabular-nums">
                                                        {c.interview}
                                                    </td>
                                                    <td className="py-3 text-right text-green-400 tabular-nums">
                                                        {c.hired}
                                                    </td>
                                                    <td className="py-3 text-right text-app-muted-2 tabular-nums hidden sm:table-cell">
                                                        {c.total > 0
                                                            ? `${Math.round((c.interview / c.total) * 100)}%`
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Kpi({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="bg-app-card rounded-xl border border-app-border p-4 hover:border-app-accent-border transition-all">
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-app-muted-2">{label}</span>
            </div>
            <p className="text-2xl font-bold text-app-text mt-2 tabular-nums">{value}</p>
            {sub && <p className="text-xs text-app-muted mt-0.5">{sub}</p>}
        </div>
    );
}

function Rate({ label, value, hint, good }) {
    return (
        <div className="bg-app-card rounded-xl border border-app-border p-4">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${good ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-xs text-app-muted">{label}</span>
            </div>
            <p className="text-xl font-bold text-app-text mt-1 tabular-nums">{value}</p>
            <p className="text-xs text-app-muted-2">{hint}</p>
        </div>
    );
}

function Card({ title, icon: Icon, subtitle, children, className = '' }) {
    return (
        <div className={`bg-app-card rounded-xl border border-app-border p-6 ${className}`}>
            <h3 className="text-app-text font-semibold mb-0.5 flex items-center gap-2">
                <Icon className="w-5 h-5 text-app-accent-readable" />
                {title}
            </h3>
            {subtitle && <p className="text-xs text-app-muted-2 mb-4">{subtitle}</p>}
            {!subtitle && <div className="mb-4" />}
            {children}
        </div>
    );
}
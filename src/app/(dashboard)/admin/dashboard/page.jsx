// src/app/(dashboard)/admin/dashboard/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
    Users,
    MessageSquare,
    Shield,
    Loader2,
    Search,
    Trash2,
    RefreshCw,
    AlertCircle,
    UserCheck,
    UserCog,
    ExternalLink,
    Mail,
    Calendar,
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15, skip: 0 });
    const [qaTotal, setQaTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionId, setActionId] = useState(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
        if (user && user.role !== 'admin') router.push('/dashboard');
    }, [isLoading, isAuthenticated, user, router]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const limit = 15;
            const skip = (page - 1) * limit;
            const [usersRes, qaRes] = await Promise.all([
                api.getUsers({ limit, skip, search: search || undefined }),
                api.getInterviewQA({ limit: 1, page: 1 }),
            ]);

            if (usersRes?.success) {
                setUsers(usersRes.users || []);
                setPagination(
                    usersRes.pagination || {
                        total: usersRes.users?.length || 0,
                        pages: 1,
                        limit,
                        skip,
                    }
                );
            } else {
                setError(usersRes?.message || 'Failed to load users');
            }

            if (qaRes?.success) {
                setQaTotal(qaRes.total ?? 0);
            }
        } catch (e) {
            setError(e.message || 'Network error');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') load();
    }, [isAuthenticated, user?.role, load]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleRoleChange = async (id, role) => {
        if (id === user?.id || id === user?._id) {
            setError('You cannot change your own role here');
            return;
        }
        setActionId(id);
        setError('');
        try {
            const res = await api.updateUserRole(id, role);
            if (res.success) {
                setUsers((prev) =>
                    prev.map((u) =>
                        (u._id === id || u.id === id) ? { ...u, role } : u
                    )
                );
                setSuccess('Role updated');
                setTimeout(() => setSuccess(''), 2500);
            } else {
                setError(res.message || 'Failed to update role');
            }
        } catch (e) {
            setError(e.message || 'Failed to update role');
        } finally {
            setActionId(null);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (id === user?.id || id === user?._id) {
            setError('You cannot delete your own account from here');
            return;
        }
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        setActionId(id);
        setError('');
        try {
            const res = await api.deleteUser(id);
            if (res.success) {
                setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
                setPagination((p) => ({ ...p, total: Math.max(0, (p.total || 1) - 1) }));
                setSuccess('User deleted');
                setTimeout(() => setSuccess(''), 2500);
            } else {
                setError(res.message || 'Failed to delete user');
            }
        } catch (e) {
            setError(e.message || 'Failed to delete user');
        } finally {
            setActionId(null);
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        try {
            return new Date(d).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return '—';
        }
    };

    const adminCount = users.filter((u) => u.role === 'admin').length;
    const seekerCount = users.filter((u) => u.role !== 'admin').length;
    const totalUsers = pagination.total ?? users.length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-[#00ED64] animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                            <Shield className="w-7 h-7 text-[#00ED64]" />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm">
                            Welcome, {user?.name?.split(' ')[0]} · Manage users & community content
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => load()}
                            disabled={loading}
                            className="p-2 rounded-lg border border-[#00684A]/30 text-gray-400 hover:text-[#00ED64] hover:border-[#00ED64]/40 transition-all disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <Link
                            href="/interview-qa"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg text-sm transition-all"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Moderate Q&A
                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto text-xs underline">
                            dismiss
                        </button>
                    </div>
                )}
                {success && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/25 text-[#00ED64] text-sm">
                        {success}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={Users}
                        label="Total users"
                        value={totalUsers}
                        sub="Registered accounts"
                        color="text-[#00ED64]"
                    />
                    <StatCard
                        icon={UserCheck}
                        label="Job seekers"
                        value={seekerCount}
                        sub="On this page"
                        color="text-blue-400"
                    />
                    <StatCard
                        icon={UserCog}
                        label="Admins"
                        value={adminCount}
                        sub="On this page"
                        color="text-yellow-400"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Interview Q&A"
                        value={qaTotal}
                        sub="Community posts"
                        color="text-indigo-400"
                        href="/interview-qa"
                    />
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <Link
                        href="/interview-qa"
                        className="bg-[#002433] border border-[#00684A]/25 hover:border-[#00ED64]/40 rounded-xl p-5 transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-[#00ED64]/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-[#00ED64]" />
                            </div>
                            <h3 className="text-white font-semibold group-hover:text-[#00ED64] transition-colors">
                                Interview Q&A moderation
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Review community questions and delete inappropriate posts. Admins can remove any entry.
                        </p>
                    </Link>
                    <div className="bg-[#002433] border border-[#00684A]/25 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-white font-semibold">User management</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Search users, change roles (job seeker / admin), or remove accounts below.
                        </p>
                    </div>
                </div>

                {/* Users table */}
                <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-[#00684A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#00ED64]" />
                            Users
                            <span className="text-gray-500 font-normal text-sm">({totalUsers})</span>
                        </h3>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search name or email..."
                                    className="pl-9 pr-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-[#00ED64]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-3 py-2 text-sm border border-[#00684A]/30 rounded-lg text-gray-300 hover:text-[#00ED64] hover:border-[#00ED64]/40"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 text-[#00ED64] animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-12">No users found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-[#00684A]/15">
                                        <th className="px-4 sm:px-5 py-3 font-medium">User</th>
                                        <th className="px-4 py-3 font-medium hidden md:table-cell">Joined</th>
                                        <th className="px-4 py-3 font-medium">Role</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => {
                                        const id = u._id || u.id;
                                        const isSelf =
                                            id === user?._id ||
                                            id === user?.id ||
                                            u.email === user?.email;
                                        return (
                                            <tr
                                                key={id}
                                                className={`border-b border-[#00684A]/10 last:border-0 ${i % 2 === 0 ? 'bg-[#002433]' : 'bg-[#001E2B]/40'
                                                    }`}
                                            >
                                                <td className="px-4 sm:px-5 py-3">
                                                    <div className="min-w-0">
                                                        <p className="text-white font-medium truncate">
                                                            {u.name}
                                                            {isSelf && (
                                                                <span className="ml-2 text-[10px] text-[#00ED64] font-normal">
                                                                    you
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-gray-500 text-xs flex items-center gap-1 truncate">
                                                            <Mail className="w-3 h-3 shrink-0" />
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                                                    <span className="inline-flex items-center gap-1 text-xs">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(u.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={u.role || 'jobSeeker'}
                                                        disabled={isSelf || actionId === id}
                                                        onChange={(e) =>
                                                            handleRoleChange(id, e.target.value)
                                                        }
                                                        className="px-2 py-1.5 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#00ED64] disabled:opacity-50"
                                                    >
                                                        <option value="jobSeeker">Job seeker</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        disabled={isSelf || actionId === id}
                                                        onClick={() => handleDeleteUser(id, u.name)}
                                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={
                                                            isSelf
                                                                ? 'Cannot delete yourself'
                                                                : 'Delete user'
                                                        }
                                                    >
                                                        {actionId === id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {(pagination.pages > 1 || totalUsers > (pagination.limit || 15)) && (
                        <div className="flex justify-center items-center gap-3 p-4 border-t border-[#00684A]/15">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-[#00684A]/30 text-gray-300 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {page}
                                {pagination.pages ? ` / ${pagination.pages}` : ''}
                            </span>
                            <button
                                disabled={
                                    pagination.pages
                                        ? page >= pagination.pages
                                        : users.length < (pagination.limit || 15)
                                }
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-[#00684A]/30 text-gray-300 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, color, href }) {
    const inner = (
        <>
            <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </>
    );

    const cls =
        'bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00ED64]/30 transition-all block';

    if (href) {
        return (
            <Link href={href} className={cls}>
                {inner}
            </Link>
        );
    }
    return <div className={cls}>{inner}</div>;
}
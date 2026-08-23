// src/app/job-board/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import JobModal from '@/components/jobs/JobModal';
import {
    Briefcase,
    Plus,
    Search,
    Loader2,
    Trash2,
    MapPin,
    Building2,
    ExternalLink,
    Calendar,
    User,
    AlertCircle,
    BookmarkPlus,
    BookmarkCheck,
    Pencil,
} from 'lucide-react';

export default function JobBoardPage() {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === 'admin';
    const userId = user?._id || user?.id;

    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [trackingId, setTrackingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [expanded, setExpanded] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.getPublicJobs({
                q: search,
                page,
                limit: 12,
            });
            if (res.success) {
                setItems(res.items || []);
                setTotal(res.total || 0);
                setPages(res.pages || 1);
            } else {
                setError(res.message || 'Failed to load job posts');
            }
        } catch (e) {
            setError(e.message || 'Network error');
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        load();
    }, [load]);

    const canEdit = (item) => {
        if (!isAuthenticated || !item) return false;
        if (isAdmin) return true;
        return item.postedBy && userId && String(item.postedBy) === String(userId);
    };

    const formatDate = (d) => {
        if (!d) return '';
        try {
            return new Date(d).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return '';
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleAddSubmit = async (data) => {
        try {
            const payload = {
                title: data.title,
                company: data.company,
                location: data.location,
                salaryRange: data.salaryRange,
                skills: data.skills,
                deadline: data.deadline || null,
                jobLink: data.jobLink,
                jobDescription: data.jobDescription,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                source: data.source || 'Community Board',
            };
            const res = await api.createPublicJob(payload);
            if (res.success) {
                setSuccess('Job posted successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setPage(1);
                setSearch('');
                setSearchInput('');
                await load();
                return { success: true };
            }
            setError(res.message || 'Failed to post');
            setTimeout(() => setError(''), 3000);
            return { success: false };
        } catch (err) {
            setError(err.message || 'Network error');
            setTimeout(() => setError(''), 3000);
            return { success: false };
        }
    };

    const handleEditSubmit = async (data) => {
        if (!editItem) return { success: false };
        try {
            const payload = {
                title: data.title,
                company: data.company,
                location: data.location,
                salaryRange: data.salaryRange,
                skills: data.skills,
                deadline: data.deadline || null,
                jobLink: data.jobLink,
                jobDescription: data.jobDescription,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                source: data.source || 'Community Board',
            };
            const res = await api.updatePublicJob(editItem._id, payload);
            if (res.success) {
                setItems((prev) =>
                    prev.map((i) =>
                        i._id === editItem._id ? { ...i, ...res.job } : i
                    )
                );
                setSuccess('Updated successfully');
                setTimeout(() => setSuccess(''), 2500);
                setEditItem(null);
                return { success: true };
            }
            setError(res.message || 'Update failed');
            setTimeout(() => setError(''), 3000);
            return { success: false };
        } catch (err) {
            setError(err.message || 'Network error');
            setTimeout(() => setError(''), 3000);
            return { success: false };
        }
    };

    const openEdit = (item) => {
        setEditItem(item);
        setShowEditModal(true);
    };

    const handleTrack = async (item) => {
        if (!isAuthenticated) {
            setError('Please log in to add jobs to your tracking list');
            return;
        }
        if (item.alreadyTracked) return;
        setTrackingId(item._id);
        setError('');
        try {
            const res = await api.trackPublicJob(item._id, 'no_action');
            if (res.success) {
                setItems((prev) =>
                    prev.map((i) =>
                        i._id === item._id ? { ...i, alreadyTracked: true } : i
                    )
                );
                setSuccess('Added to your tracking list! Manage status from Applications.');
                setTimeout(() => setSuccess(''), 3500);
            } else {
                setError(res.message || 'Failed to add to tracking list');
            }
        } catch (err) {
            setError(err.message || 'Failed to add to tracking list');
        } finally {
            setTrackingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this job post permanently?')) return;
        setDeletingId(id);
        try {
            const res = await api.deletePublicJob(id);
            if (res.success) {
                setItems((prev) => prev.filter((i) => i._id !== id));
                setTotal((t) => Math.max(0, t - 1));
                setSuccess('Deleted');
                setTimeout(() => setSuccess(''), 2000);
            } else {
                setError(res.message || 'Delete failed');
            }
        } catch (err) {
            setError(err.message || 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-app-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-app-text flex items-center gap-3 tracking-tight">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-app-accent-muted border border-app-accent-border">
                                <Briefcase className="w-5 h-5 text-app-accent-readable" />
                            </span>
                            Job Board
                        </h1>
                        <p className="text-app-muted mt-2 text-sm max-w-xl">
                            Community job posts from registered users. Add any role to your tracking list
                            and update status (Applied, Interview, etc.) from Applications.
                        </p>
                    </div>
                    {isAuthenticated ? (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-xl text-sm transition-all shadow-lg shadow-app-accent/20"
                        >
                            <Plus className="w-4 h-4" />
                            Post a job
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-app-border text-app-accent-readable hover:bg-app-accent-muted font-medium rounded-xl text-sm transition-all"
                        >
                            Log in to post
                        </Link>
                    )}
                </div>

                {success && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-app-accent-muted border border-app-accent-border text-app-accent-readable text-sm">
                        {success}
                        {success.includes('tracking') && (
                            <>
                                {' '}
                                <Link href="/applications" className="underline font-medium">
                                    Open Applications
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search title, company, skills..."
                            className="w-full pl-10 pr-3 py-2.5 bg-app-card border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-app-card border border-app-border rounded-xl text-app-muted hover:text-app-accent-readable text-sm font-medium"
                    >
                        Search
                    </button>
                </form>

                {error && (
                    <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-app-accent-readable animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-app-card border border-app-border rounded-2xl p-12 text-center">
                        <Briefcase className="w-10 h-10 text-app-accent-readable/70 mx-auto mb-3" />
                        <p className="text-app-muted font-medium">No job posts yet.</p>
                        <p className="text-app-muted-2 text-sm mt-1">Be the first to share an opening.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-app-muted-2 mb-3 font-medium uppercase tracking-wide">
                            {total} post{total !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item) => {
                                const open = expanded[item._id];
                                return (
                                    <article
                                        key={item._id}
                                        className="bg-app-card border border-app-border rounded-2xl p-5 flex flex-col hover:border-app-accent-border transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="min-w-0">
                                                <h3 className="text-app-text font-semibold text-base leading-snug truncate">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-app-muted flex items-center gap-1.5 mt-1">
                                                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                                                    {item.company}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-0.5 shrink-0">
                                                {canEdit(item) && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(item)}
                                                            className="p-1.5 text-app-muted-2 hover:text-app-accent-readable rounded-lg"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item._id)}
                                                            disabled={deletingId === item._id}
                                                            className="p-1.5 text-app-muted-2 hover:text-red-400 rounded-lg disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deletingId === item._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-app-muted-2 mb-3">
                                            {item.location && item.location !== 'not_specified' && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {item.location}
                                                </span>
                                            )}
                                            {item.deadline && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Due {formatDate(item.deadline)}
                                                </span>
                                            )}
                                            {item.salaryRange && (
                                                <span className="text-app-accent-readable font-medium">
                                                    {item.salaryRange}
                                                </span>
                                            )}
                                        </div>

                                        {Array.isArray(item.skills) && item.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {item.skills.slice(0, 6).map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2 py-0.5 rounded-full text-[11px] bg-app-accent-muted text-app-accent-readable border border-app-accent-border"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-xs text-app-muted flex items-center gap-1.5 mb-3">
                                            <User className="w-3 h-3" />
                                            Posted by{' '}
                                            <span className="text-app-text font-medium">
                                                {item.postedByName || 'Anonymous'}
                                            </span>
                                            <span className="text-app-muted-2">
                                                · {formatDate(item.createdAt)}
                                            </span>
                                        </p>

                                        {item.jobDescription && (
                                            <div className="mb-3">
                                                <p
                                                    className={`text-sm text-app-muted whitespace-pre-wrap ${
                                                        open ? '' : 'line-clamp-3'
                                                    }`}
                                                >
                                                    {item.jobDescription}
                                                </p>
                                                {item.jobDescription.length > 160 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpanded((e) => ({
                                                                ...e,
                                                                [item._id]: !open,
                                                            }))
                                                        }
                                                        className="text-xs text-app-accent-readable mt-1 hover:underline"
                                                    >
                                                        {open ? 'Show less' : 'Read more'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 border-t border-app-border">
                                            {item.jobLink && (
                                                <a
                                                    href={item.jobLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-app-muted hover:text-app-accent-readable border border-app-border rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Open listing
                                                </a>
                                            )}
                                            {isAuthenticated ? (
                                                item.alreadyTracked ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-app-accent-readable bg-app-accent-muted border border-app-accent-border rounded-lg">
                                                        <BookmarkCheck className="w-3.5 h-3.5" />
                                                        In tracking list
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTrack(item)}
                                                        disabled={trackingId === item._id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-app-accent-text bg-app-accent hover:bg-app-accent-hover rounded-lg disabled:opacity-50 transition-all"
                                                    >
                                                        {trackingId === item._id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <BookmarkPlus className="w-3.5 h-3.5" />
                                                        )}
                                                        Add to tracking list
                                                    </button>
                                                )
                                            ) : (
                                                <Link
                                                    href="/login"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-app-accent-readable border border-app-accent-border rounded-lg hover:bg-app-accent-muted"
                                                >
                                                    Log in to track
                                                </Link>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}

                {pages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-10">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-4 py-2 text-sm font-medium rounded-xl border border-app-border text-app-muted hover:text-app-accent-readable disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-app-muted-2 font-medium tabular-nums">
                            {page} / {pages}
                        </span>
                        <button
                            disabled={page >= pages}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 text-sm font-medium rounded-xl border border-app-border text-app-muted hover:text-app-accent-readable disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Same JobModal as tracking — public variant */}
            <JobModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddSubmit}
                mode="add"
                variant="public"
            />

            {editItem && (
                <JobModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditItem(null);
                    }}
                    onSubmit={handleEditSubmit}
                    mode="edit"
                    initialData={editItem}
                    variant="public"
                />
            )}
        </div>
    );
}

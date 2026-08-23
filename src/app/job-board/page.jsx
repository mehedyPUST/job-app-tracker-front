// src/app/job-board/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
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
    X,
    Filter,
} from 'lucide-react';

const emptyForm = {
    title: '',
    company: '',
    location: '',
    salaryRange: '',
    skills: '',
    deadline: '',
    jobLink: '',
    jobDescription: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    source: '',
};

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
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [trackingId, setTrackingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [expanded, setExpanded] = useState({});

    // Edit
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState(emptyForm);
    const [editError, setEditError] = useState('');
    const [editSaving, setEditSaving] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!isAuthenticated) {
            setFormError('Please log in to post a job');
            return;
        }
        if (!form.title.trim() || !form.company.trim()) {
            setFormError('Title and company are required');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                skills: form.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
            };
            const res = await api.createPublicJob(payload);
            if (res.success) {
                setForm(emptyForm);
                setShowForm(false);
                setSuccess('Job posted successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setPage(1);
                setSearch('');
                setSearchInput('');
                await load();
            } else {
                setFormError(res.message || 'Failed to post');
            }
        } catch (err) {
            setFormError(err.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
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

    const openEdit = (item) => {
        setEditItem(item);
        setEditForm({
            title: item.title || '',
            company: item.company || '',
            location: item.location === 'not_specified' ? '' : item.location || '',
            salaryRange: item.salaryRange || '',
            skills: Array.isArray(item.skills) ? item.skills.join(', ') : '',
            deadline: item.deadline
                ? new Date(item.deadline).toISOString().slice(0, 10)
                : '',
            jobLink: item.jobLink || '',
            jobDescription: item.jobDescription || '',
            contactName: item.contactName || '',
            contactEmail: item.contactEmail || '',
            contactPhone: item.contactPhone || '',
            source: item.source || '',
        });
        setEditError('');
    };

    const closeEdit = () => {
        setEditItem(null);
        setEditForm(emptyForm);
        setEditError('');
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editItem) return;
        if (!editForm.title.trim() || !editForm.company.trim()) {
            setEditError('Title and company are required');
            return;
        }
        setEditSaving(true);
        try {
            const payload = {
                ...editForm,
                skills: editForm.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
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
                closeEdit();
            } else {
                setEditError(res.message || 'Update failed');
            }
        } catch (err) {
            setEditError(err.message || 'Network error');
        } finally {
            setEditSaving(false);
        }
    };

    const formFields = (values, setValues) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
                <label className="block text-xs text-app-muted mb-1.5">Job title *</label>
                <input
                    type="text"
                    value={values.title}
                    onChange={(e) => setValues((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                    required
                    placeholder="e.g. Frontend Developer"
                />
            </div>
            <div>
                <label className="block text-xs text-app-muted mb-1.5">Company *</label>
                <input
                    type="text"
                    value={values.company}
                    onChange={(e) => setValues((f) => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                    required
                    placeholder="Company name"
                />
            </div>
            <div>
                <label className="block text-xs text-app-muted mb-1.5">Location</label>
                <input
                    type="text"
                    value={values.location}
                    onChange={(e) => setValues((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                    placeholder="Remote / City"
                />
            </div>
            <div>
                <label className="block text-xs text-app-muted mb-1.5">Salary range</label>
                <input
                    type="text"
                    value={values.salaryRange}
                    onChange={(e) => setValues((f) => ({ ...f, salaryRange: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                    placeholder="e.g. $80k – $100k"
                />
            </div>
            <div>
                <label className="block text-xs text-app-muted mb-1.5">Deadline</label>
                <input
                    type="date"
                    value={values.deadline}
                    onChange={(e) => setValues((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs text-app-muted mb-1.5">Skills (comma separated)</label>
                <input
                    type="text"
                    value={values.skills}
                    onChange={(e) => setValues((f) => ({ ...f, skills: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                    placeholder="React, Node.js, MongoDB"
                />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs text-app-muted mb-1.5">Job link</label>
                <input
                    type="url"
                    value={values.jobLink}
                    onChange={(e) => setValues((f) => ({ ...f, jobLink: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                    placeholder="https://..."
                />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs text-app-muted mb-1.5">Description</label>
                <textarea
                    value={values.jobDescription}
                    onChange={(e) => setValues((f) => ({ ...f, jobDescription: e.target.value }))}
                    rows={5}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20 resize-y"
                    placeholder="Role overview, requirements..."
                />
            </div>
            <div>
                <label className="block text-xs text-app-muted mb-1.5">Contact name</label>
                <input
                    type="text"
                    value={values.contactName}
                    onChange={(e) => setValues((f) => ({ ...f, contactName: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                />
            </div>
            <div>
                <label className="block text-xs text-app-muted mb-1.5">Contact email</label>
                <input
                    type="email"
                    value={values.contactEmail}
                    onChange={(e) => setValues((f) => ({ ...f, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                />
            </div>
        </div>
    );

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
                            onClick={() => setShowForm((v) => !v)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-xl text-sm transition-all shadow-lg shadow-app-accent/20"
                        >
                            <Plus className="w-4 h-4" />
                            {showForm ? 'Close form' : 'Post a job'}
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

                {/* Create form */}
                {showForm && isAuthenticated && (
                    <form
                        onSubmit={handleSubmit}
                        className="mb-8 bg-app-card border border-app-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
                    >
                        <h2 className="text-app-text font-semibold text-base">Share a job opening</h2>
                        {formError && (
                            <p className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {formError}
                            </p>
                        )}
                        {formFields(form, setForm)}
                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm text-app-muted hover:text-app-text rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-xl text-sm disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Post job
                            </button>
                        </div>
                    </form>
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

            {/* Edit modal */}
            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div
                        className="bg-app-card border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-app-border bg-app-card z-10">
                            <h2 className="text-app-text font-semibold flex items-center gap-2">
                                <Pencil className="w-4 h-4 text-app-accent-readable" />
                                Edit job post
                            </h2>
                            <button
                                type="button"
                                onClick={closeEdit}
                                className="p-1.5 text-app-muted hover:text-app-text rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSave} className="p-5 sm:p-6 space-y-4">
                            {editError && (
                                <p className="text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {editError}
                                </p>
                            )}
                            {formFields(editForm, setEditForm)}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="px-4 py-2 text-sm text-app-muted hover:text-app-text rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    className="px-5 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-xl text-sm disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

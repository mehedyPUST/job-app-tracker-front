// src/app/interview-qa/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
    MessageSquare,
    Plus,
    Search,
    Loader2,
    Trash2,
    ChevronDown,
    ChevronUp,
    Filter,
    AlertCircle,
    User,
    Calendar,
    X,
    HelpCircle,
} from 'lucide-react';

const FALLBACK_TOPICS = [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Express',
    'MongoDB',
    'SQL',
    'PostgreSQL',
    'HTML',
    'CSS',
    'Tailwind CSS',
    'Redux',
    'REST API',
    'GraphQL',
    'Git',
    'Docker',
    'AWS',
    'System Design',
    'Data Structures',
    'Algorithms',
    'OOP',
    'Behavioral',
    'HR',
    'Soft Skills',
    'Networking',
    'Security',
    'Testing',
    'Python',
    'Java',
    'Other',
];

export default function InterviewQAPage() {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [items, setItems] = useState([]);
    const [topics, setTopics] = useState(FALLBACK_TOPICS);
    const [topic, setTopic] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({ question: '', answer: '', topic: 'JavaScript', customTopic: '' });
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.getInterviewQA({
                topic: topic === 'all' ? '' : topic,
                q: search,
                page,
                limit: 15,
            });
            if (res.success) {
                setItems(res.items || []);
                setTotal(res.total || 0);
                setPages(res.pages || 1);
                if (res.topics?.length) setTopics(res.topics);
            } else {
                setError(res.message || 'Failed to load');
            }
        } catch (e) {
            setError(e.message || 'Network error');
        } finally {
            setLoading(false);
        }
    }, [topic, search, page]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!isAuthenticated) {
            setFormError('Please log in to post a question');
            return;
        }
        if (!form.question.trim() || !form.answer.trim()) {
            setFormError('Question and answer are required');
            return;
        }
        if (form.topic === 'Other' && !form.customTopic.trim()) {
            setFormError('Please enter a custom topic');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                question: form.question,
                answer: form.answer,
                topic: form.topic,
                customTopic: form.topic === 'Other' ? form.customTopic : undefined,
            };
            const res = await api.createInterviewQA(payload);
            if (res.success) {
                setForm({ question: '', answer: '', topic: 'JavaScript', customTopic: '' });
                setShowForm(false);
                setSuccess('Posted successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setPage(1);
                setTopic('all');
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

    const handleDelete = async (id) => {
        if (!isAdmin) return;
        if (!confirm('Delete this post permanently?')) return;
        setDeletingId(id);
        try {
            const res = await api.deleteInterviewQA(id);
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

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                            <MessageSquare className="w-7 h-7 text-[#00ED64]" />
                            Interview Q&amp;A
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm">
                            Community interview questions &amp; answers · Browse freely · Post when logged in
                        </p>
                    </div>
                    {isAuthenticated ? (
                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg text-sm transition-all shadow-lg shadow-[#00ED64]/15"
                        >
                            <Plus className="w-4 h-4" />
                            {showForm ? 'Close form' : 'Post Q&A'}
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#00684A]/40 text-[#00ED64] hover:bg-[#00ED64]/10 font-medium rounded-lg text-sm transition-all"
                        >
                            Log in to post
                        </Link>
                    )}
                </div>

                {success && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/25 text-[#00ED64] text-sm">
                        {success}
                    </div>
                )}

                {/* Post form */}
                {showForm && isAuthenticated && (
                    <form
                        onSubmit={handleSubmit}
                        className="mb-8 bg-[#002433] border border-[#00684A]/30 rounded-xl p-5 space-y-4"
                    >
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-[#00ED64]" />
                            Share an interview question
                        </h2>
                        {formError && (
                            <p className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {formError}
                            </p>
                        )}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Topic</label>
                            <select
                                value={form.topic}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        topic: e.target.value,
                                        customTopic: e.target.value === 'Other' ? f.customTopic : '',
                                    }))
                                }
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/40 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64]"
                            >
                                {topics.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {form.topic === 'Other' && (
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">
                                    Custom topic
                                </label>
                                <input
                                    type="text"
                                    value={form.customTopic}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, customTopic: e.target.value }))
                                    }
                                    maxLength={40}
                                    placeholder="e.g. Redis, Kafka, Vue.js..."
                                    className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/40 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64]"
                                    required
                                />
                                <p className="text-[11px] text-gray-600 mt-1">
                                    This topic will be saved and available in filters.
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Question</label>
                            <textarea
                                value={form.question}
                                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                                rows={3}
                                placeholder="What was asked in the interview?"
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/40 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64] resize-y"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Answer</label>
                            <textarea
                                value={form.answer}
                                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                                rows={5}
                                placeholder="How would you answer it? Share your approach..."
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/40 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64] resize-y"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg text-sm disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Post
                            </button>
                        </div>
                    </form>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search questions..."
                                className="w-full pl-10 pr-3 py-2.5 bg-[#002433] border border-[#00684A]/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-[#002433] border border-[#00684A]/30 rounded-lg text-gray-300 hover:text-[#00ED64] hover:border-[#00ED64]/40 text-sm transition-all"
                        >
                            Search
                        </button>
                    </form>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                        <select
                            value={topic}
                            onChange={(e) => {
                                setTopic(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2.5 bg-[#002433] border border-[#00684A]/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64]"
                        >
                            <option value="all">All topics</option>
                            {topics.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Topic chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => {
                            setTopic('all');
                            setPage(1);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${topic === 'all'
                                ? 'bg-[#00ED64]/15 text-[#00ED64] border-[#00ED64]/40'
                                : 'bg-[#002433] text-gray-400 border-[#00684A]/25 hover:border-[#00ED64]/30'
                            }`}
                    >
                        All
                    </button>
                    {topics.map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                setTopic(t);
                                setPage(1);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${topic === t
                                    ? 'bg-[#00ED64]/15 text-[#00ED64] border-[#00ED64]/40'
                                    : 'bg-[#002433] text-gray-400 border-[#00684A]/25 hover:border-[#00ED64]/30'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-[#00ED64] animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-[#002433] border border-[#00684A]/25 rounded-xl p-12 text-center">
                        <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No questions yet for this filter.</p>
                        {isAuthenticated && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-[#00ED64] text-sm hover:underline"
                            >
                                Be the first to post
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 mb-2">
                            {total} question{total !== 1 ? 's' : ''}
                        </p>
                        {items.map((item, index) => {
                            const open = expanded[item._id];
                            return (
                                <article
                                    key={item._id}
                                    className={`rounded-xl border p-4 sm:p-5 transition-all ${index % 2 === 0
                                            ? 'bg-[#002433] border-[#00684A]/30 hover:border-[#00684A]/50'
                                            : 'bg-[#001a24] border-[#00ED64]/20 hover:border-[#00ED64]/35'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(item._id)}
                                            className="flex-1 text-left min-w-0"
                                        >
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/20">
                                                    {item.topic}
                                                </span>
                                                <span className="text-[11px] text-gray-600 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(item.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#00ED64]/15 text-[#00ED64]">
                                                    <User className="w-3 h-3" />
                                                </span>
                                                <span>
                                                    Posted by{' '}
                                                    <span className="text-white font-medium">
                                                        {item.authorName || 'Anonymous'}
                                                    </span>
                                                </span>
                                            </p>
                                            <h3 className="text-white font-medium text-sm sm:text-base leading-snug">
                                                {item.question}
                                            </h3>
                                        </button>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={deletingId === item._id}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                                    title="Admin: delete"
                                                >
                                                    {deletingId === item._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(item._id)}
                                                className="p-1.5 text-gray-500 hover:text-[#00ED64] rounded-lg"
                                            >
                                                {open ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {open && (
                                        <div className="mt-3 pt-3 border-t border-[#00684A]/20">
                                            <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
                                                Answer
                                            </p>
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                {item.answer}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-8">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-[#00684A]/30 text-gray-300 disabled:opacity-40 hover:border-[#00ED64]/40"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            {page} / {pages}
                        </span>
                        <button
                            disabled={page >= pages}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-[#00684A]/30 text-gray-300 disabled:opacity-40 hover:border-[#00ED64]/40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
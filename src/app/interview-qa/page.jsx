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
    HelpCircle,
    Pencil,
    X,
    MessageCircle,
    Send,
} from 'lucide-react';

const FALLBACK_TOPICS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
    'MongoDB', 'SQL', 'PostgreSQL', 'HTML', 'CSS', 'Tailwind CSS', 'Redux',
    'REST API', 'GraphQL', 'Git', 'Docker', 'AWS', 'System Design',
    'Data Structures', 'Algorithms', 'OOP', 'Behavioral', 'HR', 'Soft Skills',
    'Networking', 'Security', 'Testing', 'Python', 'Java', 'Other',
];

/** Render answer text with ``` code fences as styled blocks */
function AnswerBody({ text }) {
    if (!text) return null;

    const parts = [];
    const regex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(
                <p key={key++} className="text-app-muted text-sm whitespace-pre-wrap leading-relaxed mb-3">
                    {text.slice(lastIndex, match.index)}
                </p>
            );
        }
        const lang = match[1] || 'code';
        const code = match[2].replace(/^\n/, '').replace(/\n$/, '');
        parts.push(
            <div
                key={key++}
                className="my-3 rounded-xl border border-app-border bg-app-code-bg overflow-hidden shadow-sm"
            >
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-app-border bg-app-card/80">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-app-accent-readable/90">
                        {lang || 'code'}
                    </span>
                </div>
                <pre className="p-3 sm:p-4 overflow-x-auto text-[12px] sm:text-[13px] leading-relaxed text-gray-200 font-mono">
                    <code>{code}</code>
                </pre>
            </div>
        );
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(
            <p key={key++} className="text-app-muted text-sm whitespace-pre-wrap leading-relaxed">
                {text.slice(lastIndex)}
            </p>
        );
    }

    if (parts.length === 0) {
        return (
            <p className="text-app-muted text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
        );
    }

    return <div className="space-y-1">{parts}</div>;
}

const emptyForm = { question: '', answer: '', topic: 'JavaScript', customTopic: '' };

export default function InterviewQAPage() {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === 'admin';
    const userId = user?._id || user?.id;

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
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit modal
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState(emptyForm);
    const [editError, setEditError] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    // Comments
    const [commentDrafts, setCommentDrafts] = useState({});
    const [commentPosting, setCommentPosting] = useState(null);
    const [commentDeleting, setCommentDeleting] = useState(null);

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

    const canEdit = (item) => {
        if (!isAuthenticated || !item) return false;
        if (isAdmin) return true;
        return item.authorId && userId && String(item.authorId) === String(userId);
    };

    const openEdit = (item) => {
        const isPreset = FALLBACK_TOPICS.includes(item.topic) && item.topic !== 'Other';
        const inList = topics.includes(item.topic);
        setEditItem(item);
        setEditForm({
            question: item.question || '',
            answer: item.answer || '',
            topic: isPreset || inList ? item.topic : 'Other',
            customTopic: isPreset || inList ? '' : item.topic || '',
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
        setEditError('');
        if (!editForm.question.trim() || !editForm.answer.trim()) {
            setEditError('Question and answer are required');
            return;
        }
        if (editForm.topic === 'Other' && !editForm.customTopic.trim()) {
            setEditError('Please enter a custom topic');
            return;
        }
        setEditSaving(true);
        try {
            const payload = {
                question: editForm.question,
                answer: editForm.answer,
                topic: editForm.topic,
                customTopic: editForm.topic === 'Other' ? editForm.customTopic : undefined,
            };
            const res = await api.updateInterviewQA(editItem._id, payload);
            if (res.success) {
                const updated = res.item;
                setItems((prev) =>
                    prev.map((i) => (i._id === editItem._id ? { ...i, ...updated } : i))
                );
                setSuccess('Updated successfully');
                setTimeout(() => setSuccess(''), 2500);
                closeEdit();
                if (updated?.topic && !topics.includes(updated.topic)) {
                    setTopics((t) => [...t.filter((x) => x !== 'Other'), updated.topic, 'Other']);
                }
            } else {
                setEditError(res.message || 'Update failed');
            }
        } catch (err) {
            setEditError(err.message || 'Network error');
        } finally {
            setEditSaving(false);
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
                setForm(emptyForm);
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


    const handleAddComment = async (postId) => {
        const text = (commentDrafts[postId] || '').trim();
        if (!text) return;
        if (!isAuthenticated) {
            setError('Please log in to comment');
            return;
        }
        setCommentPosting(postId);
        try {
            const res = await api.addInterviewComment(postId, text);
            if (res.success) {
                setItems((prev) =>
                    prev.map((i) =>
                        i._id === postId
                            ? {
                                ...i,
                                comments: res.item?.comments ?? [
                                    ...(i.comments || []),
                                    res.comment,
                                ],
                            }
                            : i
                    )
                );
                setCommentDrafts((d) => ({ ...d, [postId]: '' }));
            } else {
                setError(res.message || 'Failed to comment');
            }
        } catch (err) {
            setError(err.message || 'Failed to comment');
        } finally {
            setCommentPosting(null);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!isAdmin) return;
        if (!confirm('Delete this comment?')) return;
        setCommentDeleting(commentId);
        try {
            const res = await api.deleteInterviewComment(postId, commentId);
            if (res.success) {
                setItems((prev) =>
                    prev.map((i) =>
                        i._id === postId
                            ? {
                                ...i,
                                comments: (res.item?.comments ?? (i.comments || [])).filter(
                                    (c) => String(c._id) !== String(commentId)
                                ),
                            }
                            : i
                    )
                );
            } else {
                setError(res.message || 'Failed to delete comment');
            }
        } catch (err) {
            setError(err.message || 'Failed to delete comment');
        } finally {
            setCommentDeleting(null);
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

    const topicSelect = (value, onChange, customValue, onCustomChange) => (
        <>
            <div>
                <label className="block text-xs text-app-muted mb-1.5">Topic</label>
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                >
                    {topics.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>
            {value === 'Other' && (
                <div>
                    <label className="block text-xs text-app-muted mb-1.5">Custom topic</label>
                    <input
                        type="text"
                        value={customValue}
                        onChange={onCustomChange}
                        maxLength={40}
                        placeholder="e.g. Redis, Kafka, Vue.js..."
                        className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                        required
                    />
                </div>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-app-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-app-text flex items-center gap-3 tracking-tight">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-app-accent-muted border border-app-accent-border">
                                <MessageSquare className="w-5 h-5 text-app-accent-readable" />
                            </span>
                            Interview Q&amp;A
                        </h1>
                        <p className="text-app-muted mt-2 text-sm max-w-xl">
                            Community questions &amp; answers for technical interviews. Use{' '}
                            <code className="text-[11px] px-1.5 py-0.5 rounded bg-app-card border border-app-border text-app-accent-readable/90">
                                ```language
                            </code>{' '}
                            for code blocks.
                        </p>
                    </div>
                    {isAuthenticated ? (
                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-xl text-sm transition-all shadow-lg shadow-app-accent/20 hover:shadow-app-accent/20"
                        >
                            <Plus className="w-4 h-4" />
                            {showForm ? 'Close form' : 'Post Q&A'}
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
                    </div>
                )}

                {/* Create form */}
                {showForm && isAuthenticated && (
                    <form
                        onSubmit={handleSubmit}
                        className="mb-8 bg-app-card border border-app-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
                    >
                        <h2 className="text-app-text font-semibold flex items-center gap-2 text-base">
                            <HelpCircle className="w-4 h-4 text-app-accent-readable" />
                            Share an interview question
                        </h2>
                        <p className="text-xs text-app-muted-2">
                            Tip: wrap code in triple backticks, e.g. ```javascript ... ```
                        </p>
                        {formError && (
                            <p className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {formError}
                            </p>
                        )}
                        {topicSelect(
                            form.topic,
                            (e) =>
                                setForm((f) => ({
                                    ...f,
                                    topic: e.target.value,
                                    customTopic: e.target.value === 'Other' ? f.customTopic : '',
                                })),
                            form.customTopic,
                            (e) => setForm((f) => ({ ...f, customTopic: e.target.value }))
                        )}
                        <div>
                            <label className="block text-xs text-app-muted mb-1.5">Question</label>
                            <textarea
                                value={form.question}
                                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                                rows={3}
                                placeholder="What was asked in the interview?"
                                className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20 resize-y"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-app-muted mb-1.5">Answer</label>
                            <textarea
                                value={form.answer}
                                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                                rows={8}
                                placeholder={'Write your answer...\n\n```javascript\nfunction example() {}\n```'}
                                className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-app-accent/20 resize-y"
                                required
                            />
                        </div>
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
                                className="px-5 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-xl text-sm disabled:opacity-50 inline-flex items-center gap-2 transition-all"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Post
                            </button>
                        </div>
                    </form>
                )}

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-3 mb-5">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search questions..."
                                className="w-full pl-10 pr-3 py-2.5 bg-app-card border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20 focus:border-app-accent-border transition-shadow"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-app-card border border-app-border rounded-xl text-app-muted hover:text-app-accent-readable hover:border-app-accent-border text-sm font-medium transition-all"
                        >
                            Search
                        </button>
                    </form>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-app-muted-2 shrink-0" />
                        <select
                            value={topic}
                            onChange={(e) => {
                                setTopic(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2.5 bg-app-card border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20 min-w-[140px]"
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

                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => {
                            setTopic('all');
                            setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${topic === 'all'
                            ? 'bg-app-accent-muted text-app-accent-readable border-app-accent-border shadow-sm'
                            : 'bg-app-card text-app-muted border-app-border hover:border-app-accent-border hover:text-app-muted'
                            }`}
                    >
                        All
                    </button>
                    {topics
                        .filter((t) => t !== 'Other')
                        .map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    setTopic(t);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${topic === t
                                    ? 'bg-app-accent-muted text-app-accent-readable border-app-accent-border shadow-sm'
                                    : 'bg-app-card text-app-muted border-app-border hover:border-app-accent-border hover:text-app-muted'
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

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-app-accent-readable animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-app-card border border-app-border rounded-2xl p-12 sm:p-16 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-app-accent-muted border border-app-accent-border mb-4">
                            <MessageSquare className="w-7 h-7 text-app-accent-readable/80" />
                        </div>
                        <p className="text-app-muted font-medium">No questions yet for this filter.</p>
                        <p className="text-app-muted-2 text-sm mt-1">Try another topic or be the first to post.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-app-muted-2 mb-2 font-medium tracking-wide uppercase">
                            {total} question{total !== 1 ? 's' : ''}
                        </p>
                        {items.map((item, index) => {
                            const open = expanded[item._id];
                            return (
                                <article
                                    key={item._id}
                                    className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${index % 2 === 0
                                        ? 'bg-app-card border-app-border hover:border-app-border'
                                        : 'bg-app-card-alt border-app-accent-border hover:border-app-accent-border'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(item._id)}
                                            className="flex-1 text-left min-w-0"
                                        >
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-app-accent-muted text-app-accent-readable border border-app-accent-border">
                                                    {item.topic}
                                                </span>
                                                <span className="text-[11px] text-app-muted-2 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(item.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-app-muted flex items-center gap-1.5 mb-2">
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-app-accent-muted text-app-accent-readable">
                                                    <User className="w-3 h-3" />
                                                </span>
                                                <span>
                                                    Posted by{' '}
                                                    <span className="text-app-text font-medium">
                                                        {item.authorName || 'Anonymous'}
                                                    </span>
                                                </span>
                                            </p>
                                            <h3 className="text-app-text font-semibold text-sm sm:text-base leading-snug tracking-tight">
                                                {item.question}
                                            </h3>
                                        </button>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                            {canEdit(item) && (
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(item)}
                                                    className="p-1.5 text-app-muted-2 hover:text-app-accent-readable hover:bg-app-accent-muted rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={deletingId === item._id}
                                                    className="p-1.5 text-app-muted-2 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
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
                                                className="p-1.5 text-app-muted-2 hover:text-app-accent-readable rounded-lg"
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
                                        <div className="mt-3 pt-3 border-t border-app-border space-y-4">
                                            <div>
                                                <p className="text-xs text-app-muted-2 mb-2 font-medium uppercase tracking-wide">
                                                    Answer
                                                </p>
                                                <AnswerBody text={item.answer} />
                                            </div>

                                            {/* Comments */}
                                            <div className="border-t border-app-border pt-4">
                                                <p className="text-xs text-app-muted-2 mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    Comments ({(item.comments || []).length})
                                                </p>

                                                <div className="space-y-2.5 mb-3">
                                                    {(item.comments || []).length === 0 ? (
                                                        <p className="text-xs text-gray-600">No comments yet.</p>
                                                    ) : (
                                                        (item.comments || []).map((c) => (
                                                            <div
                                                                key={c._id}
                                                                className="rounded-lg bg-app-bg/80 border border-app-border px-3 py-2.5"
                                                            >
                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                    <p className="text-xs text-app-muted">
                                                                        <span className="text-app-text font-medium">
                                                                            {c.authorName || 'Anonymous'}
                                                                        </span>
                                                                        <span className="text-gray-600 mx-1.5">·</span>
                                                                        {formatDate(c.createdAt)}
                                                                    </p>
                                                                    {isAdmin && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteComment(
                                                                                    item._id,
                                                                                    c._id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                commentDeleting ===
                                                                                c._id
                                                                            }
                                                                            className="p-1 text-gray-600 hover:text-red-400 rounded transition-colors disabled:opacity-50"
                                                                            title="Admin: delete comment"
                                                                        >
                                                                            {commentDeleting ===
                                                                                c._id ? (
                                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                            ) : (
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-app-muted whitespace-pre-wrap">
                                                                    {c.text}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {isAuthenticated ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={commentDrafts[item._id] || ''}
                                                            onChange={(e) =>
                                                                setCommentDrafts((d) => ({
                                                                    ...d,
                                                                    [item._id]: e.target.value,
                                                                }))
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key === 'Enter' &&
                                                                    !e.shiftKey
                                                                ) {
                                                                    e.preventDefault();
                                                                    handleAddComment(item._id);
                                                                }
                                                            }}
                                                            placeholder="Write a comment..."
                                                            maxLength={2000}
                                                            className="flex-1 px-3 py-2 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleAddComment(item._id)
                                                            }
                                                            disabled={
                                                                commentPosting === item._id ||
                                                                !(commentDrafts[item._id] || '').trim()
                                                            }
                                                            className="px-3 py-2 bg-app-accent-muted hover:bg-app-accent-muted text-app-accent-readable border border-app-accent-border rounded-xl text-sm disabled:opacity-40 inline-flex items-center gap-1.5 transition-all"
                                                        >
                                                            {commentPosting === item._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Send className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-app-muted-2">
                                                        <Link
                                                            href="/login"
                                                            className="text-app-accent-readable hover:underline"
                                                        >
                                                            Log in
                                                        </Link>{' '}
                                                        to comment
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}

                {pages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-10">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-4 py-2 text-sm font-medium rounded-xl border border-app-border text-app-muted hover:text-app-accent-readable hover:border-app-accent-border disabled:opacity-40 disabled:hover:text-app-muted disabled:hover:border-app-border transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-app-muted-2 font-medium tabular-nums">
                            {page} / {pages}
                        </span>
                        <button
                            disabled={page >= pages}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 text-sm font-medium rounded-xl border border-app-border text-app-muted hover:text-app-accent-readable hover:border-app-accent-border disabled:opacity-40 disabled:hover:text-app-muted disabled:hover:border-app-border transition-all"
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
                                Edit question
                            </h2>
                            <button
                                type="button"
                                onClick={closeEdit}
                                className="p-1.5 text-app-muted hover:text-app-text rounded-xl hover:bg-app-card-alt transition-colors"
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
                            {topicSelect(
                                editForm.topic,
                                (e) =>
                                    setEditForm((f) => ({
                                        ...f,
                                        topic: e.target.value,
                                        customTopic:
                                            e.target.value === 'Other' ? f.customTopic : '',
                                    })),
                                editForm.customTopic,
                                (e) => setEditForm((f) => ({ ...f, customTopic: e.target.value }))
                            )}
                            <div>
                                <label className="block text-xs text-app-muted mb-1.5">Question</label>
                                <textarea
                                    value={editForm.question}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, question: e.target.value }))
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20 resize-y"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-app-muted mb-1.5">
                                    Answer{' '}
                                    <span className="text-gray-600 font-normal">
                                        (use ```js code ``` for code blocks)
                                    </span>
                                </label>
                                <textarea
                                    value={editForm.answer}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, answer: e.target.value }))
                                    }
                                    rows={12}
                                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-app-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-app-accent/20 resize-y"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="px-4 py-2 text-sm text-app-muted hover:text-app-text rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    className="px-5 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-xl text-sm disabled:opacity-50 inline-flex items-center gap-2 transition-all"
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
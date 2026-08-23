// src/components/jobs/JobDetailsModal.jsx
'use client';

import { useState } from 'react';
import {
    X,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Calendar,
    FileText,
    User,
    Mail,
    Phone,
    Clock,
    Tag,
    ExternalLink,
    Edit,
    Trash2,
    Send,
    Eye,
    Star,
    ClipboardList,
    UserCheck,
    Award,
    XCircle,
    Clock8,
    CalendarDays,
    MessageSquare,
    Plus,
    X as XIcon
} from 'lucide-react';
import {
    getAllowedStatusOptions,
    canTransition,
    getDisplayBadges,
    normalizeStatusHistory,
    formatStatusDate,
    STATUS_LABELS as SL,
    VALID_STATUSES,
} from '@/lib/statusLogic';

const STATUS_ICONS = {
    applied: Send,
    resume_viewed: Eye,
    shortlisted: Star,
    online_test: ClipboardList,
    interview: UserCheck,
    got_hired: Award,
    rejected: XCircle,
    no_response: Clock8,
    no_action: Briefcase
};

const STATUS_COLORS = {
    applied: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    resume_viewed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
    shortlisted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    online_test: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    interview: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    got_hired: 'bg-green-500/20 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/20',
    no_response: 'bg-gray-500/20 text-app-muted border-gray-500/20',
    no_action: 'bg-gray-500/20 text-app-muted border-gray-500/20'
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

const LOCATION_LABELS = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    onsite: 'On-site',
    not_specified: 'Not Specified'
};

export default function JobDetailsModal({
    isOpen,
    onClose,
    job,
    onEdit,
    onDelete,
    onStatusChange,
    onAddStatus,
    onRemoveStatus,
    onUpdateStatusDate,
}) {
    const [activeTab, setActiveTab] = useState('details');
    const [addStatus, setAddStatus] = useState('applied');
    const [addDate, setAddDate] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null); // status key being edited
    const [editDate, setEditDate] = useState('');
    const [savingDate, setSavingDate] = useState(false);
    const [removingStatus, setRemovingStatus] = useState(null);

    if (!isOpen || !job) return null;

    const badges = getDisplayBadges(job);
    const history = normalizeStatusHistory(job);
    const statusLabel = STATUS_LABELS[job.status] || 'No Action Yet';
    const locationLabel = LOCATION_LABELS[job.location] || job.location || 'Not specified';

    // Statuses not yet in history (for add dropdown)
    const existingKeys = new Set(history.map((h) => h.status));
    const availableToAdd = VALID_STATUSES.filter(
        (s) => s !== 'no_action' && !existingKeys.has(s)
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatSalary = (salary) => {
        if (!salary) return 'Not specified';
        return salary;
    };

    const handleAddStatus = async () => {
        if (!addStatus || typeof onAddStatus !== 'function') return;
        setAdding(true);
        try {
            await onAddStatus(job._id, addStatus, addDate || null);
            setAddDate('');
            if (availableToAdd.length > 1) {
                const next = availableToAdd.find((s) => s !== addStatus);
                if (next) setAddStatus(next);
            }
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveStatus = async (e, statusKey) => {
        e?.stopPropagation?.();
        e?.preventDefault?.();

        if (typeof onRemoveStatus !== 'function' || removingStatus) return;

        setRemovingStatus(statusKey);
        try {
            await onRemoveStatus(job._id, statusKey);
        } finally {
            setRemovingStatus(null);
        }
    };

    const startEditDate = (entry) => {
        setEditingStatus(entry.status);
        if (entry.date) {
            try {
                setEditDate(new Date(entry.date).toISOString().split('T')[0]);
            } catch {
                setEditDate('');
            }
        } else {
            setEditDate('');
        }
    };

    const saveEditDate = async () => {
        if (!editingStatus || typeof onUpdateStatusDate !== 'function') return;
        setSavingDate(true);
        try {
            await onUpdateStatusDate(job._id, editingStatus, editDate || null);
            setEditingStatus(null);
            setEditDate('');
        } finally {
            setSavingDate(false);
        }
    };

    const InfoRow = ({ icon: Icon, label, value, link = false }) => (
        <div className="flex items-start gap-3 py-2.5 border-b border-app-border last:border-0">
            <Icon className="w-4 h-4 text-app-accent-readable flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="text-xs text-app-muted-2">{label}</p>
                {link ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-app-accent-readable hover:underline text-sm truncate block"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-app-text text-sm break-words">{value || 'Not specified'}</p>
                )}
            </div>
        </div>
    );

    const DetailSection = ({ title, icon: Icon, children }) => (
        <div className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-app-muted mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4 text-app-accent-readable" />
                {title}
            </h3>
            {children}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Wider modal: max-w-5xl */}
            <div className="bg-app-card rounded-2xl border border-app-border max-w-5xl w-full max-h-[95vh] shadow-2xl flex flex-col animate-fadeIn">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-app-border">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-app-text truncate">{job.title || 'Untitled Position'}</h2>
                            {badges.map((statusKey) => {
                                const Icon = STATUS_ICONS[statusKey] || Briefcase;
                                return (
                                    <span
                                        key={statusKey}
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[statusKey] || STATUS_COLORS.no_action} flex items-center gap-1 flex-shrink-0`}
                                    >
                                        <Icon className="w-3 h-3" />
                                        {STATUS_LABELS[statusKey] || statusKey}
                                    </span>
                                );
                            })}
                        </div>
                        <p className="text-app-muted text-sm mt-1 flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company || 'Unknown Company'}
                            <span className="text-gray-600">•</span>
                            <MapPin className="w-3.5 h-3.5" />
                            {locationLabel}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(job);
                            }}
                            className="p-2 text-app-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onDelete(job._id);
                            }}
                            className="p-2 text-app-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-app-accent-muted rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-app-muted" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-app-border px-5">
                    {['details', 'description', 'notes'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative capitalize ${activeTab === tab ? 'text-app-accent-readable' : 'text-app-muted hover:text-app-text'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-app-accent rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left column */}
                            <div className="space-y-6">
                                <DetailSection title="Job Information" icon={Briefcase}>
                                    <InfoRow icon={Briefcase} label="Position" value={job.title} />
                                    <InfoRow icon={Building2} label="Company" value={job.company} />
                                    <InfoRow icon={MapPin} label="Location" value={locationLabel} />
                                    <InfoRow icon={DollarSign} label="Salary Range" value={formatSalary(job.salaryRange)} />
                                    {job.deadline && (
                                        <InfoRow icon={CalendarDays} label="Deadline" value={formatDate(job.deadline)} />
                                    )}
                                    {job.appliedDate && (
                                        <InfoRow icon={Calendar} label="Applied Date" value={formatDate(job.appliedDate)} />
                                    )}
                                </DetailSection>

                                {job.skills && job.skills.length > 0 && (
                                    <DetailSection title="Skills" icon={Tag}>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-app-accent-muted text-app-accent-readable text-sm rounded-full border border-app-accent-border"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </DetailSection>
                                )}

                                {/* Quick status change (advance pipeline) */}
                                <div className="bg-app-bg rounded-lg p-4 border border-app-border">
                                    <h4 className="text-xs font-medium text-app-muted uppercase tracking-wider mb-3">
                                        Set Current Status
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        <select
                                            value={job.status || 'no_action'}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                const check = canTransition(job.status, newStatus, job);
                                                if (!check.ok) {
                                                    console.warn(check.message);
                                                    return;
                                                }
                                                if (typeof onStatusChange === 'function' && job._id) {
                                                    onStatusChange(job._id, newStatus);
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-app-bg border border-app-border rounded-lg text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors"
                                        >
                                            {getAllowedStatusOptions(job).map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        {job.jobLink && (
                                            <a
                                                href={job.jobLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-app-accent-muted hover:bg-app-accent/20 text-app-accent-readable rounded-lg transition-colors text-sm flex items-center gap-1.5 border border-app-accent-border"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                View Job Posting
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right column – Status Timeline */}
                            <div className="space-y-6">
                                <DetailSection title="Status Timeline" icon={Clock}>
                                    <div className="bg-app-bg rounded-lg p-4 border border-app-border space-y-3">
                                        {history.length === 0 ? (
                                            <p className="text-app-muted-2 text-sm">No statuses yet. Mark as Applied to start.</p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {history.map((entry) => {
                                                    const Icon = STATUS_ICONS[entry.status] || Briefcase;
                                                    const isEditing = editingStatus === entry.status;
                                                    return (
                                                        <li
                                                            key={entry.status}
                                                            className="flex items-center justify-between gap-3 group"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
                                                                <span
                                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[entry.status] || STATUS_COLORS.no_action} flex items-center gap-1.5 flex-shrink-0`}
                                                                >
                                                                    <Icon className="w-3 h-3" />
                                                                    {STATUS_LABELS[entry.status] || entry.status}
                                                                </span>
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="date"
                                                                            value={editDate}
                                                                            onChange={(e) => setEditDate(e.target.value)}
                                                                            className="px-2 py-1 bg-app-card border border-app-border rounded text-app-text text-sm focus:outline-none focus:ring-1 focus:ring-app-accent"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={saveEditDate}
                                                                            disabled={savingDate}
                                                                            className="px-2 py-1 text-xs bg-app-accent text-app-accent-text font-medium rounded hover:bg-app-accent-hover disabled:opacity-50"
                                                                        >
                                                                            {savingDate ? '…' : 'Save'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingStatus(null);
                                                                                setEditDate('');
                                                                            }}
                                                                            className="px-2 py-1 text-xs text-app-muted hover:text-app-text"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => startEditDate(entry)}
                                                                        className="text-app-muted text-sm hover:text-app-accent-readable hover:underline transition-colors"
                                                                        title="Click to edit date"
                                                                    >
                                                                        {formatStatusDate(entry.date) || 'Set date'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                {!isEditing && typeof onUpdateStatusDate === 'function' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => startEditDate(entry)}
                                                                        className="p-1.5 text-app-muted-2 hover:text-app-accent-readable hover:bg-app-accent-muted rounded-lg"
                                                                        title="Edit date"
                                                                    >
                                                                        <Edit className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                {typeof onRemoveStatus === 'function' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => handleRemoveStatus(e, entry.status)}
                                                                        disabled={!!removingStatus}
                                                                        className={`p-1.5 rounded-lg transition-all duration-200 ${removingStatus === entry.status
                                                                                ? 'text-red-400 bg-red-500/20 cursor-wait'
                                                                                : 'text-app-muted-2 hover:text-red-400 hover:bg-red-500/10'
                                                                            } disabled:opacity-50`}
                                                                        title="Remove this status"
                                                                    >
                                                                        {removingStatus === entry.status ? (
                                                                            <span className="w-3.5 h-3.5 block border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                                        ) : (
                                                                            <XIcon className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}

                                        <p className="text-app-text text-sm pt-2 border-t border-app-border">
                                            Current:{' '}
                                            <span className="text-app-accent-readable font-medium">{statusLabel}</span>
                                        </p>
                                        {job.updatedAt && (
                                            <p className="text-xs text-app-muted-2">
                                                Last updated: {formatDate(job.updatedAt)}
                                            </p>
                                        )}
                                    </div>
                                </DetailSection>

                                {/* Add status with date */}
                                {typeof onAddStatus === 'function' && availableToAdd.length > 0 && (
                                    <div className="bg-app-bg rounded-lg p-4 border border-app-border">
                                        <h4 className="text-xs font-medium text-app-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Status
                                        </h4>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <select
                                                value={addStatus}
                                                onChange={(e) => setAddStatus(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-app-card border border-app-border rounded-lg text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent"
                                            >
                                                {availableToAdd.map((s) => (
                                                    <option key={s} value={s}>
                                                        {STATUS_LABELS[s] || s}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="date"
                                                value={addDate}
                                                onChange={(e) => setAddDate(e.target.value)}
                                                className="px-3 py-2 bg-app-card border border-app-border rounded-lg text-app-text text-sm focus:outline-none focus:ring-2 focus:ring-app-accent"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddStatus}
                                                disabled={adding}
                                                className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                                            >
                                                {adding ? 'Adding…' : 'Add'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-app-muted-2 mt-2">
                                            Date is optional. Leave empty to use today.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'description' && (
                        <div className="space-y-4">
                            <DetailSection title="Job Description" icon={FileText}>
                                {job.jobDescription ? (
                                    <div className="bg-app-bg rounded-lg p-4 border border-app-border max-h-96 overflow-y-auto">
                                        <pre className="text-app-muted whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                            {job.jobDescription}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-app-muted-2">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                        <p>No job description provided</p>
                                    </div>
                                )}
                            </DetailSection>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <DetailSection title="Notes" icon={MessageSquare}>
                                {job.notes ? (
                                    <div className="bg-app-bg rounded-lg p-4 border border-app-border">
                                        <p className="text-app-muted text-sm leading-relaxed whitespace-pre-wrap">
                                            {job.notes}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-app-muted-2">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                        <p>No notes added</p>
                                    </div>
                                )}
                            </DetailSection>

                            {(job.contactName || job.contactEmail || job.contactPhone) && (
                                <DetailSection title="Contact Information" icon={User}>
                                    <div className="bg-app-bg rounded-lg p-4 border border-app-border space-y-2">
                                        {job.contactName && (
                                            <p className="text-app-muted text-sm flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-app-muted-2" />
                                                {job.contactName}
                                            </p>
                                        )}
                                        {job.contactEmail && (
                                            <p className="text-app-muted text-sm flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-app-muted-2" />
                                                <a href={`mailto:${job.contactEmail}`} className="text-app-accent-readable hover:underline">
                                                    {job.contactEmail}
                                                </a>
                                            </p>
                                        )}
                                        {job.contactPhone && (
                                            <p className="text-app-muted text-sm flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-app-muted-2" />
                                                <a href={`tel:${job.contactPhone}`} className="text-app-accent-readable hover:underline">
                                                    {job.contactPhone}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </DetailSection>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-app-border flex items-center justify-between">
                    <span className="text-xs text-app-muted-2">
                        Created: {formatDate(job.createdAt)}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-lg transition-all shadow-lg shadow-app-accent/20 hover:shadow-app-accent/20 text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
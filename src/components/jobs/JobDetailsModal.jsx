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
    Link2,
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
    MessageSquare
} from 'lucide-react';
import { getAllowedStatusOptions, canTransition } from '@/lib/statusLogic';

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
    no_response: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
    no_action: 'bg-gray-500/20 text-gray-400 border-gray-500/20'
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

export default function JobDetailsModal({ isOpen, onClose, job, onEdit, onDelete, onStatusChange }) {
    const [activeTab, setActiveTab] = useState('details');

    if (!isOpen || !job) return null;

    const StatusIcon = STATUS_ICONS[job.status] || Briefcase;
    const statusColor = STATUS_COLORS[job.status] || STATUS_COLORS.no_action;
    const statusLabel = STATUS_LABELS[job.status] || 'No Action Yet';
    const locationLabel = LOCATION_LABELS[job.location] || job.location || 'Not specified';

    // Format date
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

    // Format salary
    const formatSalary = (salary) => {
        if (!salary) return 'Not specified';
        return salary;
    };

    // Info Row Component
    const InfoRow = ({ icon: Icon, label, value, link = false }) => (
        <div className="flex items-start gap-3 py-2.5 border-b border-[#00684A]/10 last:border-0">
            <Icon className="w-4 h-4 text-[#00ED64] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                {link ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00ED64] hover:underline text-sm truncate block"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-white text-sm break-words">{value || 'Not specified'}</p>
                )}
            </div>
        </div>
    );

    // Detail Section Component
    const DetailSection = ({ title, icon: Icon, children }) => (
        <div className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#00ED64]" />
                {title}
            </h3>
            {children}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 max-w-3xl w-full max-h-[95vh] shadow-2xl flex flex-col animate-fadeIn">
                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b border-[#00684A]/20">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white truncate">{job.title || 'Untitled Position'}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor} flex items-center gap-1 flex-shrink-0`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusLabel}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-2">
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
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onDelete(job._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#00684A]/30 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#00684A]/20 px-4">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'details'
                                ? 'text-[#00ED64]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Details
                        {activeTab === 'details' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ED64] rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'description'
                                ? 'text-[#00ED64]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Description
                        {activeTab === 'description' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ED64] rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'notes'
                                ? 'text-[#00ED64]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Notes
                        {activeTab === 'notes' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ED64] rounded-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Job Details */}
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

                            {/* Skills */}
                            {job.skills && job.skills.length > 0 && (
                                <DetailSection title="Skills" icon={Tag}>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-[#00ED64]/10 text-[#00ED64] text-sm rounded-full border border-[#00ED64]/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </DetailSection>
                            )}

                            {/* Status Timeline */}
                            <DetailSection title="Status Timeline" icon={Clock}>
                                <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-[#00ED64] rounded-full animate-pulse" />
                                        <span className="text-white text-sm">Current Status: {statusLabel}</span>
                                    </div>
                                    {job.updatedAt && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Last updated: {formatDate(job.updatedAt)}
                                        </p>
                                    )}
                                </div>
                            </DetailSection>

                            {/* Quick Actions */}
                            <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20">
                                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                                    Quick Actions
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
                                        className="px-3 py-1.5 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
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
                                            className="px-3 py-1.5 bg-[#00ED64]/10 hover:bg-[#00ED64]/20 text-[#00ED64] rounded-lg transition-colors text-sm flex items-center gap-1.5 border border-[#00ED64]/20"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            View Job Posting
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'description' && (
                        <div className="space-y-4">
                            <DetailSection title="Job Description" icon={FileText}>
                                {job.jobDescription ? (
                                    <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20 max-h-96 overflow-y-auto">
                                        <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                            {job.jobDescription}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
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
                                    <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20">
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {job.notes}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                        <p>No notes added</p>
                                    </div>
                                )}
                            </DetailSection>

                            {/* Contact Information */}
                            {(job.contactName || job.contactEmail || job.contactPhone) && (
                                <DetailSection title="Contact Information" icon={User}>
                                    <div className="bg-[#001E2B] rounded-lg p-4 border border-[#00684A]/20 space-y-2">
                                        {job.contactName && (
                                            <p className="text-gray-300 text-sm flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-gray-500" />
                                                {job.contactName}
                                            </p>
                                        )}
                                        {job.contactEmail && (
                                            <p className="text-gray-300 text-sm flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-gray-500" />
                                                <a href={`mailto:${job.contactEmail}`} className="text-[#00ED64] hover:underline">
                                                    {job.contactEmail}
                                                </a>
                                            </p>
                                        )}
                                        {job.contactPhone && (
                                            <p className="text-gray-300 text-sm flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-gray-500" />
                                                <a href={`tel:${job.contactPhone}`} className="text-[#00ED64] hover:underline">
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
                <div className="p-4 border-t border-[#00684A]/20 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        Created: {formatDate(job.createdAt)}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
// src/components/jobs/JobCard.jsx
'use client';

import {
    Building2,
    MapPin,
    DollarSign,
    Calendar,
    Link2,
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
    Briefcase,
    Eye as EyeIcon
} from 'lucide-react';
import {
    getAllowedStatusOptions,
    canTransition,
    normalizeStatus,
    getDisplayBadges,
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

export default function JobCard({ job, onEdit, onDelete, onStatusChange, onViewDetails }) {
    const currentStatus = normalizeStatus(job?.status);
    const badges = getDisplayBadges(job);
    const allowedOptions = getAllowedStatusOptions(job);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        if (!job?._id) {
            console.error('Job ID is missing');
            return;
        }

        // Options already restrict choices; still guard for safety
        const check = canTransition(currentStatus, newStatus, job);
        if (!check.ok) {
            console.warn(check.message);
            return;
        }

        if (typeof onStatusChange === 'function') {
            onStatusChange(job._id, newStatus);
        }
    };

    return (
        <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00684A]/40 transition-all hover:bg-[#001E2B]/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left - Job Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-lg truncate">
                            {job.title || 'Untitled Position'}
                        </h3>
                        {badges.map((statusKey) => {
                            const Icon = STATUS_ICONS[statusKey] || Briefcase;
                            return (
                                <span
                                    key={statusKey}
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[statusKey] || STATUS_COLORS.no_action} flex items-center gap-1`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {STATUS_LABELS[statusKey] || statusKey}
                                </span>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-300 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company || 'Unknown Company'}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location || 'Not specified'}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-[#00ED64] flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salaryRange || 'Not specified'}
                        </span>
                        {job.deadline && (
                            <>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </div>
                    {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-[#00ED64]/10 text-[#00ED64] text-xs rounded-full border border-[#00ED64]/20"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                    {job.jobDescription && (
                        <p className="text-gray-400 text-sm mt-1.5 line-clamp-2">
                            {job.jobDescription}
                        </p>
                    )}
                    {job.notes && (
                        <p className="text-gray-500 text-sm mt-1.5 line-clamp-1">
                            📝 {job.notes}
                        </p>
                    )}
                </div>

                {/* Right - Actions */}
                <div className="flex items-center gap-2 ml-0 lg:ml-4 flex-wrap">
                    {typeof onViewDetails === 'function' && (
                        <button
                            type="button"
                            onClick={() => onViewDetails(job)}
                            className="p-2 text-gray-400 hover:text-[#00ED64] hover:bg-[#00ED64]/10 rounded-lg transition-colors"
                            title="View Details"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                    )}

                    {/* Status dropdown — only allowed transitions */}
                    <select
                        value={currentStatus}
                        onChange={handleStatusChange}
                        className="px-3 py-1.5 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                        title={
                            currentStatus === 'no_action' && !job.everApplied
                                ? 'Apply first before moving to later stages'
                                : 'Change status'
                        }
                    >
                        {allowedOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => onEdit(job)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(job._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {job.jobLink && (
                        <a
                            href={job.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-[#00ED64] hover:bg-[#00ED64]/10 rounded-lg transition-colors"
                            title="View Job Link"
                        >
                            <Link2 className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
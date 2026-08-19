// src/components/jobs/JobStats.jsx
'use client';

import { Briefcase, Send, Eye, Star, ClipboardList, UserCheck, Award, XCircle, Clock8 } from 'lucide-react';

const STATUS_ICONS = {
    applied: Send,
    resume_viewed: Eye,
    shortlisted: Star,
    online_test: ClipboardList,
    interview: UserCheck,
    got_hired: Award,
    rejected: XCircle,
    no_response: Clock8
};

const STATUS_COLORS = {
    applied: 'border-blue-500/30 hover:border-blue-500/50',
    resume_viewed: 'border-cyan-500/30 hover:border-cyan-500/50',
    shortlisted: 'border-yellow-500/30 hover:border-yellow-500/50',
    online_test: 'border-purple-500/30 hover:border-purple-500/50',
    interview: 'border-indigo-500/30 hover:border-indigo-500/50',
    got_hired: 'border-green-500/30 hover:border-green-500/50',
    rejected: 'border-red-500/30 hover:border-red-500/50',
    no_response: 'border-gray-500/30 hover:border-gray-500/50'
};

const STATUS_TEXT_COLORS = {
    applied: 'text-blue-400',
    resume_viewed: 'text-cyan-400',
    shortlisted: 'text-yellow-400',
    online_test: 'text-purple-400',
    interview: 'text-indigo-400',
    got_hired: 'text-green-400',
    rejected: 'text-red-400',
    no_response: 'text-gray-400'
};

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

export default function JobStats({ stats, onFilterChange, currentFilter }) {
    const statusKeys = Object.keys(STATUS_LABELS);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3 mb-6">
            {/* Total */}
            <div
                onClick={() => onFilterChange('all')}
                className={`bg-[#002433] rounded-xl border p-3 text-center cursor-pointer transition-all ${currentFilter === 'all'
                        ? 'border-[#00ED64] bg-[#00ED64]/10'
                        : 'border-[#00684A]/20 hover:border-[#00ED64]/30'
                    }`}
            >
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Total</p>
            </div>

            {/* Status Stats */}
            {statusKeys.map((key) => {
                const Icon = STATUS_ICONS[key];
                const count = stats[key] || 0;
                const isActive = currentFilter === key;

                return (
                    <div
                        key={key}
                        onClick={() => onFilterChange(key)}
                        className={`bg-[#002433] rounded-xl border p-3 text-center cursor-pointer transition-all ${isActive
                                ? `border-[#00ED64] bg-[#00ED64]/10`
                                : `${STATUS_COLORS[key]} border-[#00684A]/20 hover:border-[#00684A]/40`
                            }`}
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ED64]' : STATUS_TEXT_COLORS[key]}`} />
                            <p className={`text-xl font-bold ${isActive ? 'text-[#00ED64]' : 'text-white'}`}>
                                {count}
                            </p>
                        </div>
                        <p className={`text-xs ${isActive ? 'text-[#00ED64]' : 'text-gray-400'}`}>
                            {STATUS_LABELS[key]}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
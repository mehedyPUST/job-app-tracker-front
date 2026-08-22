// src/lib/statusLogic.js

export const VALID_STATUSES = [
    'no_action',
    'applied',
    'resume_viewed',
    'shortlisted',
    'online_test',
    'interview',
    'got_hired',
    'rejected',
    'no_response',
];

export const STATUS_LABELS = {
    no_action: 'No Action Yet',
    applied: 'Applied',
    resume_viewed: 'Resume Viewed',
    shortlisted: 'Shortlisted',
    online_test: 'Online Test',
    interview: 'Interview',
    got_hired: 'Got Hired',
    rejected: 'Rejected',
    no_response: 'No Response',
};

export const STATUS_OPTIONS = VALID_STATUSES.map((value) => ({
    value,
    label: STATUS_LABELS[value],
}));

export const STATUS_COLORS = {
    applied: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    resume_viewed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
    shortlisted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    online_test: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    interview: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    got_hired: 'bg-green-500/20 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/20',
    no_response: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
    no_action: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
};

export const STATUS_ICONS = {
    applied: 'Send',
    resume_viewed: 'Eye',
    shortlisted: 'Star',
    online_test: 'ClipboardList',
    interview: 'UserCheck',
    got_hired: 'Award',
    rejected: 'XCircle',
    no_response: 'Clock8',
    no_action: 'Briefcase',
};

export const PIPELINE_RANK = {
    no_action: 0,
    applied: 1,
    resume_viewed: 2,
    shortlisted: 3,
    online_test: 4,
    interview: 5,
    got_hired: 6,
    rejected: -1,
    no_response: -1,
};

export const TERMINAL = ['rejected', 'no_response'];

/**
 * Normalize statuses array from a job document.
 * Supports old documents that only have a single `status` field.
 */
export function normalizeStatuses(job) {
    if (!job) return ['no_action'];

    if (Array.isArray(job.statuses) && job.statuses.length > 0) {
        return job.statuses.filter((s) => VALID_STATUSES.includes(s));
    }

    // Legacy: single status field → expand to full pipeline up to that status
    const s = job.status || 'no_action';
    if (s === 'no_action') return ['no_action'];

    const rank = PIPELINE_RANK[s];
    if (rank === -1) {
        return ['applied', s];
    }
    if (rank >= 1) {
        return VALID_STATUSES.filter((st) => {
            const r = PIPELINE_RANK[st];
            return r >= 1 && r <= rank;
        });
    }
    return ['no_action'];
}

/**
 * Compute badges when user selects a new status (auto-add previous pipeline stages).
 */
export function computeStatuses(newStatus, existingJob = null) {
    const existingStatuses = normalizeStatuses(existingJob);

    if (newStatus === 'no_action') {
        return ['no_action'];
    }

    const rank = PIPELINE_RANK[newStatus];

    if (rank === -1) {
        const pipeline = existingStatuses.filter((s) => PIPELINE_RANK[s] >= 1);
        const base = pipeline.length > 0 ? pipeline : ['applied'];
        return [...new Set([...base, newStatus])];
    }

    return VALID_STATUSES.filter((s) => {
        const r = PIPELINE_RANK[s];
        return r >= 1 && r <= rank;
    });
}

export function hasApplied(job) {
    if (!job) return false;
    if (job.everApplied === true) return true;
    const statuses = normalizeStatuses(job);
    return statuses.some((s) => s !== 'no_action');
}

export function normalizeStatus(status) {
    return status || 'no_action';
}

export function isValidStatus(status) {
    return VALID_STATUSES.includes(status);
}

export function canTransition(currentStatus, newStatus, job = null) {
    if (!isValidStatus(newStatus)) {
        return { ok: false, message: 'Invalid status value' };
    }

    const current = currentStatus || 'no_action';
    if (current === newStatus) return { ok: true };

    const applied = hasApplied({
        status: current,
        everApplied: job?.everApplied,
        statuses: job?.statuses,
    });

    if (!applied && current === 'no_action') {
        if (newStatus === 'applied' || newStatus === 'no_action') {
            return { ok: true };
        }
        return {
            ok: false,
            message: 'You must mark the job as Applied before moving to Resume Viewed or any later stage.',
        };
    }

    if (TERMINAL.includes(newStatus) && !applied) {
        return {
            ok: false,
            message: 'You must apply to a job before marking it as Rejected or No Response.',
        };
    }

    const newRank = PIPELINE_RANK[newStatus];
    if (newRank > 1 && !applied) {
        return {
            ok: false,
            message: 'You must mark the job as Applied before moving to this stage.',
        };
    }

    return { ok: true };
}

export function getAllowedStatuses(job) {
    const current = job?.status || 'no_action';
    const applied = hasApplied(job);

    if (!applied && current === 'no_action') {
        return ['no_action', 'applied'];
    }

    return [...VALID_STATUSES];
}

export function getAllowedStatusOptions(job) {
    const allowed = getAllowedStatuses(job);
    return STATUS_OPTIONS.filter((o) => allowed.includes(o.value));
}

/**
 * Stats: count jobs that have each status as a badge.
 * applied = ever applied count.
 */
export function buildClientStats(jobs = []) {
    const statuses = {};
    VALID_STATUSES.forEach((s) => {
        statuses[s] = 0;
    });

    let total = 0;
    let everAppliedCount = 0;

    for (const job of jobs) {
        total += 1;
        const jobStatuses = normalizeStatuses(job);

        for (const s of jobStatuses) {
            if (statuses[s] !== undefined) {
                statuses[s] += 1;
            }
        }

        if (hasApplied(job)) everAppliedCount += 1;
    }

    // Keep "applied" meaning "ever applied" for the stats card
    statuses.applied = everAppliedCount;

    // Flat shape expected by JobStats: { total, applied, interview, ... }
    return { total, ...statuses };
}

/**
 * Check if a job has a specific status badge.
 */
export function jobHasStatus(job, status) {
    if (status === 'all') return true;
    if (status === 'applied') return hasApplied(job);
    const statuses = normalizeStatuses(job);
    return statuses.includes(status);
}

/**
 * Get display badges for a job (exclude no_action when other statuses exist).
 */
export function getDisplayBadges(job) {
    const statuses = normalizeStatuses(job);
    if (statuses.length === 1 && statuses[0] === 'no_action') {
        return ['no_action'];
    }
    return statuses.filter((s) => s !== 'no_action');
}

const statusLogic = {
    VALID_STATUSES,
    STATUS_LABELS,
    STATUS_OPTIONS,
    STATUS_COLORS,
    STATUS_ICONS,
    PIPELINE_RANK,
    TERMINAL,
    hasApplied,
    normalizeStatus,
    normalizeStatuses,
    computeStatuses,
    isValidStatus,
    canTransition,
    getAllowedStatuses,
    getAllowedStatusOptions,
    buildClientStats,
    jobHasStatus,
    getDisplayBadges,
};

export default statusLogic;
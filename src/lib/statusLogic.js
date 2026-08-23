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

export function normalizeStatusHistory(job) {
    if (!job) return [];

    if (Array.isArray(job.statusHistory) && job.statusHistory.length > 0) {
        return job.statusHistory
            .filter((h) => h && VALID_STATUSES.includes(h.status) && h.status !== 'no_action')
            .map((h) => ({
                status: h.status,
                date: h.date || null,
            }))
            .sort((a, b) => {
                const ra = PIPELINE_RANK[a.status] === -1 ? 999 : PIPELINE_RANK[a.status];
                const rb = PIPELINE_RANK[b.status] === -1 ? 999 : PIPELINE_RANK[b.status];
                if (ra !== rb) return ra - rb;
                const da = a.date ? new Date(a.date).getTime() : 0;
                const db = b.date ? new Date(b.date).getTime() : 0;
                return da - db;
            });
    }

    if (Array.isArray(job.statuses) && job.statuses.length > 0) {
        const list = job.statuses.filter((s) => VALID_STATUSES.includes(s) && s !== 'no_action');
        const date = job.appliedDate || job.updatedAt || job.createdAt || null;
        return list.map((s) => ({ status: s, date }));
    }

    const s = job.status || 'no_action';
    if (s === 'no_action') return [];

    const rank = PIPELINE_RANK[s];
    const date = job.appliedDate || job.updatedAt || job.createdAt || null;

    if (rank === -1) {
        return [
            { status: 'applied', date },
            { status: s, date },
        ];
    }
    if (rank >= 1) {
        return VALID_STATUSES.filter((st) => {
            const r = PIPELINE_RANK[st];
            return r >= 1 && r <= rank;
        }).map((st) => ({ status: st, date }));
    }
    return [];
}

export function statusesFromHistory(history) {
    if (!history || history.length === 0) return ['no_action'];
    return history.map((h) => h.status);
}

export function currentStatusFromHistory(history) {
    if (!history || history.length === 0) return 'no_action';
    const terminals = history.filter((h) => TERMINAL.includes(h.status));
    if (terminals.length > 0) {
        terminals.sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return db - da;
        });
        return terminals[0].status;
    }
    let best = history[0];
    for (const h of history) {
        if (PIPELINE_RANK[h.status] > PIPELINE_RANK[best.status]) best = h;
    }
    return best.status;
}

export function normalizeStatuses(job) {
    return statusesFromHistory(normalizeStatusHistory(job));
}

/**
 * Set / update a single status only (manual mode).
 * Does NOT auto-add previous pipeline stages.
 * Preserves all other existing statuses in history.
 */
export function computeStatusHistory(newStatus, existingJob = null, date = null) {
    if (newStatus === 'no_action') return [];
    if (!isValidStatus(newStatus)) return normalizeStatusHistory(existingJob);

    const existing = normalizeStatusHistory(existingJob);
    const nowIso = date ? new Date(date).toISOString() : new Date().toISOString();

    const filtered = existing.filter((h) => h.status !== newStatus);
    filtered.push({ status: newStatus, date: nowIso });

    filtered.sort((a, b) => {
        const ra = PIPELINE_RANK[a.status] === -1 ? 999 : PIPELINE_RANK[a.status];
        const rb = PIPELINE_RANK[b.status] === -1 ? 999 : PIPELINE_RANK[b.status];
        if (ra !== rb) return ra - rb;
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
    });
    return filtered;
}

export function computeStatuses(newStatus, existingJob = null) {
    return statusesFromHistory(computeStatusHistory(newStatus, existingJob));
}

export function hasApplied(job) {
    if (!job) return false;
    if (job.everApplied === true) return true;
    return normalizeStatusHistory(job).length > 0;
}

export function normalizeStatus(status) {
    return status || 'no_action';
}

export function isValidStatus(status) {
    return VALID_STATUSES.includes(status);
}

export function canTransition(currentStatus, newStatus, job = null) {
    // Fully manual: any valid status can be set at any time
    if (!isValidStatus(newStatus)) {
        return { ok: false, message: 'Invalid status value' };
    }
    return { ok: true };
}

export function getAllowedStatuses(job) {
    // Fully manual: all statuses available
    return [...VALID_STATUSES];
}

export function getAllowedStatusOptions(job) {
    const allowed = getAllowedStatuses(job);
    return STATUS_OPTIONS.filter((o) => allowed.includes(o.value));
}

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

    statuses.applied = everAppliedCount;
    return { total, ...statuses };
}

export function jobHasStatus(job, status) {
    if (status === 'all') return true;
    if (status === 'applied') return hasApplied(job);
    return normalizeStatuses(job).includes(status);
}

export function getDisplayBadges(job) {
    const statuses = normalizeStatuses(job);
    if (statuses.length === 1 && statuses[0] === 'no_action') {
        return ['no_action'];
    }
    return statuses.filter((s) => s !== 'no_action');
}

export function formatStatusDate(date) {
    if (!date) return null;
    try {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return null;
    }
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
    normalizeStatusHistory,
    computeStatuses,
    computeStatusHistory,
    isValidStatus,
    canTransition,
    getAllowedStatuses,
    getAllowedStatusOptions,
    buildClientStats,
    jobHasStatus,
    getDisplayBadges,
    formatStatusDate,
    statusesFromHistory,
    currentStatusFromHistory,
};

export default statusLogic;

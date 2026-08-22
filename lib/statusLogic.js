/**
 * Job application status progression logic (frontend)
 *
 * Pipeline: no_action → applied → resume_viewed → shortlisted → online_test → interview → got_hired
 * Terminal (only after Applied): rejected, no_response
 *
 * - Cannot reach Resume Viewed (or later) without Applied first
 * - Applied count is cumulative (ever applied) and does not decrease when status advances
 */

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

const PIPELINE_RANK = {
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

const TERMINAL = ['rejected', 'no_response'];

/** Normalize legacy / missing status to a known value */
export function normalizeStatus(status) {
    if (!status || typeof status !== 'string') return 'no_action';
    if (VALID_STATUSES.includes(status)) return status;

    // Legacy labels from older versions of the app
    const legacyMap = {
        viewed: 'resume_viewed',
        resumeviewed: 'resume_viewed',
        test: 'online_test',
        online_assessment: 'online_test',
        offered: 'got_hired',
        hired: 'got_hired',
        offer: 'got_hired',
    };
    const key = status.toLowerCase().replace(/\s+/g, '_');
    return legacyMap[key] || 'no_action';
}

export function hasApplied(job) {
    if (!job) return false;
    if (job.everApplied === true) return true;
    const s = normalizeStatus(job.status);
    return s !== 'no_action';
}

/**
 * @returns {{ ok: boolean, message?: string }}
 */
export function canTransition(currentStatus, newStatus, job = null) {
    const next = normalizeStatus(newStatus);
    if (!VALID_STATUSES.includes(next)) {
        return { ok: false, message: 'Invalid status value' };
    }

    const current = normalizeStatus(currentStatus);
    if (current === next) return { ok: true };

    const applied = hasApplied({ status: current, everApplied: job?.everApplied });

    if (!applied && current === 'no_action') {
        if (next === 'applied' || next === 'no_action') {
            return { ok: true };
        }
        return {
            ok: false,
            message:
                'You must mark the job as Applied before moving to Resume Viewed or any later stage.',
        };
    }

    if (TERMINAL.includes(next) && !applied) {
        return {
            ok: false,
            message: 'You must apply to a job before marking it as Rejected or No Response.',
        };
    }

    const newRank = PIPELINE_RANK[next] ?? 0;
    if (newRank > 1 && !applied) {
        return {
            ok: false,
            message: 'You must mark the job as Applied before moving to this stage.',
        };
    }

    return { ok: true };
}

/** Status values the user is allowed to pick for this job */
export function getAllowedStatuses(job) {
    const current = normalizeStatus(job?.status);
    const applied = hasApplied(job);

    let allowed;
    if (!applied && current === 'no_action') {
        allowed = ['no_action', 'applied'];
    } else {
        allowed = [...VALID_STATUSES];
    }

    // Always include current status so controlled <select> never has an invalid value
    if (!allowed.includes(current)) {
        allowed = [current, ...allowed];
    }

    return allowed;
}

export function getAllowedStatusOptions(job) {
    const allowed = getAllowedStatuses(job);
    return allowed.map((value) => ({
        value,
        label: STATUS_LABELS[value] || value,
    }));
}

/**
 * Build display stats from a jobs array.
 * applied = ever applied (does not decrease when status moves past applied)
 * other keys = exact current status counts
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
        const s = normalizeStatus(job.status);
        if (statuses[s] !== undefined) statuses[s] += 1;
        else statuses.no_action += 1;

        if (hasApplied(job)) everAppliedCount += 1;
    }

    statuses.applied = everAppliedCount;

    return { total, ...statuses };
}

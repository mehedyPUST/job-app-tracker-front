// src/components/jobs/JobList.jsx
'use client';

import { Briefcase, PlusCircle, Eye } from 'lucide-react';
import JobCard from './JobCard';

export default function JobList({ jobs, onEdit, onDelete, onStatusChange, onAddNew, onViewDetails }) {
    if (jobs.length === 0) {
        return (
            <div className="bg-app-card rounded-2xl border border-app-border p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-app-accent-muted rounded-full mb-4">
                    <Briefcase className="w-10 h-10 text-app-accent-readable" />
                </div>
                <h3 className="text-xl font-semibold text-app-text mb-2">No jobs found</h3>
                <p className="text-app-muted mb-6">
                    Start tracking your job applications by adding your first job.
                </p>
                <button
                    onClick={onAddNew}
                    className="px-6 py-3 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-app-accent/20 hover:shadow-app-accent/20"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add Your First Job
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {jobs.map((job, index) => (
                <JobCard
                    key={job._id}
                    job={job}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
}
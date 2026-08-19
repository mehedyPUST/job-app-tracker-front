// src/components/jobs/JobList.jsx
'use client';

import { Briefcase, Building2, MapPin, DollarSign, Calendar, Link2, Edit, Trash2, PlusCircle } from 'lucide-react';
import JobCard from './JobCard';

export default function JobList({ jobs, onEdit, onDelete, onStatusChange, onAddNew }) {
    if (jobs.length === 0) {
        return (
            <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00ED64]/10 rounded-full mb-4">
                    <Briefcase className="w-10 h-10 text-[#00ED64]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                <p className="text-gray-400 mb-6">
                    Start tracking your job applications by adding your first job.
                </p>
                <button
                    onClick={onAddNew}
                    className="px-6 py-3 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add Your First Job
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {jobs.map((job) => (
                <JobCard
                    key={job._id}
                    job={job}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                />
            ))}
        </div>
    );
}
// src/app/(dashboard)/jobs/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { buildClientStats, hasApplied } from '@/lib/statusLogic';
import JobList from '@/components/jobs/JobList';
import JobFilters from '@/components/jobs/JobFilters';
import JobStats from '@/components/jobs/JobStats';
import JobModal from '@/components/jobs/JobModal';
import DeleteConfirmation from '@/components/jobs/DeleteConfirmation';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';
import {
    PlusCircle,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function JobsContent() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const action = searchParams.get('action');

    // State
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Open add modal if action=add in URL
    useEffect(() => {
        if (action === 'add') {
            setShowAddModal(true);
            router.replace('/jobs');
        }
    }, [action, router]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Load jobs
    useEffect(() => {
        if (isAuthenticated) {
            fetchJobs();
        }
    }, [isAuthenticated]);

    // Filter and search
    useEffect(() => {
        let result = [...jobs];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(job =>
                job.title?.toLowerCase().includes(term) ||
                job.company?.toLowerCase().includes(term) ||
                job.location?.toLowerCase().includes(term) ||
                (job.skills && job.skills.some(skill => skill.toLowerCase().includes(term)))
            );
        }

        if (filterStatus !== 'all') {
            if (filterStatus === 'applied') {
                // Applied filter = ever applied (does not shrink when status advances)
                result = result.filter(job => hasApplied(job));
            } else {
                result = result.filter(job => job.status === filterStatus);
            }
        }

        setFilteredJobs(result);
    }, [jobs, searchTerm, filterStatus]);

    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.getJobs();
            if (response.success) {
                setJobs(response.jobs || []);
                setFilteredJobs(response.jobs || []);
            } else {
                setError(response.message || 'Failed to load jobs');
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = async (formData) => {
        try {
            const response = await api.createJob(formData);
            if (response.success) {
                setJobs([response.job, ...jobs]);
                setSuccess('Job added successfully!');
                setShowAddModal(false);
                setTimeout(() => setSuccess(''), 3000);
                return { success: true };
            } else {
                setError(response.message || 'Failed to add job');
                setTimeout(() => setError(''), 3000);
                return { success: false, error: response.message };
            }
        } catch (error) {
            setError('Failed to add job');
            setTimeout(() => setError(''), 3000);
            return { success: false, error: error.message };
        }
    };

    const handleUpdateJob = async (id, formData) => {
        try {
            const response = await api.updateJob(id, formData);
            if (response.success) {
                const updatedJobs = jobs.map(job =>
                    job._id === id ? response.job : job
                );
                setJobs(updatedJobs);
                setSuccess('Job updated successfully!');
                setShowEditModal(false);
                setTimeout(() => setSuccess(''), 3000);
                return { success: true };
            } else {
                setError(response.message || 'Failed to update job');
                setTimeout(() => setError(''), 3000);
                return { success: false, error: response.message };
            }
        } catch (error) {
            setError('Failed to update job');
            setTimeout(() => setError(''), 3000);
            return { success: false, error: error.message };
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await api.updateJobStatus(id, status);
            if (response.success) {
                // Prefer full job from API (includes everApplied)
                const updatedJobs = jobs.map(job => {
                    if (job._id !== id) return job;
                    if (response.job) return response.job;
                    return {
                        ...job,
                        status,
                        everApplied: status !== 'no_action' ? true : job.everApplied,
                    };
                });
                setJobs(updatedJobs);
                setSuccess('Status updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
                return { success: true };
            } else {
                setError(response.message || 'Failed to update status');
                setTimeout(() => setError(''), 3000);
                return { success: false, error: response.message };
            }
        } catch (error) {
            setError('Failed to update status');
            setTimeout(() => setError(''), 3000);
            return { success: false, error: error.message };
        }
    };

    const handleDeleteJob = async () => {
        try {
            const response = await api.deleteJob(deleteId);
            if (response.success) {
                const updatedJobs = jobs.filter(job => job._id !== deleteId);
                setJobs(updatedJobs);
                setSuccess('Job deleted successfully!');
                setShowDeleteModal(false);
                setDeleteId(null);
                setTimeout(() => setSuccess(''), 3000);
                return { success: true };
            } else {
                setError(response.message || 'Failed to delete job');
                setTimeout(() => setError(''), 3000);
                return { success: false, error: response.message };
            }
        } catch (error) {
            setError('Failed to delete job');
            setTimeout(() => setError(''), 3000);
            return { success: false, error: error.message };
        }
    };

    const openEditModal = (job) => {
        setSelectedJob(job);
        setShowEditModal(true);
    };

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const openDetailsModal = (job) => {
        setSelectedJob(job);
        setShowDetailsModal(true);
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#00ED64] animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">Loading jobs...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // applied = ever applied (does not decrease when status moves past applied)
    const stats = buildClientStats(jobs);

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">All Jobs</h1>
                        <p className="text-gray-400 mt-1">
                            Track all your job applications in one place
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add New Job
                    </button>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-[#00ED64]/10 border border-[#00ED64]/20 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fadeIn">
                        <CheckCircle className="w-5 h-5 text-[#00ED64] flex-shrink-0" />
                        <p className="text-[#00ED64]">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fadeIn">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <JobStats stats={stats} onFilterChange={setFilterStatus} currentFilter={filterStatus} />

                {/* Filters */}
                <JobFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                    }}
                />

                {/* Job List */}
                <JobList
                    jobs={filteredJobs}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onStatusChange={handleUpdateStatus}
                    onAddNew={() => setShowAddModal(true)}
                    onViewDetails={openDetailsModal}
                />

                {/* Modals */}
                <JobModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddJob}
                    mode="add"
                />

                {selectedJob && (
                    <>
                        <JobModal
                            isOpen={showEditModal}
                            onClose={() => setShowEditModal(false)}
                            onSubmit={(data) => handleUpdateJob(selectedJob._id, data)}
                            mode="edit"
                            initialData={selectedJob}
                        />

                        <JobDetailsModal
                            isOpen={showDetailsModal}
                            onClose={() => setShowDetailsModal(false)}
                            job={selectedJob}
                            onEdit={openEditModal}
                            onDelete={(id) => {
                                setShowDetailsModal(false);
                                openDeleteModal(id);
                            }}
                            onStatusChange={handleUpdateStatus}
                        />
                    </>
                )}

                <DeleteConfirmation
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteJob}
                />
            </div>
        </div>
    );
}

// Main export with Suspense boundary
export default function JobsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#00ED64] animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">Loading jobs...</p>
                </div>
            </div>
        }>
            <JobsContent />
        </Suspense>
    );
}
// src/app/(dashboard)/applications/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Briefcase,
    PlusCircle,
    Eye,
    Search,
    Filter,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    Calendar,
    Building2,
    MapPin,
    ChevronDown,
    ChevronUp,
    Trash2,
    Edit,
    MoreVertical,
    Clock,
    Award,
    FileCheck,
    ClipboardList,
    UserCheck,
    XCircle,
    ArrowUpDown
} from 'lucide-react';

// Mock data - Replace with API calls
const mockApplications = [
    {
        id: 1,
        company: 'Google',
        position: 'Senior Software Engineer',
        location: 'Remote',
        status: 'interview',
        appliedDate: '2024-03-15',
        notes: 'Great conversation with hiring manager',
        jobUrl: 'https://google.com/jobs/123',
        contactName: 'John Doe',
        contactEmail: 'john@google.com',
        salary: '$150k - $200k'
    },
    {
        id: 2,
        company: 'Microsoft',
        position: 'Full Stack Developer',
        location: 'Hybrid',
        status: 'test',
        appliedDate: '2024-03-14',
        notes: 'Technical test scheduled for next week',
        jobUrl: 'https://microsoft.com/jobs/456',
        contactName: 'Jane Smith',
        contactEmail: 'jane@microsoft.com',
        salary: '$120k - $160k'
    },
    {
        id: 3,
        company: 'Amazon',
        position: 'Frontend Developer',
        location: 'On-site',
        status: 'viewed',
        appliedDate: '2024-03-13',
        notes: 'Recruiter viewed application',
        jobUrl: 'https://amazon.com/jobs/789',
        contactName: 'Bob Johnson',
        contactEmail: 'bob@amazon.com',
        salary: '$130k - $170k'
    },
    {
        id: 4,
        company: 'Meta',
        position: 'React Developer',
        location: 'Remote',
        status: 'applied',
        appliedDate: '2024-03-12',
        notes: 'Application submitted through company portal',
        jobUrl: 'https://meta.com/jobs/101',
        contactName: 'Alice Brown',
        contactEmail: 'alice@meta.com',
        salary: '$140k - $190k'
    },
    {
        id: 5,
        company: 'Netflix',
        position: 'Senior React Developer',
        location: 'Remote',
        status: 'offered',
        appliedDate: '2024-03-10',
        notes: 'Received offer letter!',
        jobUrl: 'https://netflix.com/jobs/202',
        contactName: 'Tom Wilson',
        contactEmail: 'tom@netflix.com',
        salary: '$160k - $210k'
    },
    {
        id: 6,
        company: 'Apple',
        position: 'iOS Developer',
        location: 'On-site',
        status: 'rejected',
        appliedDate: '2024-03-08',
        notes: 'Position filled internally',
        jobUrl: 'https://apple.com/jobs/303',
        contactName: 'Sarah Lee',
        contactEmail: 'sarah@apple.com',
        salary: '$125k - $165k'
    }
];

export default function ApplicationsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // State
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Load applications
    useEffect(() => {
        if (isAuthenticated) {
            fetchApplications();
        }
    }, [isAuthenticated]);

    // Fetch applications (mock)
    const fetchApplications = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/applications', {
            //   credentials: 'include'
            // });
            // const data = await response.json();

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setApplications(mockApplications);
            setFilteredApplications(mockApplications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    // Delete application
    const deleteApplication = async (id) => {
        try {
            // TODO: Replace with actual API call
            // await fetch(`/api/applications/${id}`, {
            //   method: 'DELETE',
            //   credentials: 'include'
            // });

            // Mock delete
            const updatedApps = applications.filter(app => app.id !== id);
            setApplications(updatedApps);
            setFilteredApplications(updatedApps);
            setSuccess('Application deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting application:', error);
            setError('Failed to delete application');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Filter and search
    useEffect(() => {
        let result = [...applications];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(app =>
                app.company.toLowerCase().includes(term) ||
                app.position.toLowerCase().includes(term) ||
                app.location.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            result = result.filter(app => app.status === filterStatus);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'desc'
                    ? new Date(b.appliedDate) - new Date(a.appliedDate)
                    : new Date(a.appliedDate) - new Date(b.appliedDate);
            }
            if (sortBy === 'company') {
                return sortOrder === 'desc'
                    ? b.company.localeCompare(a.company)
                    : a.company.localeCompare(b.company);
            }
            if (sortBy === 'position') {
                return sortOrder === 'desc'
                    ? b.position.localeCompare(a.position)
                    : a.position.localeCompare(b.position);
            }
            return 0;
        });

        setFilteredApplications(result);
    }, [applications, searchTerm, filterStatus, sortBy, sortOrder]);

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            applied: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
            viewed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
            test: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
            interview: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
            offered: 'bg-green-500/20 text-green-400 border-green-500/20',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/20'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    };

    // Get status icon
    const getStatusIcon = (status) => {
        const icons = {
            applied: FileCheck,
            viewed: Eye,
            test: ClipboardList,
            interview: UserCheck,
            offered: Award,
            rejected: XCircle
        };
        return icons[status] || Briefcase;
    };

    // Get status label
    const getStatusLabel = (status) => {
        const labels = {
            applied: 'Applied',
            viewed: 'Viewed',
            test: 'Test',
            interview: 'Interview',
            offered: 'Offered',
            rejected: 'Rejected'
        };
        return labels[status] || status;
    };

    // Statistics
    const getStats = () => {
        const total = applications.length;
        const applied = applications.filter(a => a.status === 'applied').length;
        const viewed = applications.filter(a => a.status === 'viewed').length;
        const test = applications.filter(a => a.status === 'test').length;
        const interview = applications.filter(a => a.status === 'interview').length;
        const offered = applications.filter(a => a.status === 'offered').length;
        const rejected = applications.filter(a => a.status === 'rejected').length;
        return { total, applied, viewed, test, interview, offered, rejected };
    };

    const stats = getStats();

    // Loading state
    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#00ED64] animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Applications</h1>
                        <p className="text-gray-400 mt-1">
                            Track all your job applications in one place
                        </p>
                    </div>
                    <Link
                        href="/applications/new"
                        className="px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center gap-2 whitespace-nowrap"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Application
                    </Link>
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

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-3 text-center hover:border-[#00ED64]/30 transition-all cursor-pointer"
                        onClick={() => { setFilterStatus('all'); setSearchTerm(''); }}>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-xs text-gray-400">Total</p>
                    </div>
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-3 text-center hover:border-blue-500/30 transition-all cursor-pointer"
                        onClick={() => setFilterStatus('applied')}>
                        <p className="text-2xl font-bold text-blue-400">{stats.applied}</p>
                        <p className="text-xs text-gray-400">Applied</p>
                    </div>
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-3 text-center hover:border-cyan-500/30 transition-all cursor-pointer"
                        onClick={() => setFilterStatus('viewed')}>
                        <p className="text-2xl font-bold text-cyan-400">{stats.viewed}</p>
                        <p className="text-xs text-gray-400">Viewed</p>
                    </div>
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-3 text-center hover:border-yellow-500/30 transition-all cursor-pointer"
                        onClick={() => setFilterStatus('test')}>
                        <p className="text-2xl font-bold text-yellow-400">{stats.test}</p>
                        <p className="text-xs text-gray-400">Test</p>
                    </div>
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-3 text-center hover:border-purple-500/30 transition-all cursor-pointer"
                        onClick={() => setFilterStatus('interview')}>
                        <p className="text-2xl font-bold text-purple-400">{stats.interview}</p>
                        <p className="text-xs text-gray-400">Interview</p>
                    </div>
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-3 text-center hover:border-green-500/30 transition-all cursor-pointer"
                        onClick={() => setFilterStatus('offered')}>
                        <p className="text-2xl font-bold text-green-400">{stats.offered}</p>
                        <p className="text-xs text-gray-400">Offered</p>
                    </div>
                    <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-3 text-center hover:border-red-500/30 transition-all cursor-pointer"
                        onClick={() => setFilterStatus('rejected')}>
                        <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                        <p className="text-xs text-gray-400">Rejected</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by company, position, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="applied">Applied</option>
                                <option value="viewed">Viewed</option>
                                <option value="test">Test</option>
                                <option value="interview">Interview</option>
                                <option value="offered">Offered</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="company">Sort by Company</option>
                                <option value="position">Sort by Position</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                className="px-4 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-gray-400 hover:text-white hover:border-[#00ED64]/30 transition-colors flex items-center gap-1"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                {sortOrder === 'desc' ? '↓' : '↑'}
                            </button>
                            {(searchTerm || filterStatus !== 'all') && (
                                <button
                                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00ED64]/10 rounded-full mb-4">
                            <Briefcase className="w-10 h-10 text-[#00ED64]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchTerm || filterStatus !== 'all' ? 'No matching applications' : 'No applications yet'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Start tracking your job applications by adding your first one.'}
                        </p>
                        {!(searchTerm || filterStatus !== 'all') && (
                            <Link
                                href="/applications/new"
                                className="px-6 py-3 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Your First Application
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredApplications.map((app) => {
                            const StatusIcon = getStatusIcon(app.status);
                            return (
                                <div
                                    key={app.id}
                                    className="bg-[#002433] rounded-xl border border-[#00684A]/20 p-4 hover:border-[#00684A]/40 transition-all hover:bg-[#001E2B]/50"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left - Company Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 bg-[#00ED64]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Building2 className="w-6 h-6 text-[#00ED64]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-white font-semibold text-lg truncate">
                                                        {app.position}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(app.status)} flex items-center gap-1`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {getStatusLabel(app.status)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 text-sm">{app.company}</p>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {app.location || 'Not specified'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(app.appliedDate).toLocaleDateString()}
                                                    </span>
                                                    {app.salary && (
                                                        <span className="text-[#00ED64]">{app.salary}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right - Actions */}
                                        <div className="flex items-center gap-2 ml-14 md:ml-0">
                                            <button
                                                onClick={() => {
                                                    setSelectedApplication(app);
                                                    setShowDetailModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-[#00ED64] hover:bg-[#00ED64]/10 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/applications/${app.id}/edit`}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setDeleteId(app.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedApplication && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Application Details</h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-[#00684A]/30 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">Company</p>
                                    <p className="text-white font-medium">{selectedApplication.company}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Position</p>
                                    <p className="text-white font-medium">{selectedApplication.position}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-gray-300">{selectedApplication.location || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedApplication.status)}`}>
                                        {getStatusLabel(selectedApplication.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Applied Date</p>
                                    <p className="text-gray-300">{new Date(selectedApplication.appliedDate).toLocaleDateString()}</p>
                                </div>
                                {selectedApplication.salary && (
                                    <div>
                                        <p className="text-xs text-gray-500">Salary Range</p>
                                        <p className="text-[#00ED64]">{selectedApplication.salary}</p>
                                    </div>
                                )}
                                {selectedApplication.jobUrl && (
                                    <div>
                                        <p className="text-xs text-gray-500">Job URL</p>
                                        <a
                                            href={selectedApplication.jobUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#00ED64] hover:underline text-sm break-all"
                                        >
                                            {selectedApplication.jobUrl}
                                        </a>
                                    </div>
                                )}
                                {selectedApplication.contactName && (
                                    <div>
                                        <p className="text-xs text-gray-500">Contact</p>
                                        <p className="text-gray-300">{selectedApplication.contactName}</p>
                                        {selectedApplication.contactEmail && (
                                            <p className="text-gray-400 text-sm">{selectedApplication.contactEmail}</p>
                                        )}
                                    </div>
                                )}
                                {selectedApplication.notes && (
                                    <div>
                                        <p className="text-xs text-gray-500">Notes</p>
                                        <p className="text-gray-300 text-sm bg-[#001E2B] p-3 rounded-lg">{selectedApplication.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#00684A]/20 flex gap-3">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 max-w-md w-full p-6 shadow-2xl animate-fadeIn">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Delete Application?</h2>
                                <p className="text-gray-400 mb-6">
                                    Are you sure you want to delete this application? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-2 bg-[#00684A]/20 hover:bg-[#00684A]/30 text-gray-300 font-semibold rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (deleteId) {
                                                deleteApplication(deleteId);
                                                setShowDeleteModal(false);
                                                setDeleteId(null);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
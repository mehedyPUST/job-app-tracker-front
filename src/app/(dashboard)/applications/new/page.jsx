// src/app/(dashboard)/applications/new/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Briefcase,
    Building2,
    MapPin,
    Calendar,
    FileText,
    ArrowLeft,
    Save,
    XCircle,
    AlertCircle,
    CheckCircle,
    Loader2,
    Link2,
    User,
    Mail,
    Phone
} from 'lucide-react';

export default function NewApplicationPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        company: '',
        position: '',
        location: '',
        status: 'applied',
        appliedDate: new Date().toISOString().split('T')[0],
        notes: '',
        jobUrl: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        salary: '',
        applicationDeadline: ''
    });
    const [errors, setErrors] = useState({});

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.company.trim()) {
            newErrors.company = 'Company name is required';
        }

        if (!formData.position.trim()) {
            newErrors.position = 'Position is required';
        }

        if (!formData.appliedDate) {
            newErrors.appliedDate = 'Applied date is required';
        }

        if (formData.jobUrl && !/^https?:\/\/.+/.test(formData.jobUrl)) {
            newErrors.jobUrl = 'Please enter a valid URL (starting with http:// or https://)';
        }

        if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/applications', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData),
            //   credentials: 'include'
            // });
            // const data = await response.json();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock success
            const data = { success: true, message: 'Application added successfully!' };

            if (data.success) {
                setSuccess(true);
                // Reset form after success
                setFormData({
                    company: '',
                    position: '',
                    location: '',
                    status: 'applied',
                    appliedDate: new Date().toISOString().split('T')[0],
                    notes: '',
                    jobUrl: '',
                    contactName: '',
                    contactEmail: '',
                    contactPhone: '',
                    salary: '',
                    applicationDeadline: ''
                });

                // Redirect after 2 seconds
                setTimeout(() => {
                    router.push('/applications');
                }, 2000);
            } else {
                setError(data.message || 'Failed to add application');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-app-bg flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-app-accent-readable animate-spin mx-auto" />
                    <p className="text-app-muted mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // Status options
    const statusOptions = [
        { value: 'applied', label: 'Applied', color: 'blue' },
        { value: 'viewed', label: 'Viewed', color: 'cyan' },
        { value: 'test', label: 'Test', color: 'yellow' },
        { value: 'interview', label: 'Interview', color: 'purple' },
        { value: 'offered', label: 'Offered', color: 'green' },
        { value: 'rejected', label: 'Rejected', color: 'red' },
    ];

    return (
        <div className="min-h-screen bg-app-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/applications"
                        className="inline-flex items-center text-app-muted hover:text-app-accent-readable transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Applications
                    </Link>
                    <h1 className="text-3xl font-bold text-app-text">Add New Application</h1>
                    <p className="text-app-muted mt-1">Track a job application you've submitted</p>
                </div>

                {/* Form Card */}
                <div className="bg-app-card rounded-2xl border border-app-border p-6 md:p-8 shadow-2xl shadow-app-accent/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Success Message */}
                        {success && (
                            <div className="bg-app-accent-muted border border-app-accent-border rounded-lg p-4 flex items-center gap-3 animate-fadeIn">
                                <CheckCircle className="w-5 h-5 text-app-accent-readable flex-shrink-0" />
                                <div>
                                    <p className="text-app-accent-readable font-medium">Application added successfully!</p>
                                    <p className="text-sm text-app-muted">Redirecting to your applications...</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Company */}
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-app-muted mb-1.5">
                                Company Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                <input
                                    id="company"
                                    name="company"
                                    type="text"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-2.5 bg-app-bg border ${errors.company ? 'border-red-500' : 'border-app-border'
                                        } rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors`}
                                    placeholder="e.g., Google, Microsoft"
                                    disabled={isSubmitting || success}
                                />
                            </div>
                            {errors.company && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.company}
                                </p>
                            )}
                        </div>

                        {/* Position */}
                        <div>
                            <label htmlFor="position" className="block text-sm font-medium text-app-muted mb-1.5">
                                Position / Job Title <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                <input
                                    id="position"
                                    name="position"
                                    type="text"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-2.5 bg-app-bg border ${errors.position ? 'border-red-500' : 'border-app-border'
                                        } rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors`}
                                    placeholder="e.g., Senior Software Engineer"
                                    disabled={isSubmitting || success}
                                />
                            </div>
                            {errors.position && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.position}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-app-muted mb-1.5">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2.5 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors"
                                    placeholder="e.g., Remote, New York, Hybrid"
                                    disabled={isSubmitting || success}
                                />
                            </div>
                        </div>

                        {/* Status & Date - Two Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-app-muted mb-1.5">
                                    Application Status <span className="text-red-400">*</span>
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors"
                                    disabled={isSubmitting || success}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Applied Date */}
                            <div>
                                <label htmlFor="appliedDate" className="block text-sm font-medium text-app-muted mb-1.5">
                                    Applied Date <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                    <input
                                        id="appliedDate"
                                        name="appliedDate"
                                        type="date"
                                        value={formData.appliedDate}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-2.5 bg-app-bg border ${errors.appliedDate ? 'border-red-500' : 'border-app-border'
                                            } rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors`}
                                        disabled={isSubmitting || success}
                                    />
                                </div>
                                {errors.appliedDate && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.appliedDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Salary & Deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="salary" className="block text-sm font-medium text-app-muted mb-1.5">
                                    Salary Range
                                </label>
                                <input
                                    id="salary"
                                    name="salary"
                                    type="text"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors"
                                    placeholder="e.g., $80k - $120k"
                                    disabled={isSubmitting || success}
                                />
                            </div>

                            <div>
                                <label htmlFor="applicationDeadline" className="block text-sm font-medium text-app-muted mb-1.5">
                                    Application Deadline
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                    <input
                                        id="applicationDeadline"
                                        name="applicationDeadline"
                                        type="date"
                                        value={formData.applicationDeadline}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-app-bg border border-app-border rounded-lg text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors"
                                        disabled={isSubmitting || success}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job URL */}
                        <div>
                            <label htmlFor="jobUrl" className="block text-sm font-medium text-app-muted mb-1.5">
                                Job URL
                            </label>
                            <div className="relative">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                                <input
                                    id="jobUrl"
                                    name="jobUrl"
                                    type="url"
                                    value={formData.jobUrl}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-2.5 bg-app-bg border ${errors.jobUrl ? 'border-red-500' : 'border-app-border'
                                        } rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors`}
                                    placeholder="https://example.com/job-posting"
                                    disabled={isSubmitting || success}
                                />
                            </div>
                            {errors.jobUrl && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.jobUrl}
                                </p>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="bg-app-bg/50 rounded-lg p-4 border border-app-border">
                            <h3 className="text-sm font-medium text-app-muted mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-app-accent-readable" />
                                Contact Information (Optional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label htmlFor="contactName" className="block text-xs text-app-muted-2 mb-1">
                                        Contact Name
                                    </label>
                                    <input
                                        id="contactName"
                                        name="contactName"
                                        type="text"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors text-sm"
                                        placeholder="John Doe"
                                        disabled={isSubmitting || success}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contactEmail" className="block text-xs text-app-muted-2 mb-1">
                                        Contact Email
                                    </label>
                                    <input
                                        id="contactEmail"
                                        name="contactEmail"
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 bg-app-bg border ${errors.contactEmail ? 'border-red-500' : 'border-app-border'
                                            } rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors text-sm`}
                                        placeholder="john@company.com"
                                        disabled={isSubmitting || success}
                                    />
                                    {errors.contactEmail && (
                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.contactEmail}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="contactPhone" className="block text-xs text-app-muted-2 mb-1">
                                        Contact Phone
                                    </label>
                                    <input
                                        id="contactPhone"
                                        name="contactPhone"
                                        type="tel"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors text-sm"
                                        placeholder="+1 234 567 8900"
                                        disabled={isSubmitting || success}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-app-muted mb-1.5">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors resize-y min-h-[100px]"
                                placeholder="Add any notes about this application... (e.g., referral source, interview tips, follow-up dates)"
                                disabled={isSubmitting || success}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-app-border">
                            <button
                                type="submit"
                                disabled={isSubmitting || success}
                                className={`flex-1 px-6 py-3 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-lg transition-all shadow-lg shadow-app-accent/20 hover:shadow-app-accent/20 flex items-center justify-center gap-2 ${(isSubmitting || success) ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Application
                                    </>
                                )}
                            </button>
                            <Link
                                href="/applications"
                                className="flex-1 px-6 py-3 bg-app-accent-muted hover:bg-app-accent-muted text-app-muted font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-center"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Status Legend */}
                <div className="mt-6 bg-app-card rounded-xl border border-app-border p-4">
                    <h3 className="text-xs font-medium text-app-muted uppercase tracking-wider mb-2">
                        Application Status Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {statusOptions.map((status, index) => (
                            <div key={status.value} className="flex items-center">
                                <span className={`px-2 py-1 bg-${status.color}-500/20 text-${status.color}-400 rounded-full`}>
                                    {status.label}
                                </span>
                                {index < statusOptions.length - 1 && (
                                    <span className="text-gray-600 mx-1">→</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
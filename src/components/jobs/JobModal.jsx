// src/components/jobs/JobModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, PlusCircle, Edit } from 'lucide-react';
import { getAllowedStatusOptions, canTransition } from '@/lib/statusLogic';

const LOCATION_OPTIONS = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
    { value: 'not_specified', label: 'Not Specified' }
];

export default function JobModal({ isOpen, onClose, onSubmit, mode = 'add', initialData = null }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: 'not_specified',
        salaryRange: '',
        skills: '',
        deadline: '',
        jobLink: '',
        jobDescription: '',
        notes: '',
        status: 'no_action'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData && mode === 'edit') {
            setFormData({
                title: initialData.title || '',
                company: initialData.company || '',
                location: initialData.location || 'not_specified',
                salaryRange: initialData.salaryRange || '',
                skills: (initialData.skills || []).join(', '),
                deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
                jobLink: initialData.jobLink || '',
                jobDescription: initialData.jobDescription || '',
                notes: initialData.notes || '',
                status: initialData.status || 'no_action'
            });
        } else {
            setFormData({
                title: '',
                company: '',
                location: 'not_specified',
                salaryRange: '',
                skills: '',
                deadline: '',
                jobLink: '',
                jobDescription: '',
                notes: '',
                status: 'no_action'
            });
        }
        setErrors({});
    }, [initialData, mode, isOpen]);

    // Validate - only if fields are filled (no required fields)
    const validate = () => {
        const newErrors = {};
        // No required fields - everything is optional
        // Only validate URL format if jobLink is provided
        if (formData.jobLink && !/^https?:\/\/.+/.test(formData.jobLink)) {
            newErrors.jobLink = 'Please enter a valid URL (starting with http:// or https://)';
        }
        // Validate email if provided
        if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Please enter a valid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            };
            const result = await onSubmit(submitData);
            if (result.success) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {mode === 'add' ? 'Add New Job' : 'Edit Job'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#00684A]/30 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Job Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Job Title
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                                placeholder="e.g., Senior Software Engineer"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Company
                            </label>
                            <input
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                                placeholder="e.g., Google"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Location Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Location
                            </label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                                disabled={isSubmitting}
                            >
                                {LOCATION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Salary Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Salary Range
                            </label>
                            <input
                                name="salaryRange"
                                value={formData.salaryRange}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                                placeholder="e.g., $120k - $180k or BDT 150k - 200k"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Skills
                            </label>
                            <input
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                                placeholder="e.g., React, Node.js, MongoDB (comma separated)"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Deadline
                            </label>
                            <input
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Job Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Job Description
                        </label>
                        <textarea
                            name="jobDescription"
                            value={formData.jobDescription}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors resize-none"
                            placeholder="Paste the job description here..."
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Job Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Job Link
                        </label>
                        <input
                            name="jobLink"
                            type="url"
                            value={formData.jobLink}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 bg-[#001E2B] border ${errors.jobLink ? 'border-red-500' : 'border-[#00684A]/30'
                                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                            placeholder="https://example.com/job-posting"
                            disabled={isSubmitting}
                        />
                        {errors.jobLink && <p className="mt-1 text-xs text-red-400">{errors.jobLink}</p>}
                    </div>

                    {/* Status Dropdown — only allowed transitions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                const currentJob =
                                    mode === 'edit' && initialData
                                        ? initialData
                                        : { status: 'no_action', everApplied: false };
                                const check = canTransition(
                                    currentJob.status || 'no_action',
                                    newStatus,
                                    currentJob
                                );
                                if (!check.ok) {
                                    console.warn(check.message);
                                    return;
                                }
                                handleChange(e);
                            }}
                            className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                            disabled={isSubmitting}
                        >
                            {getAllowedStatusOptions(
                                mode === 'edit' && initialData
                                    ? initialData
                                    : { status: 'no_action', everApplied: false }
                            ).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {mode === 'add' && (
                            <p className="mt-1 text-xs text-gray-500">
                                New jobs start as No Action or Applied. Apply first before later stages.
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors resize-none"
                            placeholder="Add any notes about this job..."
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[#00684A]/20">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {mode === 'add' ? 'Adding...' : 'Updating...'}
                                </>
                            ) : (
                                <>
                                    {mode === 'add' ? <PlusCircle className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                    {mode === 'add' ? 'Add Job' : 'Update Job'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-[#00684A]/20 hover:bg-[#00684A]/30 text-gray-300 font-semibold rounded-lg transition-all"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
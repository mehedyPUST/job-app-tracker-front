// src/components/jobs/JobModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, PlusCircle, Edit } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'applied', label: 'Applied' },
    { value: 'resume_viewed', label: 'Resume Viewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'online_test', label: 'Online Test' },
    { value: 'interview', label: 'Interview' },
    { value: 'got_hired', label: 'Got Hired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'no_response', label: 'No Response' }
];

export default function JobModal({ isOpen, onClose, onSubmit, mode = 'add', initialData = null }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salaryRange: '',
        skills: '',
        deadline: '',
        jobLink: '',
        notes: '',
        status: 'applied'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData && mode === 'edit') {
            setFormData({
                title: initialData.title || '',
                company: initialData.company || '',
                location: initialData.location || '',
                salaryRange: initialData.salaryRange || '',
                skills: (initialData.skills || []).join(', '),
                deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
                jobLink: initialData.jobLink || '',
                notes: initialData.notes || '',
                status: initialData.status || 'applied'
            });
        } else {
            setFormData({
                title: '',
                company: '',
                location: '',
                salaryRange: '',
                skills: '',
                deadline: '',
                jobLink: '',
                notes: '',
                status: 'applied'
            });
        }
        setErrors({});
    }, [initialData, mode, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.salaryRange.trim()) newErrors.salaryRange = 'Salary range is required';
        if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required';
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        if (formData.jobLink && !/^https?:\/\/.+/.test(formData.jobLink)) {
            newErrors.jobLink = 'Please enter a valid URL';
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
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Job Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-[#001E2B] border ${errors.title ? 'border-red-500' : 'border-[#00684A]/30'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                placeholder="e.g., Senior Software Engineer"
                                disabled={isSubmitting}
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Company <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-[#001E2B] border ${errors.company ? 'border-red-500' : 'border-[#00684A]/30'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                placeholder="e.g., Google"
                                disabled={isSubmitting}
                            />
                            {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Location <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-[#001E2B] border ${errors.location ? 'border-red-500' : 'border-[#00684A]/30'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                placeholder="e.g., Remote, On-site (NYC), Hybrid (London)"
                                disabled={isSubmitting}
                            />
                            {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Salary Range <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="salaryRange"
                                value={formData.salaryRange}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-[#001E2B] border ${errors.salaryRange ? 'border-red-500' : 'border-[#00684A]/30'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                placeholder="e.g., $120k - $180k or BDT 150k - 200k"
                                disabled={isSubmitting}
                            />
                            {errors.salaryRange && <p className="mt-1 text-xs text-red-400">{errors.salaryRange}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Skills <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-[#001E2B] border ${errors.skills ? 'border-red-500' : 'border-[#00684A]/30'
                                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                placeholder="e.g., React, Node.js, MongoDB (comma separated)"
                                disabled={isSubmitting}
                            />
                            {errors.skills && <p className="mt-1 text-xs text-red-400">{errors.skills}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Deadline <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-[#001E2B] border ${errors.deadline ? 'border-red-500' : 'border-[#00684A]/30'
                                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors`}
                                disabled={isSubmitting}
                            />
                            {errors.deadline && <p className="mt-1 text-xs text-red-400">{errors.deadline}</p>}
                        </div>
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-colors"
                            disabled={isSubmitting}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

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
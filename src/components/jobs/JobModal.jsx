// src/components/jobs/JobModal.jsx
'use client';

import { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    PlusCircle,
    Edit,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Calendar,
    Link2,
    FileText,
    StickyNote,
    User,
    Mail,
    Phone,
    Tag,
    Flag,
    Globe,
} from 'lucide-react';
import { getAllowedStatusOptions, canTransition } from '@/lib/statusLogic';

const LOCATION_OPTIONS = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
    { value: 'not_specified', label: 'Not Specified' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const SOURCE_OPTIONS = [
    '',
    'LinkedIn',
    'Company Website',
    'Indeed',
    'Glassdoor',
    'Referral',
    'Email',
    'Other',
];

const inputClass =
    'w-full px-3 py-2 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted-2 focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors';
const labelClass = 'block text-sm font-medium text-app-muted mb-1.5';
const helpClass = 'mt-1 text-xs text-app-muted-2';

function FieldLabel({ icon: Icon, children, optional }) {
    return (
        <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-app-accent-readable" />}
                {children}
                {optional && <span className="text-app-muted-2 font-normal">(optional)</span>}
            </span>
        </label>
    );
}

function Section({ title, children }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-app-accent-readable/80 border-b border-app-border pb-1.5">
                {title}
            </h3>
            {children}
        </div>
    );
}

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
        status: 'no_action',
        statusDate: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        source: '',
        priority: 'medium',
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
                deadline: initialData.deadline
                    ? new Date(initialData.deadline).toISOString().split('T')[0]
                    : '',
                jobLink: initialData.jobLink || '',
                jobDescription: initialData.jobDescription || '',
                notes: initialData.notes || '',
                status: initialData.status || 'no_action',
                statusDate: '',
                contactName: initialData.contactName || '',
                contactEmail: initialData.contactEmail || '',
                contactPhone: initialData.contactPhone || '',
                source: initialData.source || '',
                priority: initialData.priority || 'medium',
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
                status: 'no_action',
                statusDate: new Date().toISOString().split('T')[0],
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                source: '',
                priority: 'medium',
            });
        }
        setErrors({});
    }, [initialData, mode, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (formData.jobLink && !/^https?:\/\/.+/.test(formData.jobLink)) {
            newErrors.jobLink = 'URL must start with http:// or https://';
        }
        if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Enter a valid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                skills: formData.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
            };
            const result = await onSubmit(submitData);
            if (result?.success) onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const currentJob =
        mode === 'edit' && initialData
            ? initialData
            : { status: 'no_action', everApplied: false };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-app-card rounded-2xl border border-app-border max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-fadeIn">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-app-card border-b border-app-border px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
                            {mode === 'add' ? (
                                <>
                                    <PlusCircle className="w-5 h-5 text-app-accent-readable" />
                                    Add New Job
                                </>
                            ) : (
                                <>
                                    <Edit className="w-5 h-5 text-app-accent-readable" />
                                    Edit Job
                                </>
                            )}
                        </h2>
                        <p className="text-xs text-app-muted-2 mt-0.5">
                            {mode === 'add'
                                ? 'Track a new application. All fields are optional — fill what you know.'
                                : 'Update job details. Status history is managed in the job details view.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-app-accent-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-app-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic info */}
                    <Section title="Basic information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel icon={Briefcase}>Job title</FieldLabel>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. Frontend Engineer"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Building2}>Company</FieldLabel>
                                <input
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. Acme Corp"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <FieldLabel icon={MapPin}>Work type</FieldLabel>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={inputClass}
                                    disabled={isSubmitting}
                                >
                                    {LOCATION_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FieldLabel icon={DollarSign} optional>
                                    Salary range
                                </FieldLabel>
                                <input
                                    name="salaryRange"
                                    value={formData.salaryRange}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. $90k–$120k or BDT 80k–120k"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Application details */}
                    <Section title="Application details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel icon={Tag} optional>
                                    Skills
                                </FieldLabel>
                                <input
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="React, Node.js, MongoDB (comma-separated)"
                                    disabled={isSubmitting}
                                />
                                <p className={helpClass}>Used for search and filtering</p>
                            </div>
                            <div>
                                <FieldLabel icon={Calendar} optional>
                                    Application deadline
                                </FieldLabel>
                                <input
                                    name="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className={inputClass}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Globe} optional>
                                    Where did you find this?
                                </FieldLabel>
                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className={inputClass}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select source…</option>
                                    {SOURCE_OPTIONS.filter(Boolean).map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FieldLabel icon={Flag} optional>
                                    Priority
                                </FieldLabel>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className={inputClass}
                                    disabled={isSubmitting}
                                >
                                    {PRIORITY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel icon={Link2} optional>
                                    Job posting URL
                                </FieldLabel>
                                <input
                                    name="jobLink"
                                    type="url"
                                    value={formData.jobLink}
                                    onChange={handleChange}
                                    className={`${inputClass} ${errors.jobLink ? 'border-red-500' : ''}`}
                                    placeholder="https://…"
                                    disabled={isSubmitting}
                                />
                                {errors.jobLink && (
                                    <p className="mt-1 text-xs text-red-400">{errors.jobLink}</p>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* Status (mainly for add) */}
                    <Section title="Status">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Current status</FieldLabel>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
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
                                    className={inputClass}
                                    disabled={isSubmitting}
                                >
                                    {getAllowedStatusOptions(currentJob).map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className={helpClass}>
                                    {mode === 'add'
                                        ? 'Choose Applied if you already submitted. You can add more stages later in details.'
                                        : 'For fine-grained history (dates, remove stages), use Job Details.'}
                                </p>
                            </div>
                            {mode === 'add' && formData.status !== 'no_action' && (
                                <div>
                                    <FieldLabel icon={Calendar} optional>
                                        Date for this status
                                    </FieldLabel>
                                    <input
                                        name="statusDate"
                                        type="date"
                                        value={formData.statusDate}
                                        onChange={handleChange}
                                        className={inputClass}
                                        disabled={isSubmitting}
                                    />
                                    <p className={helpClass}>Defaults to today if left empty</p>
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* Description & notes */}
                    <Section title="Description & notes">
                        <div>
                            <FieldLabel icon={FileText} optional>
                                Job description
                            </FieldLabel>
                            <textarea
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleChange}
                                rows={4}
                                className={`${inputClass} resize-none`}
                                placeholder="Paste key requirements or the full posting…"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <FieldLabel icon={StickyNote} optional>
                                Personal notes
                            </FieldLabel>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className={`${inputClass} resize-none`}
                                placeholder="Recruiter name, follow-up reminders, interview prep…"
                                disabled={isSubmitting}
                            />
                        </div>
                    </Section>

                    {/* Contact */}
                    <Section title="Recruiter / contact">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <FieldLabel icon={User} optional>
                                    Name
                                </FieldLabel>
                                <input
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Jane Doe"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <FieldLabel icon={Mail} optional>
                                    Email
                                </FieldLabel>
                                <input
                                    name="contactEmail"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    className={`${inputClass} ${errors.contactEmail ? 'border-red-500' : ''}`}
                                    placeholder="recruiter@company.com"
                                    disabled={isSubmitting}
                                />
                                {errors.contactEmail && (
                                    <p className="mt-1 text-xs text-red-400">{errors.contactEmail}</p>
                                )}
                            </div>
                            <div>
                                <FieldLabel icon={Phone} optional>
                                    Phone
                                </FieldLabel>
                                <input
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="+1 555…"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-app-border">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-app-accent hover:bg-app-accent-hover text-app-accent-text font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {mode === 'add' ? 'Adding…' : 'Updating…'}
                                </>
                            ) : (
                                <>
                                    {mode === 'add' ? (
                                        <PlusCircle className="w-4 h-4" />
                                    ) : (
                                        <Edit className="w-4 h-4" />
                                    )}
                                    {mode === 'add' ? 'Add job' : 'Save changes'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-app-accent-muted hover:bg-app-accent-muted text-app-muted font-semibold rounded-lg transition-all"
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

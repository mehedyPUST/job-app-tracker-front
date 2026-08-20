// src/app/(dashboard)/profile/page.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
    User, Mail, Phone, MapPin, Briefcase, Globe, Save, Camera, Loader2,
    CheckCircle, AlertCircle, Edit2, X, Award, FileText, Link2, Languages,
    GraduationCap, Heart, Sparkles, Clock, DollarSign, Target, Image as ImageIcon, Trash2
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const InfoRow = ({ label, value, icon: Icon, link = false }) => (
    <div className="flex items-start gap-3 py-2 border-b border-[#00684A]/10 last:border-0">
        <Icon className="w-5 h-5 text-[#00ED64] flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            {link ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#00ED64] hover:underline text-sm truncate block">
                    {value || 'Not specified'}
                </a>
            ) : (
                <p className="text-white break-words">{value || 'Not specified'}</p>
            )}
        </div>
    </div>
);

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, setUser } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', location: '', bio: '', website: '',
        currentPosition: '', company: '', experience: '', education: '', skills: [],
        github: '', linkedin: '', twitter: '', jobTypes: [], preferredLocations: [],
        openToWork: true, remotePreference: 'hybrid', salaryExpectation: '',
        languages: [], certifications: [], interests: []
    });

    const [originalData, setOriginalData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user && isAuthenticated) fetchProfile();
    }, [user, isAuthenticated]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.getProfile();
            if (response.success && response.profile) {
                const data = response.profile;
                const mappedData = {
                    name: data.name || user?.name || '',
                    email: data.email || user?.email || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    bio: data.bio || '',
                    website: data.website || '',
                    currentPosition: data.currentPosition || '',
                    company: data.company || '',
                    experience: data.experience || '',
                    education: data.education || '',
                    skills: data.skills || [],
                    github: data.github || '',
                    linkedin: data.linkedin || '',
                    twitter: data.twitter || '',
                    jobTypes: data.jobTypes || [],
                    preferredLocations: data.preferredLocations || [],
                    openToWork: data.openToWork !== undefined ? data.openToWork : true,
                    remotePreference: data.remotePreference || 'hybrid',
                    salaryExpectation: data.salaryExpectation || '',
                    languages: data.languages || [],
                    certifications: data.certifications || [],
                    interests: data.interests || []
                };
                setFormData(mappedData);
                setOriginalData(mappedData);
                setAvatarUrl(data.avatar || '');
            } else {
                const fallback = { name: user?.name || '', email: user?.email || '', phone: '', location: '', bio: '', website: '', currentPosition: '', company: '', experience: '', education: '', skills: [], github: '', linkedin: '', twitter: '', jobTypes: [], preferredLocations: [], openToWork: true, remotePreference: 'hybrid', salaryExpectation: '', languages: [], certifications: [], interests: [] };
                setFormData(fallback);
                setOriginalData(fallback);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            const fallback = { name: user?.name || '', email: user?.email || '', phone: '', location: '', bio: '', website: '', currentPosition: '', company: '', experience: '', education: '', skills: [], github: '', linkedin: '', twitter: '', jobTypes: [], preferredLocations: [], openToWork: true, remotePreference: 'hybrid', salaryExpectation: '', languages: [], certifications: [], interests: [] };
            setFormData(fallback);
            setOriginalData(fallback);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            setTimeout(() => setError(''), 3000);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            setTimeout(() => setError(''), 3000);
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);
        setError('');
        try {
            const interval = setInterval(() => {
                setUploadProgress(prev => { if (prev >= 90) { clearInterval(interval); return 90; } return prev + 10; });
            }, 200);
            const result = await api.uploadImage(file);
            clearInterval(interval);
            setUploadProgress(100);
            if (result.success) {
                setAvatarUrl(result.url);
                setSuccess('Profile picture uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
                await saveAvatarToProfile(result.url);
            } else {
                setError(result.message || 'Failed to upload image');
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Failed to upload image. Please try again.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const saveAvatarToProfile = async (avatarUrl) => {
        try {
            const response = await api.updateProfile({ ...formData, avatar: avatarUrl });
            if (response && response.success && setUser && response.user) {
                setUser(response.user);
            }
        } catch (error) {
            console.error('Error saving avatar:', error);
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarUrl('');
        setSuccess('Profile picture removed');
        setTimeout(() => setSuccess(''), 3000);
        try {
            await api.updateProfile({ ...formData, avatar: '' });
        } catch (error) {
            console.error('Error removing avatar:', error);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleArrayChange = (e, field) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(Boolean)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
                website: formData.website,
                currentPosition: formData.currentPosition,
                company: formData.company,
                experience: formData.experience,
                education: formData.education,
                skills: formData.skills,
                github: formData.github,
                linkedin: formData.linkedin,
                twitter: formData.twitter,
                jobTypes: formData.jobTypes,
                preferredLocations: formData.preferredLocations,
                openToWork: formData.openToWork,
                remotePreference: formData.remotePreference,
                salaryExpectation: formData.salaryExpectation,
                languages: formData.languages,
                certifications: formData.certifications,
                interests: formData.interests,
                avatar: avatarUrl
            };

            console.log('📤 Sending update data:', updateData);

            const response = await api.updateProfile(updateData);
            console.log('📥 Update response:', response);

            if (!response) {
                setError('No response from server. Please try again.');
                setTimeout(() => setError(''), 3000);
                return;
            }

            if (response.success === true) {
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                setOriginalData(formData);
                if (setUser && response.user) setUser(response.user);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorMsg = response?.message || 'Failed to update profile';
                console.error('❌ Update failed:', errorMsg);
                setError(errorMsg);
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            console.error('❌ Update profile error:', err);
            setError(err?.message || 'Failed to update profile. Please try again.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = () => {
        setOriginalData(formData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-[#001E2B] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#00ED64] animate-spin mx-auto" />
                <p className="text-gray-400 mt-4">Loading profile...</p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const calculateCompletion = () => {
        let score = 0;
        if (formData.name) score += 8;
        if (formData.phone) score += 6;
        if (formData.location) score += 6;
        if (formData.bio) score += 6;
        if (formData.currentPosition) score += 6;
        if (formData.company) score += 6;
        if (formData.skills.length > 0) score += 8;
        if (formData.github) score += 4;
        if (formData.linkedin) score += 4;
        if (formData.twitter) score += 4;
        if (formData.jobTypes.length > 0) score += 6;
        if (formData.salaryExpectation) score += 4;
        if (formData.languages.length > 0) score += 4;
        if (formData.certifications.length > 0) score += 4;
        if (formData.interests.length > 0) score += 4;
        if (formData.experience) score += 4;
        if (formData.education) score += 4;
        if (formData.website) score += 3;
        if (avatarUrl) score += 5;
        return Math.min(score, 100);
    };

    const completionScore = calculateCompletion();

    return (
        <div className="min-h-screen bg-[#001E2B] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Profile</h1>
                        <p className="text-gray-400 mt-1">Manage your personal information and job preferences</p>
                    </div>
                    {!isEditing ? (
                        <button onClick={handleEditClick} className="px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={handleCancel} className="px-4 py-2 bg-[#00684A]/20 hover:bg-[#00684A]/30 text-gray-300 font-semibold rounded-lg transition-all">Cancel</button>
                            <button onClick={handleSubmit} disabled={isSaving} className="px-4 py-2 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-semibold rounded-lg transition-all shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-[#00ED64]/10 border border-[#00ED64]/20 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fadeIn">
                        <CheckCircle className="w-5 h-5 text-[#00ED64]" />
                        <p className="text-[#00ED64]">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fadeIn">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Profile Content */}
                <div className="space-y-6">
                    {/* Profile Header with Avatar Upload */}
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-[#00ED64]/20 flex items-center justify-center text-3xl font-bold text-[#00ED64] border-2 border-[#00684A]/30 overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = getInitials(formData.name); }} />
                                    ) : (
                                        getInitials(formData.name)
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute bottom-0 right-0 p-2 bg-[#00ED64] text-[#001E2B] rounded-full hover:bg-[#00ED64]/90 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed" title="Upload Profile Picture">
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        {avatarUrl && (
                                            <button onClick={handleRemoveAvatar} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all" title="Remove Profile Picture">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            {isUploading && (
                                <div className="w-full max-w-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-[#001E2B] rounded-full h-2">
                                            <div className="bg-[#00ED64] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                        <span className="text-xs text-gray-400">{uploadProgress}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Uploading image...</p>
                                </div>
                            )}
                            <div className="flex-1">
                                {isEditing ? (
                                    <input name="name" value={formData.name} onChange={handleChange} className="text-xl font-semibold text-white bg-[#001E2B] border border-[#00684A]/30 rounded-lg px-3 py-1.5 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="Your full name" />
                                ) : (
                                    <h2 className="text-xl font-semibold text-white">{formData.name || 'Your Name'}</h2>
                                )}
                                <p className="text-gray-400">{formData.email}</p>
                                {!isEditing && formData.currentPosition && (
                                    <p className="text-[#00ED64] text-sm mt-1">{formData.currentPosition} {formData.company ? `at ${formData.company}` : ''}</p>
                                )}
                                {isEditing && (
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        <input name="currentPosition" value={formData.currentPosition} onChange={handleChange} className="text-sm bg-[#001E2B] border border-[#00684A]/30 rounded-lg px-3 py-1.5 w-48 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="Position" />
                                        <input name="company" value={formData.company} onChange={handleChange} className="text-sm bg-[#001E2B] border border-[#00684A]/30 rounded-lg px-3 py-1.5 w-48 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="Company" />
                                    </div>
                                )}
                            </div>
                            {formData.openToWork && !isEditing && (
                                <div>
                                    <span className="px-3 py-1 bg-[#00ED64]/20 text-[#00ED64] rounded-full text-sm font-medium border border-[#00ED64]/20 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" /> Open to Work
                                    </span>
                                </div>
                            )}
                            {isEditing && (
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="openToWork" checked={formData.openToWork} onChange={handleChange} className="w-4 h-4 bg-[#001E2B] border-[#00684A]/30 rounded text-[#00ED64] focus:ring-[#00ED64] focus:ring-offset-0" />
                                        <span className="text-sm text-gray-300">Open to Work</span>
                                    </label>
                                </div>
                            )}
                        </div>
                        {isEditing && !avatarUrl && !isUploading && (
                            <div className="mt-4 text-xs text-gray-500 border-t border-[#00684A]/20 pt-3">
                                <span className="flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Click the camera icon to upload a profile picture (JPG, PNG, GIF, max 5MB)</span>
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#00ED64]" /> Personal Information</h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label><input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="+1 234 567 8900" /></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label><input name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="City, Country" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent resize-none" placeholder="Tell employers about yourself..." /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-1.5">Website</label><input name="website" type="url" value={formData.website} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="https://your-portfolio.com" /></div>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                <InfoRow label="Phone" value={formData.phone} icon={Phone} />
                                <InfoRow label="Location" value={formData.location} icon={MapPin} />
                                <InfoRow label="Bio" value={formData.bio} icon={User} />
                                <InfoRow label="Website" value={formData.website} icon={Globe} link={true} />
                            </div>
                        )}
                    </div>

                    {/* Professional Information */}
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#00ED64]" /> Professional Information</h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Skills</label><input value={formData.skills.join(', ')} onChange={(e) => handleArrayChange(e, 'skills')} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="React, Node.js, MongoDB (comma separated)" /><p className="text-xs text-gray-500 mt-1">Separate skills with commas</p></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Experience</label><textarea name="experience" value={formData.experience} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent resize-none" placeholder="Your experience summary..." /></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Education</label><textarea name="education" value={formData.education} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent resize-none" placeholder="Your education background..." /></div>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                <InfoRow label="Skills" value={formData.skills.join(', ')} icon={FileText} />
                                <InfoRow label="Experience" value={formData.experience} icon={Clock} />
                                <InfoRow label="Education" value={formData.education} icon={GraduationCap} />
                            </div>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Link2 className="w-5 h-5 text-[#00ED64]" /> Social Links</h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">GitHub</label><input name="github" value={formData.github} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="https://github.com/username" /></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn</label><input name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="https://linkedin.com/in/username" /></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Twitter/X</label><input name="twitter" value={formData.twitter} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="https://twitter.com/username" /></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3"><FaGithub className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-500">GitHub</p><a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-[#00ED64] hover:underline text-sm truncate block max-w-[200px]">{formData.github || 'Not provided'}</a></div></div>
                                <div className="flex items-center gap-3"><FaLinkedin className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-500">LinkedIn</p><a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#00ED64] hover:underline text-sm truncate block max-w-[200px]">{formData.linkedin || 'Not provided'}</a></div></div>
                                <div className="flex items-center gap-3"><FaTwitter className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-500">Twitter/X</p><a href={formData.twitter} target="_blank" rel="noopener noreferrer" className="text-[#00ED64] hover:underline text-sm truncate block max-w-[200px]">{formData.twitter || 'Not provided'}</a></div></div>
                            </div>
                        )}
                    </div>

                    {/* Job Preferences */}
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-[#00ED64]" /> Job Preferences</h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Remote Preference</label><select name="remotePreference" value={formData.remotePreference} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent"><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="on-site">On-site</option></select></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Salary Expectation</label><input name="salaryExpectation" value={formData.salaryExpectation} onChange={handleChange} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="$120,000 - $150,000" /></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Preferred Job Types</label><input value={formData.jobTypes.join(', ')} onChange={(e) => handleArrayChange(e, 'jobTypes')} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="Full-time, Contract, Freelance" /><p className="text-xs text-gray-500 mt-1">Separate with commas</p></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Preferred Locations</label><input value={formData.preferredLocations.join(', ')} onChange={(e) => handleArrayChange(e, 'preferredLocations')} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="New York, Remote, London" /><p className="text-xs text-gray-500 mt-1">Separate with commas</p></div>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                <InfoRow label="Remote Preference" value={formData.remotePreference} icon={MapPin} />
                                <InfoRow label="Salary Expectation" value={formData.salaryExpectation} icon={DollarSign} />
                                <InfoRow label="Preferred Job Types" value={formData.jobTypes.join(', ')} icon={FileText} />
                                <InfoRow label="Preferred Locations" value={formData.preferredLocations.join(', ')} icon={MapPin} />
                            </div>
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-[#00ED64]" /> Additional Information</h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Languages</label><input value={formData.languages.join(', ')} onChange={(e) => handleArrayChange(e, 'languages')} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="English (Fluent), Spanish (Conversational)" /><p className="text-xs text-gray-500 mt-1">Separate with commas</p></div>
                                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Certifications</label><input value={formData.certifications.join(', ')} onChange={(e) => handleArrayChange(e, 'certifications')} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="AWS Certified, Google Cloud Professional" /><p className="text-xs text-gray-500 mt-1">Separate with commas</p></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-1.5">Interests / Hobbies</label><input value={formData.interests.join(', ')} onChange={(e) => handleArrayChange(e, 'interests')} className="w-full px-3 py-2 bg-[#001E2B] border border-[#00684A]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent" placeholder="Open Source, Reading, Hiking" /><p className="text-xs text-gray-500 mt-1">Separate with commas</p></div>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                <InfoRow label="Languages" value={formData.languages.join(', ')} icon={Languages} />
                                <InfoRow label="Certifications" value={formData.certifications.join(', ')} icon={Award} />
                                <InfoRow label="Interests" value={formData.interests.join(', ')} icon={Heart} />
                            </div>
                        )}
                    </div>

                    {/* Profile Completion */}
                    {!isEditing && (
                        <div className="bg-[#002433] rounded-2xl border border-[#00684A]/30 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-400">Profile Completion</h3>
                                <span className="text-sm font-medium text-[#00ED64]">{completionScore}%</span>
                            </div>
                            <div className="w-full bg-[#001E2B] rounded-full h-2.5">
                                <div className="bg-[#00ED64] h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionScore}%` }} />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                    {completionScore < 30 && 'Start adding your details'}
                                    {completionScore >= 30 && completionScore < 60 && 'Good progress, keep going!'}
                                    {completionScore >= 60 && completionScore < 80 && 'Almost complete!'}
                                    {completionScore >= 80 && '🎉 Your profile is complete!'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {completionScore < 100 && `${100 - completionScore}% remaining`}
                                    {completionScore === 100 && '✨ Complete'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
// src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
    // ========== AUTH ==========
    async register(data) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async login(data) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async logout() {
        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async getMe() {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('GetMe error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async demoLogin(role) {
        try {
            const response = await fetch(`${API_URL}/auth/demo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Demo login error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    // ========== USER PROFILE ==========
    async getProfile() {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('GetProfile error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    // ✅ FIXED: handle response properly
    async updateProfile(data) {
        try {
            console.log('📤 API Call: updateProfile', data);
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            const responseText = await response.text();
            console.log('📥 Raw response:', responseText);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ JSON parse error:', e);
                return { success: false, message: 'Invalid server response' };
            }

            if (!response.ok) {
                return {
                    success: false,
                    message: responseData?.message || `HTTP error ${response.status}`,
                    status: response.status
                };
            }

            if (responseData && responseData.success === true) {
                return { success: true, ...responseData };
            }

            return {
                success: false,
                message: responseData?.message || 'Failed to update profile',
                data: responseData
            };
        } catch (error) {
            console.error('❌ UpdateProfile network error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    // ========== JOBS ==========
    async getJobs() {
        try {
            const response = await fetch(`${API_URL}/jobs`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('GetJobs error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async getJob(id) {
        try {
            const response = await fetch(`${API_URL}/jobs/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('GetJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async createJob(data) {
        try {
            const response = await fetch(`${API_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('CreateJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async updateJob(id, data) {
        try {
            const response = await fetch(`${API_URL}/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('UpdateJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async updateJobStatus(id, status, date = null) {
        try {
            if (!id || !status) return { success: false, message: 'Job ID and status are required' };
            const body = { status };
            if (date) body.date = date;
            const response = await fetch(`${API_URL}/jobs/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) return { success: false, message: data.message || `HTTP error ${response.status}` };
            if (data.success === false) return { success: false, message: data.message || 'Update failed' };
            return { success: true, ...data };
        } catch (error) {
            console.error('❌ UpdateJobStatus error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async addJobStatus(id, status, date = null) {
        try {
            if (!id || !status) return { success: false, message: 'Job ID and status are required' };
            const body = { status };
            if (date) body.date = date;
            const response = await fetch(`${API_URL}/jobs/${id}/status-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) return { success: false, message: data.message || `HTTP error ${response.status}` };
            return data;
        } catch (error) {
            console.error('❌ AddJobStatus error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async removeJobStatus(id, status) {
        try {
            if (!id || !status) return { success: false, message: 'Job ID and status are required' };
            const response = await fetch(`${API_URL}/jobs/${id}/status-history/${status}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, message: data.message || `HTTP error ${response.status}` };
            return data;
        } catch (error) {
            console.error('❌ RemoveJobStatus error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async updateJobStatusDate(id, status, date) {
        try {
            if (!id || !status) return { success: false, message: 'Job ID and status are required' };
            const response = await fetch(`${API_URL}/jobs/${id}/status-history/${status}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: date || null }),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) return { success: false, message: data.message || `HTTP error ${response.status}` };
            return data;
        } catch (error) {
            console.error('❌ UpdateJobStatusDate error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async deleteJob(id) {
        try {
            const response = await fetch(`${API_URL}/jobs/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('DeleteJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async getJobStats() {
        try {
            const response = await fetch(`${API_URL}/jobs/stats/summary`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('GetJobStats error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    // ========== IMAGE UPLOAD (IMGBB) ==========
    async uploadImage(imageFile) {
        try {
            console.log('📤 Uploading image to ImageBB:', imageFile.name);
            if (!imageFile) return { success: false, message: 'No image file provided' };
            if (!imageFile.type.startsWith('image/')) {
                return { success: false, message: 'Please select an image file (JPG, PNG, GIF, etc.)' };
            }
            if (imageFile.size > 5 * 1024 * 1024) {
                return { success: false, message: 'Image size should be less than 5MB' };
            }
            const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
            if (!apiKey) {
                console.error('❌ IMGBB_API_KEY not found');
                return { success: false, message: 'API key not configured' };
            }
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('key', apiKey);
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            console.log('📥 ImageBB Response:', data);
            if (data.success) {
                return {
                    success: true,
                    url: data.data.url,
                    thumb: data.data.thumb?.url || data.data.url,
                    display_url: data.data.display_url || data.data.url
                };
            } else {
                return { success: false, message: data.error?.message || 'Upload failed' };
            }
        } catch (error) {
            console.error('❌ Image upload error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    // ========== ADMIN ==========
    async getUsers(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    queryParams.set(k, String(v));
                }
            });
            const qs = queryParams.toString();
            const url = qs ? `${API_URL}/users?${qs}` : `${API_URL}/users`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Failed to load users (${response.status})`,
                };
            }
            return data;
        } catch (error) {
            console.error('GetUsers error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async updateUserRole(id, role) {
        try {
            const response = await fetch(`${API_URL}/users/${String(id)}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
                credentials: 'include',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Failed to update role (${response.status})`,
                };
            }
            return data;
        } catch (error) {
            console.error('UpdateUserRole error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async deleteUser(id) {
        try {
            const response = await fetch(`${API_URL}/users/${String(id)}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Failed to delete user (${response.status})`,
                };
            }
            return data;
        } catch (error) {
            console.error('DeleteUser error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    // ========== INTERVIEW Q&A ==========
    async getInterviewQA(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') queryParams.set(k, v);
            });
            const qs = queryParams.toString();
            const url = qs ? `${API_URL}/interview-qa?${qs}` : `${API_URL}/interview-qa`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            return await response.json();
        } catch (error) {
            console.error('getInterviewQA error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async createInterviewQA(data) {
        try {
            const response = await fetch(`${API_URL}/interview-qa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return await response.json();
        } catch (error) {
            console.error('createInterviewQA error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async updateInterviewQA(id, data) {
        try {
            const response = await fetch(`${API_URL}/interview-qa/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return await response.json();
        } catch (error) {
            console.error('updateInterviewQA error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },


    async addInterviewComment(postId, text) {
        try {
            const response = await fetch(`${API_URL}/interview-qa/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
                credentials: 'include',
            });
            return await response.json();
        } catch (error) {
            console.error('addInterviewComment error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async deleteInterviewComment(postId, commentId) {
        try {
            const response = await fetch(`${API_URL}/interview-qa/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            return await response.json();
        } catch (error) {
            console.error('deleteInterviewComment error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async deleteInterviewQA(id) {
        try {
            const response = await fetch(`${API_URL}/interview-qa/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            return await response.json();
        } catch (error) {
            console.error('deleteInterviewQA error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

// ========== PUBLIC JOB BOARD ==========
    async getPublicJobs(params = {}) {
        try {
            const qs = new URLSearchParams();
            if (params.q) qs.set('q', params.q);
            if (params.location) qs.set('location', params.location);
            if (params.page) qs.set('page', params.page);
            if (params.limit) qs.set('limit', params.limit);
            const query = qs.toString();
            const url = query ? `${API_URL}/public-jobs?${query}` : `${API_URL}/public-jobs`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            return await response.json();
        } catch (error) {
            console.error('getPublicJobs error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async getPublicJob(id) {
        try {
            const response = await fetch(`${API_URL}/public-jobs/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            return await response.json();
        } catch (error) {
            console.error('getPublicJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async createPublicJob(data) {
        try {
            const response = await fetch(`${API_URL}/public-jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return await response.json();
        } catch (error) {
            console.error('createPublicJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async updatePublicJob(id, data) {
        try {
            const response = await fetch(`${API_URL}/public-jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return await response.json();
        } catch (error) {
            console.error('updatePublicJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async deletePublicJob(id) {
        try {
            const response = await fetch(`${API_URL}/public-jobs/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            return await response.json();
        } catch (error) {
            console.error('deletePublicJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },

    async trackPublicJob(id, status = 'no_action') {
        try {
            const response = await fetch(`${API_URL}/public-jobs/${id}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include',
            });
            return await response.json();
        } catch (error) {
            console.error('trackPublicJob error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    },
};

export default api;

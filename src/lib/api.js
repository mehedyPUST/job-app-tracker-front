// src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
    // Auth endpoints
    async register(data) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async login(data) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async logout() {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        return response.json();
    },

    async getMe() {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });
        return response.json();
    },

    async demoLogin(role) {
        const response = await fetch(`${API_URL}/auth/demo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
            credentials: 'include'
        });
        return response.json();
    },

    // User profile endpoints
    async getProfile() {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    async updateProfile(data) {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    // Jobs endpoints
    async getJobs() {
        const response = await fetch(`${API_URL}/jobs`, {
            credentials: 'include'
        });
        return response.json();
    },

    async getJob(id) {
        const response = await fetch(`${API_URL}/jobs/${id}`, {
            credentials: 'include'
        });
        return response.json();
    },

    async createJob(data) {
        const response = await fetch(`${API_URL}/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async updateJob(id, data) {
        const response = await fetch(`${API_URL}/jobs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async updateJobStatus(id, status) {
        const response = await fetch(`${API_URL}/jobs/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include'
        });
        return response.json();
    },

    async deleteJob(id) {
        const response = await fetch(`${API_URL}/jobs/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.json();
    }
};
// src/components/jobs/JobFilters.jsx
'use client';

import { Search, X } from 'lucide-react';

export default function JobFilters({
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    onClearFilters
}) {
    const hasFilters = searchTerm || filterStatus !== 'all';

    return (
        <div className="bg-app-card rounded-xl border border-app-border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted-2" />
                    <input
                        type="text"
                        placeholder="Search by title, company, location, or skills..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent focus:border-transparent transition-colors"
                    />
                </div>
                {hasFilters && (
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
}
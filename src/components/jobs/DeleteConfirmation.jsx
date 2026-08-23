// src/components/jobs/DeleteConfirmation.jsx
'use client';

import { useState } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmation({ isOpen, onClose, onConfirm }) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-app-card rounded-2xl border border-app-border max-w-md w-full p-6 shadow-2xl animate-fadeIn">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-app-text mb-2">Delete Job?</h2>
                    <p className="text-app-muted mb-6">
                        Are you sure you want to delete this job? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-app-accent-muted hover:bg-app-accent-muted text-app-muted font-semibold rounded-lg transition-all"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-app-text font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
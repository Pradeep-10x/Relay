import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Inter } from 'next/font/google';

const firaSans = Inter({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

interface CreateIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onSuccess?: () => void;
}

export function CreateIssueModal({ isOpen, onClose, projectId, onSuccess }: CreateIssueModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const res = await apiFetch(`/api/v1/projects/${projectId}/issues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, priority })
            });

            if (res.ok) {
                setTitle('');
                setDescription('');
                setPriority('MEDIUM');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to create issue');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the issue');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className={`fixed inset-0 bg-zinc-900/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4 font-sans ${firaSans.className}`}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: -20, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-pop overflow-hidden flex flex-col"
                >
                    <header className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold tracking-tight text-zinc-900">Create new issue</h2>
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </header>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                        
                        {error && (
                            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[13px] font-medium flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[12px] font-medium text-zinc-600">Issue title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="E.g., Implement authentication flows..."
                                className="w-full h-11 px-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[14px] text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors placeholder:text-zinc-400"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-medium text-zinc-600">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add context and details..."
                                className="w-full min-h-[120px] p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[14px] text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors placeholder:text-zinc-400 resize-y"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-medium text-zinc-600">Priority</label>
                            <div className="grid grid-cols-3 gap-2.5">
                                {['LOW', 'MEDIUM', 'HIGH'].map((p) => {
                                    const isActive = priority === p;
                                    const activeClass =
                                        p === 'HIGH' ? 'bg-rose-50 border-rose-300 text-rose-600' :
                                        p === 'MEDIUM' ? 'bg-amber-50 border-amber-300 text-amber-700' :
                                        'bg-emerald-50 border-emerald-300 text-emerald-700';

                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p as any)}
                                            className={`h-10 flex items-center justify-center rounded-lg border text-[12px] font-semibold tracking-wide transition-all ${
                                                isActive ? activeClass : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-10 px-5 rounded-lg border border-zinc-200 text-zinc-600 text-[13px] font-medium hover:bg-zinc-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-10 px-5 rounded-lg bg-zinc-900 text-white text-[13px] font-medium tracking-wide hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                            >
                                {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                                Create issue
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

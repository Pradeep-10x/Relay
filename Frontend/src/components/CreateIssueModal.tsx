import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Fira_Sans } from 'next/font/google';

const firaSans = Fira_Sans({
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
                className={`fixed inset-0 bg-black/80 z-[120] backdrop-blur-sm flex items-center justify-center p-4 font-sans ${firaSans.className}`}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: -20, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-[#0a0a0c] border border-zinc-800/80 rounded-xl shadow-2xl shadow-black overflow-hidden flex flex-col"
                >
                    <header className="px-6 py-5 border-b border-zinc-800/60 flex items-center justify-between">
                        <h2 className="text-[17px] font-bold tracking-wide text-zinc-100">Create New Issue</h2>
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </header>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                        
                        {error && (
                            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-medium flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Issue Title</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="E.g., Implement authentication flows..."
                                className="w-full h-11 px-4 rounded-lg bg-black border border-zinc-800 text-[14px] text-zinc-100 outline-none focus:border-zinc-600 transition-colors shadow-sm placeholder:text-zinc-600"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                            <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add context and details..."
                                className="w-full min-h-[120px] p-4 rounded-lg bg-black border border-zinc-800 text-[14px] text-zinc-100 outline-none focus:border-zinc-600 transition-colors shadow-sm placeholder:text-zinc-600 resize-y"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Priority Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['LOW', 'MEDIUM', 'HIGH'].map((p) => {
                                    const isActive = priority === p;
                                    const activeClass = 
                                        p === 'HIGH' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                        p === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                        'bg-sky-500/10 border-sky-500/30 text-sky-400';

                                    return (
                                        <button 
                                            key={p} 
                                            type="button"
                                            onClick={() => setPriority(p as any)}
                                            className={`h-10 flex items-center justify-center rounded-lg border text-[11px] font-bold tracking-wide transition-all ${
                                                isActive ? activeClass : 'border-zinc-800 bg-black text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 mt-2">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="h-10 px-5 rounded-lg border border-zinc-800 text-zinc-400 text-[13px] font-bold hover:bg-zinc-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="h-10 px-6 rounded-lg bg-zinc-100 text-zinc-900 text-[13px] font-bold tracking-wide hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                                Create Issue
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

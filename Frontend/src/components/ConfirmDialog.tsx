'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    /** If set, the user must type this exact string to enable the confirm button. */
    confirmPhrase?: string;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    confirmPhrase,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    const [typed, setTyped] = useState('');
    const [isWorking, setIsWorking] = useState(false);

    const canConfirm = !confirmPhrase || typed.trim() === confirmPhrase;

    const handleConfirm = async () => {
        if (!canConfirm || isWorking) return;
        setIsWorking(true);
        try {
            await onConfirm();
        } finally {
            setIsWorking(false);
            setTyped('');
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[140] bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.96, y: 12, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 8, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-pop overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-3.5">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-rose-50 text-rose-600' : 'bg-zinc-100 text-zinc-700'}`}>
                                    <AlertTriangle size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight">{title}</h3>
                                    {description && (
                                        <div className="text-[13.5px] text-zinc-500 mt-1 leading-relaxed">{description}</div>
                                    )}
                                </div>
                                <button onClick={onClose} className="p-1 -mt-1 -mr-1 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {confirmPhrase && (
                                <div className="mt-4 space-y-1.5">
                                    <label className="text-[12px] text-zinc-500">
                                        Type <span className="font-semibold text-zinc-800">{confirmPhrase}</span> to confirm
                                    </label>
                                    <input
                                        value={typed}
                                        onChange={(e) => setTyped(e.target.value)}
                                        autoFocus
                                        className="w-full h-10 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[14px] text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="h-9 px-4 rounded-lg border border-zinc-200 bg-white text-zinc-600 text-[13px] font-medium hover:bg-zinc-100 transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!canConfirm || isWorking}
                                className={`h-9 px-4 rounded-lg text-white text-[13px] font-medium transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                                    danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-zinc-900 hover:bg-zinc-800'
                                }`}
                            >
                                {isWorking && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

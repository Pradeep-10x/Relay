'use client';

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { useUser } from '@/hooks/useUser';
import { apiFetch } from '@/lib/api';
import { Check, AlertCircle, Save, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const firaSans = Inter({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, type: "spring", stiffness: 260, damping: 20 }
    }
} as any;

const itemVariants = {
    hidden: { opacity: 0, y: 15, rotate: -1 },
    show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as any;

export default function SettingsPage() {
    const { user, refresh } = useUser();
    
    // Profile State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Avatar upload
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Security State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Messages
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initialize forms
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setUsername(user.username || '');
        }
    }, [user]);

    const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfileMessage(null);

        if (!file.type.startsWith('image/')) {
            setProfileMessage({ type: 'error', text: 'Please choose an image file.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setProfileMessage({ type: 'error', text: 'Image must be under 5MB.' });
            return;
        }

        setIsUploadingAvatar(true);
        try {
            // 1. Ask the backend for a presigned upload URL + object key
            const urlRes = await apiFetch('/api/v1/user/avatar/upload-url', { method: 'POST' });
            if (!urlRes.ok) throw new Error('Could not start the upload.');
            const { uploadUrl, key } = await urlRes.json();

            // 2. Upload the file straight to storage (presigned for image/png)
            const putRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/png' },
                body: file,
            });
            if (!putRes.ok) throw new Error('Upload failed. Please try again.');

            // 3. Persist the new avatar key
            const saveRes = await apiFetch('/api/v1/user/avatar', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });
            if (!saveRes.ok) throw new Error('Could not save the new avatar.');

            setProfileMessage({ type: 'success', text: 'Avatar updated.' });
            refresh();
        } catch (err: any) {
            setProfileMessage({ type: 'error', text: err.message || 'Avatar upload failed.' });
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);
        setIsUpdatingProfile(true);

        try {
            const res = await apiFetch('/api/v1/user/edit-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username })
            });

            if (res.ok) {
                setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
                refresh(); // Refresh globally
            } else {
                const data = await res.json();
                setProfileMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
            }
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message || 'An error occurred.' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSecurityMessage(null);

        if (newPassword !== confirmPassword) {
            setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setIsUpdatingPassword(true);

        try {
            const res = await apiFetch('/api/v1/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            if (res.ok) {
                setSecurityMessage({ type: 'success', text: 'Password saved successfully.' });
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await res.json();
                setSecurityMessage({ type: 'error', text: data.message || 'Failed to change password.' });
            }
        } catch (error: any) {
            setSecurityMessage({ type: 'error', text: error.message || 'An error occurred.' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className={`relative min-h-full font-sans ${firaSans.className}`}>
            <div className="relative z-10 p-8 w-full max-w-3xl mx-auto space-y-10">
                <motion.header
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
                    <p className="text-[13px] text-zinc-500 mt-1">Manage your account settings and preferences.</p>
                </motion.header>

                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show" 
                    className="space-y-10"
                >
                    {/* Profile Section */}
                    <motion.section variants={itemVariants} className="space-y-6">
                        <div>
                            <h2 className="text-[13px] font-semibold text-zinc-900 mb-5 flex items-center gap-4">
                                General profile
                                <span className="flex-1 h-px bg-zinc-200" />
                            </h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-zinc-950 border border-zinc-200 shadow-card rounded-2xl p-8 sm:p-10 space-y-6">
                            
                            <AnimatePresence>
                                {profileMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} 
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold tracking-wide border ${
                                            profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                                        }`}>
                                            {profileMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                            {profileMessage.text}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 relative group focus-within:z-10">
                                    <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 transition-all shadow-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 relative group focus-within:z-10">
                                    <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Username</label>
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 transition-all shadow-sm"
                                        required
                                        minLength={3}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[13px] font-semibold text-zinc-700 ml-1">Avatar</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full overflow-hidden ring-1 ring-zinc-200 bg-zinc-100 shrink-0">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[16px] font-semibold text-zinc-500">
                                                    {(user?.name || 'U').slice(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelected} className="hidden" />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingAvatar}
                                                className="h-9 px-4 rounded-lg border border-zinc-200 bg-white text-zinc-700 text-[13px] font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isUploadingAvatar ? <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /> : <Upload size={15} />}
                                                {isUploadingAvatar ? 'Uploading…' : 'Upload image'}
                                            </button>
                                            <p className="text-[12px] text-zinc-500 mt-1.5 ml-0.5">PNG or JPG, up to 5MB.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end items-center">
                                <button 
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="h-11 px-6 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingProfile ? (
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </motion.section>

                    {/* Security Section */}
                    <motion.section variants={itemVariants} className="space-y-6">
                        <div>
                            <h2 className="text-[13px] font-semibold text-zinc-900 mb-5 flex items-center gap-4">
                                Security
                                <span className="flex-1 h-px bg-zinc-200" />
                            </h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-zinc-950 border border-zinc-200 shadow-card rounded-2xl p-8 sm:p-10 space-y-6">
                            
                            <AnimatePresence>
                                {securityMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} 
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold tracking-wide border ${
                                            securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                                        }`}>
                                            {securityMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                            {securityMessage.text}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-6 max-w-sm">
                                <div className="space-y-2 relative group focus-within:z-10">
                                    <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Current Password</label>
                                    <input 
                                        type="password" 
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 transition-all shadow-sm"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="space-y-2 relative group focus-within:z-10">
                                    <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 ml-1">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 transition-all shadow-sm"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="space-y-2 relative group focus-within:z-10">
                                    <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 transition-all shadow-sm"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center">
                                <button 
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="h-11 px-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all text-sm font-medium tracking-wide flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingPassword ? (
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
}

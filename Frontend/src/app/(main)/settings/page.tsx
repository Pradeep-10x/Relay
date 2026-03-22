'use client';

import React, { useState, useEffect } from 'react';
import { Fira_Sans } from 'next/font/google';
import { useUser } from '@/hooks/useUser';
import { apiFetch } from '@/lib/api';
import { Check, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const firaSans = Fira_Sans({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

// Floating Paths matching the Auth Page style for background texture
function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(15,23,42,${0.1 + i * 0.03})`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0 opacity-[0.14] overflow-hidden mix-blend-screen scale-[1.3] -translate-y-32">
			<svg
				className="h-full w-full text-slate-950 dark:text-white"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}

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
    const [avatar, setAvatar] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    
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
            setAvatar(user.avatar || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);
        setIsUpdatingProfile(true);

        try {
            const res = await apiFetch('/api/v1/user/edit-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, avatar })
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
            <FloatingPaths position={1} />
            <div className="absolute inset-0 bg-transparent dark:bg-black/30 pointer-events-none" />

            <div className="relative z-10 p-8 w-full max-w-3xl mx-auto space-y-12">
                <motion.header 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Manage your account settings and preferences.</p>
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
                            <h2 className="text-[12px] font-bold font-mono tracking-[0.16em] uppercase text-zinc-400 dark:text-zinc-500 mb-6 flex items-center gap-4">
                                General Profile
                                <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800/80" />
                            </h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-md p-8 sm:p-10 space-y-6">
                            
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

                                <div className="space-y-2 md:col-span-2 relative group focus-within:z-10">
                                    <label className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Avatar Image URL</label>
                                    <input 
                                        type="url" 
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 transition-all shadow-sm"
                                    />
                                    <p className="text-[12px] font-medium text-zinc-500 mt-1.5 ml-1">Provide a direct link to an image to update your avatar.</p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end items-center">
                                <button 
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="h-11 px-6 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
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
                            <h2 className="text-[12px] font-bold font-mono tracking-[0.16em] uppercase text-zinc-400 dark:text-zinc-500 mb-6 flex items-center gap-4">
                                Security
                                <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800/80" />
                            </h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-md p-8 sm:p-10 space-y-6">
                            
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
                                    className="h-11 px-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all text-sm font-semibold tracking-wide flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
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

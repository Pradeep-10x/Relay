'use client';

import React, { useState } from 'react';
import { Fira_Sans } from 'next/font/google';
import { useNotifications, NotificationItem } from '@/hooks/useNotifications';
import { Check, UserPlus, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const firaSans = Fira_Sans({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

type TabType = 'All' | 'Unread' | 'Mentions' | 'Assigned';

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

export default function NotificationsPage() {
    const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();
    const [activeTab, setActiveTab] = useState<TabType>('All');

    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Derived UI based on the tab chosen
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'Unread') return !n.read;
        if (activeTab === 'Assigned') return n.type === 'ASSIGNMENT';
        if (activeTab === 'Mentions') return n.type === 'MENTION';
        return true; // 'All'
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    } as any;

    return (
        <div className={`relative min-h-full font-sans ${firaSans.className}`}>
            <FloatingPaths position={-1} />
            <div className="absolute inset-0 bg-transparent dark:bg-black/30 pointer-events-none" />

            <div className="relative z-10 p-8 w-full max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <motion.header 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all text-[13px] font-bold tracking-wide shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    >
                        <Check size={14} strokeWidth={2.5} />
                        Mark all read
                    </button>
                </motion.header>

                {/* Segmented Filter Control */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-lg p-1.5 flex items-center justify-between overflow-x-auto custom-scrollbar"
                >
                    {(['All', 'Unread', 'Mentions', 'Assigned'] as TabType[]).map((tab) => {
                        const isActive = activeTab === tab;
                        let count = 0;
                        if (tab === 'All') count = notifications.length;
                        if (tab === 'Unread') count = unreadCount;
                        if (tab === 'Assigned') count = notifications.filter(n => n.type === 'ASSIGNMENT').length;
                        if (tab === 'Mentions') count = notifications.filter(n => n.type === 'MENTION').length;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-[13px] font-semibold tracking-wide transition-all relative ${
                                    isActive 
                                        ? 'text-zinc-900 dark:text-zinc-100' 
                                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                                }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTabBadge" 
                                        className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200/50 dark:border-zinc-700/50" 
                                        style={{ zIndex: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab}
                                    {count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-300' : 'bg-zinc-200/50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'}`}>
                                            {count}
                                        </span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-24">
                            <div className="w-8 h-8 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 animate-spin" />
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <motion.div 
                            variants={containerVariants} 
                            initial="hidden" 
                            animate="show" 
                            className="flex flex-col gap-4"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                    >
                                        <NotificationCard 
                                            notification={notification} 
                                            onMarkRead={() => markAsRead(notification.id)} 
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center justify-center py-24 text-zinc-500 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-lg"
                        >
                            <BellSlashIcon className="w-12 h-12 mb-4 text-zinc-400 dark:text-zinc-600" />
                            <p className="text-[14px] font-medium tracking-wide">No {activeTab.toLowerCase()} notifications</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NotificationCard({ notification, onMarkRead }: { notification: NotificationItem, onMarkRead: () => void }) {
    const isUnread = !notification.read;
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    
    // Icon & Format logic based on type
    let icon = <AlertCircle size={18} className="text-zinc-700 dark:text-zinc-300" />;
    let mainText = <span>Notification related to <strong>{notification.issue?.title || 'an issue'}</strong></span>;
    let typeLabel = "UPDATE";
    
    if (notification.type === 'ASSIGNMENT') {
        icon = <UserPlus size={18} className="text-zinc-900 dark:text-zinc-100" />;
        mainText = <span>You were <strong>assigned to</strong> — {notification.issue?.title || 'an issue'}</span>;
        typeLabel = "ASSIGNMENT";
    } else if (notification.type === 'STATUS_CHANGE') {
        icon = <Check size={18} className="text-zinc-900 dark:text-zinc-100" />;
        mainText = <span>Issue <strong>{notification.issue?.title || 'an issue'}</strong> changed status</span>;
        typeLabel = "STATUS";
    } else if (notification.type === 'MENTION' || !!notification.comment) {
        icon = <MessageSquare size={18} className="text-zinc-900 dark:text-zinc-100" />;
        mainText = <span>You were <strong>mentioned in</strong> — {notification.issue?.title || 'an issue'}</span>;
        typeLabel = "MENTION";
    }

    return (
        <div className={`relative flex items-center gap-5 p-5 rounded-xl border transition-all duration-300 group ${
            isUnread 
                ? 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 shadow-md' 
                : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 shadow-sm'
        }`}>
            {/* Unread indicator dot */}
            {isUnread && (
                <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
            )}

            {/* Left Icon Area */}
            <div className={`w-12 h-12 shrink-0 rounded-lg border flex items-center justify-center ${
                isUnread ? 'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800' : 'bg-transparent border-zinc-200 dark:border-zinc-800/50'
            }`}>
                {icon}
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className={`text-[14px] leading-relaxed truncate tracking-wide ${isUnread ? 'text-zinc-900 font-medium dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {mainText}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-medium text-zinc-500">{timeAgo}</span>
                    <span className="text-[11px] text-zinc-300 dark:text-zinc-700">•</span>
                    <span className={`text-[10px] font-bold font-mono uppercase tracking-[0.15em] ${isUnread ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {typeLabel}
                    </span>
                </div>
            </div>

            {/* Action Area */}
            {isUnread && (
                <button 
                    onClick={onMarkRead}
                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 border hover:text-zinc-900 dark:hover:text-white transition-all mr-4 bg-transparent"
                    title="Mark as read"
                >
                    <Check size={16} strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
}

function BellSlashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10.3 5.3a5.1 5.1 0 0 1 8.6 3.8v5.7l-1.9-1.9" />
            <path d="M21 21l-18-18" />
            <path d="M5.1 10.5c0 1.2.3 2.3.8 3.3L4 16h13.2l-3-3H6.8l1.4-1.9c.4-1 .7-2.1.7-3.2 0-.3 0-.6-.1-.9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

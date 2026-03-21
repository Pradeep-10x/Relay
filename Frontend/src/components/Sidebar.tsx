'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    ChevronDown, 
    ChevronRight,
    LogOut
} from 'lucide-react';
import { Fira_Sans } from 'next/font/google';
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/hooks/useUser';

const firaSans = Fira_Sans({ 
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

const GENERAL_LINKS = [
    { name: 'Dashboard', href: '/dashboard', iconSrc: '/Home_icon-icons.com_55890.svg' },
    { name: 'Workspace', href: '/workspace', iconSrc: '/workspace_icon_217150.svg' },
    { name: 'Notification', href: '/notifications', iconSrc: '/alarm_alert_attention_bell_clock_notification_ring_icon_123203.svg' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { projects, isLoading } = useProjects();
    const { user } = useUser();
    const [isProjectsOpen, setIsProjectsOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('activeWorkspaceId');
        window.location.href = '/auth';
    };

    return (
        <aside className={`w-[260px] h-screen bg-white dark:bg-black md:flex flex-col flex-shrink-0 text-zinc-600 dark:text-zinc-400 font-sans border-r border-zinc-200 dark:border-zinc-800 hidden ${firaSans.className}`}>
            {/* Logo */}
            <div className="h-20 flex items-center px-6 shrink-0 mt-2">
                <Link href="/" className="flex items-center gap-3 text-zinc-900 dark:text-white transition-colors">
                    <img src="/logo.svg" alt="Relay" className="w-[34px] h-[34px]" />
                    <span className="font-bold text-xl tracking-wide">Relay</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-5 custom-scrollbar px-5">
                
                {/* Primary Nav */}
                <nav className="space-y-1 mt-2">
                    {GENERAL_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.name === 'Dashboard' && pathname.startsWith('/dashboard'));
                        return (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                                    isActive 
                                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-sm' 
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                }`}
                            >
                                <img 
                                    src={link.iconSrc} 
                                    alt={link.name} 
                                    className={`w-[18px] h-[18px] object-contain transition-opacity ${isActive ? "opacity-100" : "opacity-80"}`} 
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                />
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Separator line */}
                <div className="h-px bg-zinc-200 dark:bg-zinc-800/80 mx-4 my-1" />

                {/* Projects Section */}
                <div className="space-y-1">
                    <button 
                        onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                        className="flex items-center justify-between w-full px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors group"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                            Projects
                        </span>
                        {isProjectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isProjectsOpen && (
                        <div className="space-y-1 mt-1">
                            {isLoading ? (
                                <div className="px-4 py-2 text-xs text-zinc-400 font-medium">Loading projects...</div>
                            ) : projects.length === 0 ? (
                                <div className="px-4 py-2 text-xs text-zinc-400 font-medium">No projects found.</div>
                            ) : (
                                projects.map((project) => (
                                    <Link 
                                        key={project.id} 
                                        href={`/project/${project.id}`}
                                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white group"
                                    >
                                        <div className="w-[22px] h-[22px] rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 transition-colors">
                                            <img src="/projects_icon_142976.svg" alt="Project" className="w-[12px] h-[12px] opacity-100 transition-opacity" style={{ filter: 'brightness(0) invert(1)' }} />
                                        </div>
                                        <span className="text-[13px] font-medium truncate text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white">{project.name}</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1" />
            </div>

            {/* Bottom Section: Settings & Profile */}
            <div className="shrink-0 flex flex-col pt-3  mt-auto">
                <div className="px-5 mb-3">
                    <Link 
                        href="/settings"
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                            pathname.startsWith('/settings') 
                                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-sm' 
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                        }`}
                    >
                        <img 
                            src="/1904675-configuration-edit-gear-options-preferences-setting-settings_122525.svg" 
                            alt="Settings" 
                            className={`w-[18px] h-[18px] object-contain transition-opacity ${pathname.startsWith('/settings') ? "opacity-100" : "opacity-80"}`} 
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                        Settings
                    </Link>
                </div>
                
                {/* Profile & Logout */}
                <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/40">
                    <div className="flex items-center gap-3 truncate">
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                            <img 
                                src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Relay'}`} 
                                alt={user?.name || "User"} 
                                className="w-full h-full object-cover bg-zinc-100 dark:bg-zinc-800"
                            />
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-none mb-0.5 truncate">{user ? user.name : "Loading..."}</span>
                            <span className="text-[11px] text-zinc-500 truncate">{user ? user.email : "..."}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Sign OUT"
                    >
                        <LogOut size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

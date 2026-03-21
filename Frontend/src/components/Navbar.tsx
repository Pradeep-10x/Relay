'use client';

import { Search, Bell } from 'lucide-react';
import { Fira_Sans } from 'next/font/google';
import { useUser } from '@/hooks/useUser';

const firaSans = Fira_Sans({ 
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export function Navbar() {
    const { user } = useUser();

    return (
        <header className={`h-24 bg-transparent flex items-center justify-between px-8 sticky top-0 z-40 shrink-0 border-b border-transparent ${firaSans.className}`}>
            {/* Left aligned Search */}
            <div className="flex-1 max-w-xl flex items-center gap-3 text-zinc-500">
                <Search size={20} className="text-zinc-400 font-bold" />
                <input 
                    type="text" 
                    placeholder="Search campaign, customer, etc..." 
                    className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 w-full"
                />
            </div>

            {/* Right Nav Actions */}
            <div className="flex items-center gap-8">
                {/* Notification Bell */}
                <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors relative">
                    <Bell size={20} strokeWidth={2.5} />
                    <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-[#131315]" />
                </button>
                
                {/* User Profile */}
                <div className="flex items-center gap-4 cursor-pointer group">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
                        <img 
                            src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Relay'}`} 
                            alt={user?.name || "User"} 
                            className="w-full h-full object-cover bg-zinc-100 dark:bg-zinc-800"
                        />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user ? user.name : "Loading..."}</span>
                        <span className="text-[11px] text-zinc-500 truncate max-w-[120px]">{user ? user.email : "..."}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

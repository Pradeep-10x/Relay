'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Fira_Sans } from 'next/font/google';
import { useUser } from '@/hooks/useUser';
import { useProjects } from '@/hooks/useProjects';
import { useRouter } from 'next/navigation';

const firaSans = Fira_Sans({ 
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export function Navbar() {
    const { user } = useUser();
    const { projects } = useProjects();
    const router = useRouter();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredProjects = projects.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <header className={`h-24 bg-transparent flex items-center justify-between px-8 sticky top-0 z-40 shrink-0 border-b border-transparent ${firaSans.className}`}>
            {/* Left aligned Search */}
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <div className="flex items-center gap-3 text-zinc-500 w-full">
                    <Search size={20} className="text-zinc-400 font-bold shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search your projects..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 w-full"
                    />
                </div>
                
                {/* Search Dropdown */}
                {isSearchOpen && searchTerm && (
                    <div className="absolute top-full left-0 mt-3 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project: any) => (
                                <button
                                    key={project.id}
                                    onClick={() => {
                                        setSearchTerm("");
                                        setIsSearchOpen(false);
                                        router.push(`/project/${project.id}`);
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 flex items-center gap-3 transition-colors text-sm text-zinc-700 dark:text-zinc-300"
                                >
                                    <div className="w-6 h-6 rounded flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0">
                                        <img src="/projects_icon_142976.svg" alt="Project" className="w-3.5 h-3.5 dark:invert opacity-70" />
                                    </div>
                                    <span className="font-medium truncate">{project.name}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-5 py-4 text-sm text-zinc-500 text-center">
                                No projects found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Nav Actions */}
            <div className="flex items-center gap-8 pl-4">
                {/* Notification Bell */}
                <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors relative shrink-0">
                    <Bell size={20} strokeWidth={2.5} />
                    <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-[#131315]" />
                </button>
                
                {/* User Profile */}
                <div className="flex items-center gap-4 cursor-pointer group shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors shrink-0">
                        <img 
                            src={user?.avatar || '/4092564-about-mobile-ui-profile-ui-user-website_114033.svg'} 
                            alt={user?.name || "User"} 
                            className="w-full h-full object-cover bg-zinc-100 dark:bg-zinc-800"
                        />
                    </div>
                    <div className="flex flex-col items-start leading-tight min-w-0 max-w-[140px] hidden sm:flex">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate w-full">{user ? user.name : "Loading..."}</span>
                        <span className="text-[11px] text-zinc-500 truncate w-full">{user ? user.email : "..."}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

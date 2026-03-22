import React from 'react';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { Shield, User, HardHat, Mail } from 'lucide-react';
import { format } from 'date-fns';

export function ProjectMembersView({ projectId }: { projectId: string }) {
    const { members, isLoading, error } = useProjectMembers(projectId);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-zinc-500">
                <p>Failed to load project members</p>
            </div>
        );
    }

    const roleIcon = (role: string) => {
        if (role === 'OWNER') return <Shield size={14} className="text-amber-500" />;
        if (role === 'ADMIN') return <HardHat size={14} className="text-sky-500" />;
        return <User size={14} className="text-zinc-500" />;
    };

    return (
        <div className="px-6 py-6 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Member Directory</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Manage who has access to this project's boards and issues.</p>
                </div>
                <button className="h-9 px-4 rounded-md bg-white text-black text-[12px] font-bold tracking-wide transition-colors hover:bg-zinc-200">
                    Add Member
                </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/80 bg-zinc-900/20">
                            <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase w-1/2">Member</th>
                            <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Role</th>
                            <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {members.map((member: any) => (
                            <tr key={member.userId} className="group hover:bg-zinc-900/40 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={member.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.user?.name}`} 
                                            alt={member.user?.name}
                                            className="w-10 h-10 rounded-full border border-zinc-800 object-cover bg-zinc-900" 
                                        />
                                        <div>
                                            <p className="text-[13px] font-bold text-zinc-100">{member.user?.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 font-medium">
                                                <Mail size={12} />
                                                <span>{member.user?.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">
                                        {roleIcon(member.role)}
                                        <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{member.role}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <span className="text-[13px] text-zinc-500 font-medium">
                                        {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="p-8 text-center text-[13px] text-zinc-500">No members found in this project.</div>
                )}
            </div>
        </div>
    );
}

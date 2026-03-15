import { create } from 'zustand'

interface UIStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  activeIssueId: string | null
  openIssueDetail: (id: string) => void
  closeIssueDetail: () => void

  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  activeIssueId: null,
  openIssueDetail: (id) => set({ activeIssueId: id }),
  closeIssueDetail: () => set({ activeIssueId: null }),

  activeWorkspaceId: null,
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
}))

import { apiClient } from './apiClient'
import type { Workspace, WorkspaceMember, WorkspaceInvite, WorkspaceRole } from '@/types'

export const workspaceService = {
  // GET /workspace/ → { workspaces: [...] }
  async getAll(): Promise<Workspace[]> {
    const { data } = await apiClient.get('/workspace/')
    return data.workspaces
  },

  // POST /workspace/create → { message, workspace }
  async create(name: string): Promise<Workspace> {
    const { data } = await apiClient.post('/workspace/create', { name })
    return data.workspace
  },

  // DELETE /workspace/:workspaceId/delete → { message, deleteWorkspace }
  async delete(workspaceId: string) {
    const { data } = await apiClient.delete(`/workspace/${workspaceId}/delete`)
    return data
  },

  // POST /workspace/:workspaceId/add → { message, workspace }
  async addMember(workspaceId: string, email: string, role: WorkspaceRole = 'MEMBER') {
    const { data } = await apiClient.post(`/workspace/${workspaceId}/add`, { email, role })
    return data
  },

  // GET /workspace/:workspaceId/members → { members: [...] }
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data } = await apiClient.get(`/workspace/${workspaceId}/members`)
    return data.members
  },

  // DELETE /workspace/:workspaceId/remove-member → { message, deleteMembership }
  async removeMember(workspaceId: string, memberId: string) {
    const { data } = await apiClient.delete(`/workspace/${workspaceId}/remove-member`, {
      data: { memberId },
    })
    return data
  },

  // POST /workspace/:workspaceId/invite → { message, invite }
  async generateInvite(workspaceId: string): Promise<WorkspaceInvite> {
    const { data } = await apiClient.post(`/workspace/${workspaceId}/invite`)
    return data.invite
  },

  // POST /workspace/:inviteCode/join → { message, workspace }
  async joinByInvite(inviteCode: string): Promise<Workspace> {
    const { data } = await apiClient.post(`/workspace/${inviteCode}/join`)
    return data.workspace
  },
}

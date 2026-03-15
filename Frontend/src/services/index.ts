import { apiClient } from './apiClient'
import type { Project, ProjectMember, ProjectRole, Notification, ProjectAnalytics, KanbanBoard } from '@/types'

// ── Project Service ─────────────────────────────────────
export const projectService = {
  // POST /project/:workspaceId/create → Project
  async create(workspaceId: string, name: string): Promise<Project> {
    const { data } = await apiClient.post(`/project/${workspaceId}/create`, { name })
    return data
  },

  // GET /project/:workspaceId → Project[]
  async getByWorkspace(workspaceId: string): Promise<Project[]> {
    const { data } = await apiClient.get(`/project/${workspaceId}`)
    return data
  },

  // DELETE /project/:projectId/delete → { success }
  async delete(projectId: string) {
    const { data } = await apiClient.delete(`/project/${projectId}/delete`)
    return data
  },

  // POST /project/:projectId/add-member → ProjectMember
  async addMember(projectId: string, email: string, role: ProjectRole = 'MEMBER'): Promise<ProjectMember> {
    const { data } = await apiClient.post(`/project/${projectId}/add-member`, { email, role })
    return data
  },
}

// ── Board / Kanban Service ──────────────────────────────
export const kanbanService = {
  // GET /projects/:projectId/kanban → { "OPEN": Issue[], "In_Progress": Issue[], ... }
  async getBoard(projectId: string): Promise<KanbanBoard> {
    const { data } = await apiClient.get(`/projects/${projectId}/kanban`)
    return data
  },

  // GET /projects/:projectId/board → { board: { ... } }
  async getProjectBoard(projectId: string): Promise<KanbanBoard> {
    const { data } = await apiClient.get(`/projects/${projectId}/board`)
    return data.board ?? data
  },
}

// ── Notification Service ────────────────────────────────
export const notificationService = {
  // GET /notifications → Notification[]
  async getAll(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications')
    return data
  },

  // PATCH /notifications/:id/read → Notification
  async markAsRead(id: string): Promise<Notification> {
    const { data } = await apiClient.patch(`/notifications/${id}/read`)
    return data
  },
}

// ── Analytics Service ───────────────────────────────────
export const analyticsService = {
  // GET /projects/:projectId/analytics → ProjectAnalytics
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    const { data } = await apiClient.get(`/projects/${projectId}/analytics`)
    return data
  },
}

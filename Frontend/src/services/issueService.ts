import { apiClient } from './apiClient'
import type { Issue, CreateIssuePayload, UpdateIssuePayload, Comment, IssueActivity } from '@/types'

export const issueService = {
  // ── Issues ─────────────────────────────────────────────

  // POST /projects/:projectId/issues → Issue
  async create(projectId: string, payload: CreateIssuePayload): Promise<Issue> {
    const { data } = await apiClient.post(`/projects/${projectId}/issues`, payload)
    return data
  },

  // PATCH /issues/:issueId → { message, isssue } (note: typo in backend 'isssue')
  async update(issueId: string, payload: Omit<UpdateIssuePayload, 'id'>): Promise<Issue> {
    const { data } = await apiClient.patch(`/issues/${issueId}`, payload)
    return data.isssue ?? data.issue ?? data
  },

  // PATCH /issues/:issueId/state → Issue (updated)
  async updateState(issueId: string, targetStateId: string): Promise<Issue> {
    const { data } = await apiClient.patch(`/issues/${issueId}/state`, { targetStateId })
    return data
  },

  // POST /issues/:issueId/dependencies → dependency
  async addDependency(issueId: string, blockerId: string) {
    const { data } = await apiClient.post(`/issues/${issueId}/dependencies`, { blockerId })
    return data
  },

  // DELETE /issues/:issueId/dependencies/:blockerId → { success }
  async removeDependency(issueId: string, blockerId: string) {
    const { data } = await apiClient.delete(`/issues/${issueId}/dependencies/${blockerId}`)
    return data
  },

  // GET /issues/:issueId/activity → IssueActivity[]
  async getActivity(issueId: string): Promise<IssueActivity[]> {
    const { data } = await apiClient.get(`/issues/${issueId}/activity`)
    return data
  },

  // ── Comments ───────────────────────────────────────────

  // GET /issues/:issueId/comments → { success, data: Comment[] }
  async getComments(issueId: string): Promise<Comment[]> {
    const { data } = await apiClient.get(`/issues/${issueId}/comments`)
    return data.data ?? data
  },

  // POST /issues/:issueId/comment (singular!) → { success, data: Comment }
  async createComment(issueId: string, content: string): Promise<Comment> {
    const { data } = await apiClient.post(`/issues/${issueId}/comment`, { issueId, content })
    return data.data ?? data
  },

  // PATCH /comments/:commentId → { success, data: Comment }
  async editComment(commentId: string, content: string): Promise<Comment> {
    const { data } = await apiClient.patch(`/comments/${commentId}`, { content })
    return data.data ?? data
  },

  // DELETE /comments/:commentId → { success, data: Comment }
  async deleteComment(commentId: string) {
    const { data } = await apiClient.delete(`/comments/${commentId}`)
    return data
  },
}

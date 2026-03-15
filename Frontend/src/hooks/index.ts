import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import { workspaceService } from '@/services/workspaceService'
import { issueService } from '@/services/issueService'
import { projectService, kanbanService, notificationService, analyticsService } from '@/services/index'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import { QUERY_KEYS, ROUTES } from '@/constants'
import type { CreateIssuePayload, IssuePriority, WorkspaceRole, ProjectRole } from '@/types'

// ── Auth ─────────────────────────────────────────────────

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.login(data),
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      toast.success('Welcome back!')
      navigate('/onboarding')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid credentials')
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; username: string }) =>
      authService.register(data),
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      toast.success('Account created!')
      navigate('/onboarding')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth()
      qc.clear()
      navigate(ROUTES.LOGIN)
    },
  })
}

export function useMe() {
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

// ── Workspaces ───────────────────────────────────────────

export function useWorkspaces() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACES,
    queryFn: () => workspaceService.getAll(),
    staleTime: 60 * 1000,
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => workspaceService.create(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACES })
      toast.success('Workspace created!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create workspace')
    },
  })
}

export function useDeleteWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workspaceService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACES })
      toast.success('Workspace deleted')
    },
  })
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MEMBERS(workspaceId),
    queryFn: () => workspaceService.getMembers(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useAddWorkspaceMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { workspaceId: string; email: string; role: WorkspaceRole }) =>
      workspaceService.addMember(data.workspaceId, data.email, data.role),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS(vars.workspaceId) })
      toast.success('Member added!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add member')
    },
  })
}

export function useRemoveWorkspaceMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { workspaceId: string; memberId: string }) =>
      workspaceService.removeMember(data.workspaceId, data.memberId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS(vars.workspaceId) })
      toast.success('Member removed')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    },
  })
}

export function useGenerateInvite() {
  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.generateInvite(workspaceId),
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate invite')
    },
  })
}

export function useJoinWorkspace() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (inviteCode: string) => workspaceService.joinByInvite(inviteCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACES })
      toast.success('Joined workspace!')
      navigate('/onboarding')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to join workspace')
    },
  })
}

// ── Projects ─────────────────────────────────────────────

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS(workspaceId),
    queryFn: () => projectService.getByWorkspace(workspaceId),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { workspaceId: string; name: string }) =>
      projectService.create(data.workspaceId, data.name),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS(vars.workspaceId) })
      toast.success('Project created!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create project')
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => projectService.delete(projectId),
    onSuccess: () => {
      toast.success('Project deleted')
    },
  })
}

export function useAddProjectMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { projectId: string; email: string; role: ProjectRole }) =>
      projectService.addMember(data.projectId, data.email, data.role),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_MEMBERS(vars.projectId) })
      toast.success('Member added to project!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add member')
    },
  })
}

// ── Kanban Board ─────────────────────────────────────────

export function useKanbanBoard(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.KANBAN(projectId),
    queryFn: () => kanbanService.getBoard(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ── Issues ───────────────────────────────────────────────

export function useCreateIssue(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateIssuePayload) =>
      issueService.create(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANBAN(projectId) })
      toast.success('Issue created!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create issue')
    },
  })
}

export function useUpdateIssue(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; title?: string; description?: string; priority?: IssuePriority; assigneeId?: string | null }) => {
      const { id, ...payload } = data
      return issueService.update(id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANBAN(projectId) })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update issue')
    },
  })
}

export function useUpdateIssueState(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { issueId: string; targetStateId: string }) =>
      issueService.updateState(data.issueId, data.targetStateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANBAN(projectId) })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update state')
    },
  })
}

export function useIssueActivity(issueId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVITY(issueId),
    queryFn: () => issueService.getActivity(issueId),
    enabled: !!issueId,
  })
}

// ── Comments ─────────────────────────────────────────────

export function useComments(issueId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COMMENTS(issueId),
    queryFn: () => issueService.getComments(issueId),
    enabled: !!issueId,
  })
}

export function useCreateComment(issueId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { content: string }) =>
      issueService.createComment(issueId, data.content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS(issueId) })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add comment')
    },
  })
}

export function useEditComment(issueId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { commentId: string; content: string }) =>
      issueService.editComment(data.commentId, data.content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS(issueId) })
    },
  })
}

export function useDeleteComment(issueId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) =>
      issueService.deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS(issueId) })
    },
  })
}

// ── Notifications ────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => notificationService.getAll(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
    },
  })
}

// ── Analytics ────────────────────────────────────────────

export function useProjectAnalytics(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS(projectId),
    queryFn: () => analyticsService.getProjectAnalytics(projectId),
    enabled: !!projectId,
    staleTime: 60 * 1000,
  })
}

// ── User Profile ─────────────────────────────────────────

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getProfile(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const { setUser } = useAuthStore()
  return useMutation({
    mutationFn: (data: { name?: string; username?: string }) =>
      userService.updateProfile(data),
    onSuccess: (user) => {
      setUser(user)
      qc.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      userService.changePassword(data.oldPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Password changed!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change password')
    },
  })
}

// re-export for convenience
export { useAuthStore } from '@/store/authStore'
export { useUIStore } from '@/store/uiStore'

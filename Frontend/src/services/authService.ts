import { apiClient } from './apiClient'
import type { User } from '@/types'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  password: string
  name: string
  username: string
}

// ── Login ─────────────────────────────────────────
// Backend returns: { message, accessToken } (no user).
// We store the token, then call /auth/me to get user.
export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post('/auth/login', payload)
    const token = data.accessToken as string
    localStorage.setItem('access_token', token)
    // Now fetch user
    const user = await authService.me()
    return { token, user }
  },

  // Backend returns: { message, accessToken, user }
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post('/auth/register', payload)
    const token = data.accessToken as string
    localStorage.setItem('access_token', token)
    return { token, user: data.user as User }
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get('/auth/me')
    return data.user
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('access_token')
    }
  },

  async refresh() {
    const { data } = await apiClient.post('/auth/refresh')
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken)
    }
    return data.accessToken as string
  },
}

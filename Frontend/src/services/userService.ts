import { apiClient } from './apiClient'
import type { User } from '@/types'

export const userService = {
  // GET /user/me → { user: { id, email, name, avatar } }
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get('/user/me')
    return data.user
  },

  // POST /user/edit-profile → { message, user }
  async updateProfile(payload: { name?: string; username?: string }): Promise<User> {
    const { data } = await apiClient.post('/user/edit-profile', payload)
    return data.user
  },

  // POST /user/change-password → { message }
  async changePassword(oldPassword: string, newPassword: string) {
    const { data } = await apiClient.post('/user/change-password', { oldPassword, newPassword })
    return data
  },

  // POST /user/avatar/upload-url → { uploadUrl, key }
  async getAvatarUploadUrl(): Promise<{ uploadUrl: string; key: string }> {
    const { data } = await apiClient.post('/user/avatar/upload-url')
    return data
  },

  // PATCH /user/avatar → { message, avatarKey }
  async updateAvatarKey(key: string) {
    const { data } = await apiClient.patch('/user/avatar', { key })
    return data
  },
}

import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true, // send cookies (refreshToken)
})

// ── Request interceptor: attach token ────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle errors ─────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'
    const original = error.config

    // Try refresh on 401 (but not for auth endpoints or retries)
    if (status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true
      try {
        const { data } = await apiClient.post('/auth/refresh')
        if (data.accessToken) {
          localStorage.setItem('access_token', data.accessToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return apiClient(original)
        }
      } catch {
        // Refresh failed, clear and redirect
        localStorage.removeItem('access_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    if (status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    } else if (status === 403) {
      toast.error(message || 'You don\'t have permission to do that.')
    } else if (status === 409) {
      toast.error(message)
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again.')
    } else if (status && status !== 400 && status !== 404) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Prevent multiple concurrent 401s from each triggering their own logout+redirect
let sessionExpired = false

api.interceptors.response.use(
  (res) => {
    sessionExpired = false
    return res
  },
  (err) => {
    const status = err.response?.status
    if ((status === 401 || status === 403) && !sessionExpired) {
      sessionExpired = true
      useAuthStore.getState().logout()
      toast.error('Your session has expired. Please log in again.')
      const isAdminApi = err.config?.url?.includes('/admin/')
      setTimeout(() => {
        window.location.href = isAdminApi ? '/admin/login' : '/login'
      }, 1200)
    }
    return Promise.reject(err)
  }
)

export default api

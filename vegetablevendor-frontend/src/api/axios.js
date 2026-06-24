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
  async (err) => {
    const status = err.response?.status
    const config = err.config

    // On the first 401 for an authenticated request, retry once — Render.com
    // free-tier cold starts can transiently reject valid tokens if the DB
    // connection isn't ready yet. A second 401 means the session is truly gone.
    if (status === 401 && useAuthStore.getState().token && !config._retried) {
      config._retried = true
      await new Promise((r) => setTimeout(r, 1500))
      return api(config)
    }

    if ((status === 401 || status === 403) && !sessionExpired) {
      sessionExpired = true
      useAuthStore.getState().logout()
      toast.error('Your session has expired. Please log in again.')
      // Route guards (AdminRoute / ProtectedRoute) react to the cleared token
      // via Zustand and redirect client-side — no hard navigation needed.
    }
    return Promise.reject(err)
  }
)

export default api

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('auth-storage')
    const token = stored ? JSON.parse(stored)?.state?.token : null
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // ignore parse errors
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const isAdminApi = err.config?.url?.includes('/admin/')
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth-storage')
      window.location.href = isAdminApi ? '/admin/login' : '/login'
    }
    return Promise.reject(err)
  }
)

export default api

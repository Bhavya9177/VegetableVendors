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

// ── Response interceptor ──────────────────────────────────────────────────────
// Strategy:
//   401 → retry up to 3 times (1s, 3s, 6s). Render free-tier DB connections
//         can be momentarily stale right after a cold start. Show a "reconnecting"
//         toast so the user knows something is happening. If all retries fail,
//         the token is truly gone → log out.
//   403 → the token is valid but the role is wrong; log out with a different
//         message (don't say "session expired" when it isn't).
//
// Module-level guards prevent concurrent requests from stacking duplicate toasts
// or racing each other into multiple logout() calls.

let sessionExpired    = false   // true once a definitive logout has been triggered
let reconnectToastId  = null    // id of the in-progress "Reconnecting…" toast

const RETRY_DELAYS_MS = [1000, 3000, 6000]   // total max wait ≈ 10 s

api.interceptors.response.use(
  (res) => {
    // Any success: clear all pending error state
    sessionExpired = false
    if (reconnectToastId) {
      toast.dismiss(reconnectToastId)
      reconnectToastId = null
    }
    return res
  },
  async (err) => {
    const status = err.response?.status
    const config = err.config

    // ── 401 retry logic ───────────────────────────────────────────────────────
    // Only retry if:
    //   • it is genuinely a 401 (not 403)
    //   • we still have a token (if we're already logged-out, don't retry)
    //   • a definitive logout hasn't already been decided
    if (status === 401 && useAuthStore.getState().token && !sessionExpired) {
      const attempt = config._retryAttempt ?? 0

      if (attempt < RETRY_DELAYS_MS.length) {
        config._retryAttempt = attempt + 1

        // Show a single "Reconnecting…" toast for the whole burst of retries
        if (!reconnectToastId) {
          reconnectToastId = toast.loading('Reconnecting to server…')
        }

        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]))
        return api(config)
      }

      // All retries exhausted — fall through to logout
      toast.dismiss(reconnectToastId)
      reconnectToastId = null
    }

    // ── Definitive failure handling ───────────────────────────────────────────
    if ((status === 401 || status === 403) && !sessionExpired) {
      sessionExpired = true
      useAuthStore.getState().logout()

      const msg = status === 403
        ? 'Access denied. Your account does not have admin privileges.'
        : 'Your session has expired. Please log in again.'
      toast.error(msg)
      // Route guards (AdminRoute / ProtectedRoute) react to the cleared token
      // via Zustand and redirect client-side — no hard navigation needed.
    }

    return Promise.reject(err)
  }
)

export default api

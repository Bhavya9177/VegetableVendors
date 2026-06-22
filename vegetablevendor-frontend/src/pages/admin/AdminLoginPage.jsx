import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loginUser } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const login  = useAuthStore((s) => s.login)
  const token  = useAuthStore((s) => s.token)
  const user   = useAuthStore((s) => s.user)
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && user?.role === 0) navigate('/admin', { replace: true })
    else if (token && user?.role !== 0) navigate('/', { replace: true })
  }, [token, user, navigate])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('All fields are required'); return }
    setLoading(true)
    try {
      const res = await loginUser({ email: form.email.trim().toLowerCase(), password: form.password })
      if (res.status === 'success') {
        if (res.data.info?.role !== 0) {
          setError('This portal is for administrators only')
          return
        }
        login(res.data.token, res.data.info)
        navigate('/admin', { replace: true })
      } else {
        setError(res.data || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.data || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">VegFresh — Restricted Access</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="admin@vegfresh.in"
                autoComplete="email"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded-lg border border-red-700/50">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full py-3 rounded-xl text-base mt-2">
              Sign In to Admin
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-700 text-center">
            <Link to="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              ← Back to Customer Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Unauthorized access is prohibited and monitored.
        </p>
      </motion.div>
    </div>
  )
}

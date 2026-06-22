import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, CheckCircle, XCircle, Search, X, Send,
  RefreshCw, AlertTriangle, ShieldCheck, Zap, Info,
} from 'lucide-react'
import { useAdminOrders } from '../../api/orders'
import { useWhatsAppTokenStatus, useRefreshWhatsAppToken, useTestWhatsApp } from '../../api/admin'
import { formatDateTime } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'

const TYPE_CONFIG = {
  order_confirm:    { label: 'Order Confirmation', bg: 'bg-blue-50 text-blue-700' },
  packed:           { label: 'Packed',             bg: 'bg-yellow-50 text-yellow-700' },
  out_for_delivery: { label: 'Out for Delivery',   bg: 'bg-orange-50 text-orange-700' },
  delivered:        { label: 'Delivered',           bg: 'bg-green-50 text-green-700' },
  cancelled:        { label: 'Cancelled',           bg: 'bg-red-50 text-red-700' },
}

const STATUS_MSGS = {
  packed:           '📦 Your order is being packed and will be dispatched soon.',
  out_for_delivery: '🚴 Your order is out for delivery! Expect it within the hour.',
  delivered:        '✅ Your order has been delivered. Enjoy your fresh produce!',
  cancelled:        '❌ Your order has been cancelled. Contact us if you need help.',
}

const TEMPLATES = [
  { key: 'order_confirm',    label: 'Order Confirmation', preview: 'Your order #{{id}} has been confirmed! Total: ₹{{amount}}. Delivery: {{window}}.' },
  { key: 'packed',           label: 'Packed',             preview: 'Order #{{id}} is being packed and will be dispatched soon.' },
  { key: 'out_for_delivery', label: 'Out for Delivery',   preview: 'Your order #{{id}} is out for delivery! Expect it within the hour.' },
  { key: 'delivered',        label: 'Delivered',          preview: 'Order #{{id}} delivered! Thank you for shopping with VegFresh.' },
]

// ─── Token Status Banner ──────────────────────────────────────────────────────

function TokenStatusBanner() {
  const { data, isLoading } = useWhatsAppTokenStatus()
  const { mutate: refreshToken, isPending } = useRefreshWhatsAppToken()
  const [showSetup, setShowSetup] = useState(false)

  const status = data?.data

  if (isLoading) {
    return <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
  }

  if (!status) return null

  const isHealthy = status.configured && status.can_auto_refresh
  const needsAppCreds = !status.can_auto_refresh

  return (
    <div className="space-y-3">
      {/* Main status card */}
      <div className={`rounded-2xl border p-4 ${isHealthy ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              {isHealthy ? <ShieldCheck size={18} className="text-white" /> : <AlertTriangle size={18} className="text-white" />}
            </div>
            <div>
              <p className={`font-bold text-sm ${isHealthy ? 'text-emerald-800' : 'text-amber-800'}`}>
                {isHealthy ? 'WhatsApp Auto-Refresh Active' : 'WhatsApp Needs Setup'}
              </p>
              <p className={`text-xs mt-0.5 ${isHealthy ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isHealthy
                  ? `Alerts go to ${status.vendor_phone} · Token auto-renews when expired — no manual work needed`
                  : needsAppCreds
                    ? 'Add WHATSAPP_APP_ID + WHATSAPP_APP_SECRET to .env to enable auto-refresh'
                    : 'Token not configured — set WHATSAPP_ACCESS_TOKEN in .env'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {status.can_auto_refresh && (
              <button
                onClick={() => refreshToken()}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
                {isPending ? 'Refreshing…' : 'Refresh Token Now'}
              </button>
            )}
            <button
              onClick={() => setShowSetup((v) => !v)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Info size={12} />
              {showSetup ? 'Hide' : 'How to setup'}
            </button>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.configured ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
            {status.configured ? <CheckCircle size={10} /> : <XCircle size={10} />}
            Access Token
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.phone_number_id ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
            {status.phone_number_id ? <CheckCircle size={10} /> : <XCircle size={10} />}
            Phone Number ID
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.can_auto_refresh ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
            {status.can_auto_refresh ? <Zap size={10} /> : <AlertTriangle size={10} />}
            Auto-Refresh {status.can_auto_refresh ? 'Enabled' : 'Not Set'}
          </span>
          {status.vendor_phone && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              <MessageSquare size={10} />
              Alerts → {status.vendor_phone}
            </span>
          )}
        </div>
      </div>

      {/* Setup guide */}
      {showSetup && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 text-slate-200 rounded-2xl p-5 text-sm"
        >
          <p className="font-bold text-white mb-3">One-time setup for permanent WhatsApp (never expire)</p>
          <ol className="space-y-2 text-xs leading-relaxed">
            <li className="flex gap-2"><span className="text-violet-400 font-bold shrink-0">1.</span> Go to <span className="text-emerald-400 font-mono">developers.facebook.com</span> → your app → <strong className="text-white">Settings → Basic</strong></li>
            <li className="flex gap-2"><span className="text-violet-400 font-bold shrink-0">2.</span> Copy your <strong className="text-white">App ID</strong> and <strong className="text-white">App Secret</strong></li>
            <li className="flex gap-2"><span className="text-violet-400 font-bold shrink-0">3.</span> Add them to <span className="text-yellow-400 font-mono">vegetablevendor-backend/.env</span>:<br />
              <span className="text-emerald-300 font-mono block mt-1 bg-black/30 px-3 py-2 rounded-lg">
                WHATSAPP_APP_ID=your_app_id<br />
                WHATSAPP_APP_SECRET=your_app_secret
              </span>
            </li>
            <li className="flex gap-2"><span className="text-violet-400 font-bold shrink-0">4.</span> Restart the backend server</li>
            <li className="flex gap-2"><span className="text-violet-400 font-bold shrink-0">5.</span> Click <strong className="text-white">"Refresh Token Now"</strong> above — done! The app will auto-renew every time the token expires.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-400 border-t border-slate-700 pt-3">
            The refreshed token is saved in <span className="text-yellow-400 font-mono">.whatsapp_token</span> (backend root) and reused automatically. Token lasts ~60 days and re-refreshes itself on expiry.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Test Send Button ─────────────────────────────────────────────────────────

function TestSendButton() {
  const { mutate, isPending } = useTestWhatsApp()
  return (
    <button
      onClick={() => mutate()}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
    >
      <MessageSquare size={15} className={isPending ? 'animate-pulse' : ''} />
      {isPending ? 'Sending…' : 'Send Test Message'}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminWhatsAppPage() {
  const [search,       setSearch]       = useState('')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showTemplates, setShowTemplates] = useState(false)

  const { data, isLoading } = useAdminOrders({ page_size: 200 })
  const allOrders = data?.data || []

  const logs = useMemo(() => {
    const entries = []
    allOrders.forEach((order) => {
      const phone    = order.customer_phone || order.address?.phone
      const customer = order.customer_name  || order.address?.full_name || '—'
      const sent     = !!phone ? 'sent' : 'failed'

      entries.push({
        id:       `confirm-${order.id}`,
        orderId:  order.id,
        type:     'order_confirm',
        customer,
        phone:    phone || '—',
        message:  `Order #${order.id} confirmed. Total: ${formatPrice(order.total_amount)}. Delivery: ${order.delivery_window || '—'}.`,
        status:   sent,
        time:     order.created_at,
      })

      if (order.status !== 'placed' && STATUS_MSGS[order.status]) {
        entries.push({
          id:       `status-${order.id}`,
          orderId:  order.id,
          type:     order.status,
          customer,
          phone:    phone || '—',
          message:  `Order #${order.id} → ${order.status.replace(/_/g, ' ')}. ${STATUS_MSGS[order.status]}`,
          status:   sent,
          time:     order.updated_at,
        })
      }
    })
    return entries.sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [allOrders])

  const filtered = logs.filter((l) => {
    const matchSearch = !search || `${l.customer} ${l.phone}`.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter   === 'all' || l.type   === typeFilter
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const sentCount   = logs.filter((l) => l.status === 'sent').length
  const failedCount = logs.filter((l) => l.status === 'failed').length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">WhatsApp</h1>
          <p className="page-subtitle">{logs.length} messages tracked · alerts sent to 9177640632</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TestSendButton />
          <button onClick={() => setShowTemplates(!showTemplates)} className="btn-primary">
            <Send size={16} />
            <span className="hidden sm:inline">Message Templates</span>
            <span className="sm:hidden">Templates</span>
          </button>
        </div>
      </div>

      {/* Token Status */}
      <TokenStatusBanner />

      {/* Templates */}
      {showTemplates && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Message Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <div key={t.key} className="border border-gray-100 rounded-2xl p-4 hover:border-primary/30 hover:bg-primary-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-slate-700 group-hover:text-primary transition-colors">{t.label}</span>
                  <button className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Send size={11} /> Use
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{t.preview}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Sent',              value: sentCount,   icon: CheckCircle, color: 'bg-emerald-500', ring: 'ring-emerald-100' },
          { label: 'Failed (no phone)', value: failedCount, icon: XCircle,     color: 'bg-red-500',     ring: 'ring-red-100'     },
        ].map(({ label, value, icon: Icon, color, ring }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0 ring-4 ${ring}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-slate-800">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search customer or phone..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>
          )}
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-auto">
          <option value="all">All Types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="card p-1 flex gap-1">
          {['all', 'sent', 'failed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`filter-tab capitalize ${statusFilter === s ? 'filter-tab-active' : 'filter-tab-inactive'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Log table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare size={36} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400">No messages found</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {filtered.map((log) => (
                <div key={log.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {log.status === 'sent'
                        ? <CheckCircle size={14} className="text-emerald-500" />
                        : <XCircle size={14} className="text-red-500" />}
                      <span className={`text-xs font-semibold capitalize ${log.status === 'sent' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {log.status}
                      </span>
                    </div>
                    <span className={`badge ${TYPE_CONFIG[log.type]?.bg || 'bg-slate-100 text-slate-600'}`}>
                      {TYPE_CONFIG[log.type]?.label || log.type}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{log.customer}</p>
                    <p className="text-xs text-slate-400">Order #{log.orderId} · {log.phone}</p>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{log.message}</p>
                  <p className="text-[11px] text-slate-400">{formatDateTime(log.time)}</p>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {log.status === 'sent'
                            ? <CheckCircle size={14} className="text-emerald-500" />
                            : <XCircle    size={14} className="text-red-500" />}
                          <span className={`text-xs font-medium capitalize ${log.status === 'sent' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-slate-700">{log.customer}</p>
                          <p className="text-[11px] text-slate-400">Order #{log.orderId}</p>
                        </div>
                      </td>
                      <td><span className="text-slate-500 text-xs">{log.phone}</span></td>
                      <td>
                        <span className={`badge ${TYPE_CONFIG[log.type]?.bg || 'bg-slate-100 text-slate-600'}`}>
                          {TYPE_CONFIG[log.type]?.label || log.type}
                        </span>
                      </td>
                      <td className="max-w-xs">
                        <p className="text-xs text-slate-600 truncate">{log.message}</p>
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{formatDateTime(log.time)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

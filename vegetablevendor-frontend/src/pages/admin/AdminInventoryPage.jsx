import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, Package, AlertTriangle, CheckCircle, XCircle,
  TrendingDown, TrendingUp, Minus, RefreshCw, Bell, ChevronDown,
  ChevronUp, Clock, BarChart2, Plus, MessageCircle, AlertCircle,
} from 'lucide-react'
import { useAdminProducts } from '../../api/products'
import {
  useUpdateProduct,
  useInventoryAnalysis,
  useRunRefillCheck,
  useRefillLogs,
  useRefillProduct,
} from '../../api/admin'
import toast from 'react-hot-toast'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function alertColor(level) {
  if (level === 'critical') return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500', badge: 'bg-red-100 text-red-700 border border-red-200' }
  if (level === 'warning')  return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-700 border border-amber-200' }
  return                           { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200' }
}

function DaysChip({ days }) {
  if (days === null || days === undefined)
    return <span className="text-xs text-slate-400 italic">No demand data</span>
  if (days === 0)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Out of stock</span>
  const color = days <= 3 ? 'bg-red-100 text-red-700 border-red-200' : days <= 7 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>{days}d left</span>
}

function TrendChip({ factor }) {
  if (!factor || factor === 1) return <span className="text-xs text-slate-400">—</span>
  if (factor > 1.2)
    return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600"><TrendingUp size={11} /> +{((factor - 1) * 100).toFixed(0)}%</span>
  if (factor < 0.8)
    return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600"><TrendingDown size={11} /> {((factor - 1) * 100).toFixed(0)}%</span>
  return <span className="inline-flex items-center gap-0.5 text-xs text-slate-500"><Minus size={11} /> Stable</span>
}

// ─── Stock bar ────────────────────────────────────────────────────────────────

function StockBar({ value, max }) {
  const pct  = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const color = pct === 0 ? 'bg-red-500' : pct < 30 ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

function StockBadge({ product }) {
  if (product.is_out_of_stock || product.stock <= 0)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><XCircle size={11} />Out of Stock</span>
  if (product.low_stock)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><TrendingDown size={11} />Low Stock</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle size={11} />In Stock</span>
}

// ─── Inline stock editor ───────────────────────────────────────────────────────

function StockEditor({ product }) {
  const [editing,   setEditing]   = useState(false)
  const [stock,     setStock]     = useState(product.stock)
  const [threshold, setThreshold] = useState(product.low_stock_threshold || 10)
  const { mutate: update, isPending } = useUpdateProduct()

  const save = () => {
    const s = parseInt(stock, 10)
    const t = parseInt(threshold, 10)
    if (isNaN(s) || s < 0)  { toast.error('Stock must be 0 or more');     return }
    if (isNaN(t) || t < 1)  { toast.error('Threshold must be at least 1'); return }
    update(
      { id: product.id, stock: s, low_stock_threshold: t, is_out_of_stock: s <= 0 },
      { onSuccess: () => { toast.success(`${product.name} updated`); setEditing(false) } }
    )
  }

  if (!editing)
    return (
      <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 group">
        <span className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{product.stock}</span>
        <span className="text-slate-400 text-xs">{product.unit}</span>
        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">(edit)</span>
      </button>
    )

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)}
        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Stock" />
      <input type="number" min="1" value={threshold} onChange={(e) => setThreshold(e.target.value)}
        title="Low stock threshold"
        className="w-16 border border-orange-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-200" placeholder="Min" />
      <button onClick={save} disabled={isPending}
        className="bg-primary text-white text-xs px-2.5 py-1 rounded-lg font-medium disabled:opacity-50 hover:bg-primary-dark transition-colors">
        {isPending ? '…' : 'Save'}
      </button>
      <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600 text-xs"><X size={14} /></button>
    </div>
  )
}

// ─── Refill Modal ─────────────────────────────────────────────────────────────

function RefillModal({ product, onClose }) {
  const [qty, setQty] = useState('')
  const { mutate: refill, isPending } = useRefillProduct()

  const submit = () => {
    const q = parseInt(qty, 10)
    if (isNaN(q) || q < 1) { toast.error('Enter a valid quantity (min 1)'); return }
    refill({ id: product.id, qty: q }, { onSuccess: () => onClose() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Refill Stock</h3>
            <p className="text-sm text-slate-500 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-600">Current stock</span>
          <span className={`font-bold text-sm ${product.stock <= 0 ? 'text-red-600' : 'text-slate-700'}`}>
            {product.stock} {product.unit}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Quantity to Add ({product.unit})
          </label>
          <input
            type="number" min="1" value={qty} autoFocus
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            placeholder={`e.g. 50 ${product.unit}`}
          />
        </div>

        <div className="flex items-center gap-2 mb-5 bg-blue-50 rounded-xl px-3 py-2.5">
          <MessageCircle size={14} className="text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700">A WhatsApp alert will be sent to the admin mobile after refill.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={isPending || !qty}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {isPending ? <><RefreshCw size={14} className="animate-spin" /> Refilling…</> : <><Plus size={14} /> Refill Stock</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Smart Refill Panel ────────────────────────────────────────────────────────

function RefillPanel({ onRefill }) {
  const [expanded, setExpanded] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [logsPage, setLogsPage] = useState(1)

  const { data: analysisData, isLoading: loadingAnalysis, dataUpdatedAt } = useInventoryAnalysis({ enabled: expanded })
  const { mutate: runCheck, isPending: running } = useRunRefillCheck()
  const { data: logsData, isLoading: loadingLogs } = useRefillLogs({ page: logsPage, page_size: 15 }, { enabled: showLogs })

  const items    = analysisData?.data || []
  const critical = items.filter((i) => i.alert_level === 'critical')
  const warning  = items.filter((i) => i.alert_level === 'warning')
  const urgent   = [...critical, ...warning]
  const lastRun  = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null
  const logs     = logsData?.data        || []
  const logPages = logsData?.total_pages || 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 cursor-pointer select-none hover:bg-slate-50 transition-colors border-b border-slate-100"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm tracking-tight">Smart Refill Analysis</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {loadingAnalysis
                ? 'Analysing inventory…'
                : urgent.length > 0
                  ? `${critical.length} critical · ${warning.length} warning products need attention`
                  : 'All stock levels are healthy'}
              {lastRun && !loadingAnalysis && <span className="ml-2 text-slate-400">· updated {lastRun}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {urgent.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 shrink-0">
              <Bell size={11} /> {urgent.length} need restock
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); runCheck() }}
            disabled={running}
            title="Run analysis and send WhatsApp alerts for critical/warning products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors shrink-0 shadow-sm"
          >
            <MessageCircle size={12} />
            <span className="hidden sm:inline">{running ? 'Sending…' : 'Send WhatsApp Alerts'}</span>
            <span className="sm:hidden">{running ? '…' : 'Alert'}</span>
          </button>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-5">
              {loadingAnalysis ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}
                </div>
              ) : urgent.length === 0 ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">All {items.length} products have healthy stock levels based on recent orders.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">#</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Product</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Current Stock</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Avg / Day</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Forecast / Day</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Days Left</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Trend</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Suggested Refill</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Status</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {urgent.map((item, idx) => {
                          const c = alertColor(item.alert_level)
                          return (
                            <tr key={item.product_id} className={`border-l-4 ${c.border} ${c.bg} hover:brightness-[0.98] transition-all`}>
                              <td className="px-4 py-3 text-xs font-medium text-slate-500">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  {item.image_url
                                    ? <img src={item.image_url} alt={item.product_name} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200" />
                                    : <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base shrink-0">🥦</div>}
                                  <span className="font-semibold text-slate-800 text-sm">{item.product_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-bold text-sm ${c.text}`}>{item.current_stock}</span>
                                <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-slate-600 text-xs font-medium">
                                  {item.avg_daily_demand > 0 ? `${item.avg_daily_demand} ${item.unit}` : <span className="text-slate-300">—</span>}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-slate-600 text-xs font-medium">
                                  {item.forecasted_daily_demand > 0 ? `${item.forecasted_daily_demand} ${item.unit}` : <span className="text-slate-300">—</span>}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <DaysChip days={item.days_of_stock_remaining} />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <TrendChip factor={item.trend_factor} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-bold text-slate-800">{item.suggested_refill_qty}</span>
                                <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.badge}`}>
                                  {item.alert_level === 'critical' ? <XCircle size={10} /> : <AlertTriangle size={10} />}
                                  {item.alert_level === 'critical' ? 'Critical' : 'Warning'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => onRefill({ id: item.product_id, name: item.product_name, unit: item.unit, stock: item.current_stock })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
                                >
                                  <Plus size={11} /> Refill Now
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Alert History */}
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowLogs((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                >
                  <Clock size={12} />
                  {showLogs ? 'Hide' : 'View'} Alert History
                </button>

                <AnimatePresence initial={false}>
                  {showLogs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden mt-4"
                    >
                      {loadingLogs ? (
                        <div className="h-24 bg-slate-100 animate-pulse rounded-xl" />
                      ) : logs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">No alerts have been sent yet.</p>
                      ) : (
                        <>
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-slate-700 text-white">
                                    <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider">Product</th>
                                    <th className="text-right px-3 py-2.5 font-semibold uppercase tracking-wider">Stock at Alert</th>
                                    <th className="text-right px-3 py-2.5 font-semibold uppercase tracking-wider">Forecast / Day</th>
                                    <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wider">Days Left</th>
                                    <th className="text-right px-3 py-2.5 font-semibold uppercase tracking-wider">Suggested Refill</th>
                                    <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wider">Level</th>
                                    <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wider">Via</th>
                                    <th className="text-right px-3 py-2.5 font-semibold uppercase tracking-wider">Sent At</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {logs.map((log) => {
                                    const c = alertColor(log.alert_level)
                                    return (
                                      <tr key={log.id} className={`border-l-4 ${c.border} hover:bg-slate-50 transition-colors`}>
                                        <td className="px-3 py-2.5 font-semibold text-slate-700">{log.product_name}</td>
                                        <td className="px-3 py-2.5 text-right text-slate-600">{log.current_stock}</td>
                                        <td className="px-3 py-2.5 text-right text-slate-600">
                                          {log.forecasted_daily_demand > 0 ? log.forecasted_daily_demand.toFixed(2) : '—'}
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-slate-600">
                                          {log.days_of_stock_remaining !== null && log.days_of_stock_remaining !== undefined
                                            ? `${log.days_of_stock_remaining}d` : '—'}
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-slate-600">{log.suggested_refill_qty}</td>
                                        <td className="px-3 py-2.5 text-center">
                                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${c.badge}`}>
                                            {log.alert_level}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                            <MessageCircle size={9} /> {log.notification_channel}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-slate-400">
                                          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {logPages > 1 && (
                            <div className="flex items-center gap-2 mt-3">
                              <button disabled={logsPage <= 1} onClick={() => setLogsPage((p) => p - 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">← Prev</button>
                              <span className="text-xs text-slate-500">Page {logsPage} / {logPages}</span>
                              <button disabled={logsPage >= logPages} onClick={() => setLogsPage((p) => p + 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">Next →</button>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminInventoryPage() {
  const [page,         setPage]         = useState(1)
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [refillTarget, setRefillTarget] = useState(null)

  const { data, isLoading } = useAdminProducts({ page, search: search || undefined, page_size: 30 })
  const products   = data?.data        || []
  const totalPages = data?.total_pages || 1
  const total      = data?.total       || 0

  const filtered =
    filter === 'out' ? products.filter((p) => p.is_out_of_stock || p.stock <= 0)
    : filter === 'low' ? products.filter((p) => p.low_stock && !(p.is_out_of_stock || p.stock <= 0))
    : products

  const outCount = products.filter((p) => p.is_out_of_stock || p.stock <= 0).length
  const lowCount = products.filter((p) => p.low_stock && !(p.is_out_of_stock || p.stock <= 0)).length

  const openRefill = (product) => setRefillTarget(product)
  const closeRefill = () => setRefillTarget(null)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-2xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle hidden sm:block">{total} products · click any stock number to edit inline · use Refill to restock and notify admin via WhatsApp</p>
        <p className="page-subtitle sm:hidden">{total} products</p>
      </div>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-4 cursor-pointer shadow-sm transition-all ${filter === 'all' ? 'border-slate-400' : 'border-transparent hover:border-slate-200'}`}
          onClick={() => setFilter('all')}
        >
          <div className="w-11 h-11 rounded-xl bg-slate-600 flex items-center justify-center shrink-0"><Package size={20} className="text-white" /></div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
            <p className="text-sm text-slate-500">Total Products</p>
          </div>
        </div>
        <div
          className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-4 cursor-pointer shadow-sm transition-all ${filter === 'low' ? 'border-amber-400' : 'border-transparent hover:border-amber-200'}`}
          onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shrink-0"><AlertTriangle size={20} className="text-white" /></div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{lowCount}</p>
            <p className="text-sm text-slate-500">Low Stock</p>
          </div>
        </div>
        <div
          className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-4 cursor-pointer shadow-sm transition-all ${filter === 'out' ? 'border-red-400' : 'border-transparent hover:border-red-200'}`}
          onClick={() => setFilter(filter === 'out' ? 'all' : 'out')}
        >
          <div className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center shrink-0"><XCircle size={20} className="text-white" /></div>
          <div>
            <p className="text-2xl font-bold text-red-600">{outCount}</p>
            <p className="text-sm text-slate-500">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Smart Refill Analysis Panel */}
      <RefillPanel onRefill={openRefill} />

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search products…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input-field pl-9" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
          )}
        </div>


        
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto">
          <option value="all">All Products</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">No products found</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filtered.map((p) => (
                <div key={p.id} className={`p-4 space-y-3 ${p.is_out_of_stock || p.stock <= 0 ? 'bg-red-50/30' : p.low_stock ? 'bg-amber-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                        : <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">🥦</div>}
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.category_name || '—'} · {p.unit}</p>
                      </div>
                    </div>
                    {(p.is_out_of_stock || p.stock <= 0 || p.low_stock) && (
                      <button
                        onClick={() => openRefill(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap shrink-0"
                      >
                        <Plus size={11} /> Refill
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StockBadge product={p} />
                    <span className="text-xs text-slate-500">₹{p.price_per_unit}/{p.unit}</span>
                    <span className="text-xs text-slate-400">min {p.low_stock_threshold} {p.unit}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <StockEditor product={p} />
                    </div>
                    <StockBar value={p.stock} max={Math.max(p.stock, p.low_stock_threshold * 3, 1)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Stock Health</th>
                    <th>Min Threshold</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Refill</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className={
                      p.is_out_of_stock || p.stock <= 0 ? '!bg-red-50/30' :
                      p.low_stock ? '!bg-amber-50/30' : ''
                    }>
                      <td>
                        <div className="flex items-center gap-3">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">🥦</div>}
                          <div>
                            <p className="font-semibold text-slate-700">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{p.category_name || '—'}</span></td>
                      <td><StockEditor product={p} /></td>
                      <td className="w-36">
                        <StockBar value={p.stock} max={Math.max(p.stock, p.low_stock_threshold * 3, 1)} />
                      </td>
                      <td><span className="text-xs text-slate-500">{p.low_stock_threshold} {p.unit}</span></td>
                      <td><span className="font-semibold text-slate-700">₹{p.price_per_unit}/{p.unit}</span></td>
                      <td><StockBadge product={p} /></td>
                      <td><span className="text-xs text-slate-400">{p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}</span></td>
                      <td>
                        {(p.is_out_of_stock || p.stock <= 0 || p.low_stock) ? (
                          <button
                            onClick={() => openRefill(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
                          >
                            <Plus size={11} /> Refill
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">Next →</button>
        </div>
      )}

      {/* Refill Modal */}
      <AnimatePresence>
        {refillTarget && (
          <RefillModal product={refillTarget} onClose={closeRefill} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

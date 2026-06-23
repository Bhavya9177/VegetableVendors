import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, CheckCircle, Package, Truck, MapPin, ShoppingCart,
  MessageSquare, Printer, ChevronDown, ChevronUp, ChevronRight,
  MoreVertical, X, User, Phone, StickyNote, CreditCard, Calendar,
} from 'lucide-react'
import { useAdminOrders, useUpdateOrderStatus } from '../../api/orders'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate, formatDateTime } from '../../utils/formatDate'

const STATUSES = ['placed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']

const STATUS_META = {
  placed:           { label: 'Placed',          bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-l-blue-400' },
  packed:           { label: 'Packed',           bg: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-l-yellow-400' },
  out_for_delivery: { label: 'Dispatched',       bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-l-orange-400' },
  delivered:        { label: 'Delivered',        bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-emerald-400' },
  cancelled:        { label: 'Cancelled',        bg: 'bg-red-50',     text: 'text-red-500',     border: 'border-l-red-400' },
}

const NEXT_LABEL = {
  packed: 'Mark Packed', out_for_delivery: 'Dispatch', delivered: 'Mark Delivered',
}

function OrderActionMenu({ order, onUpdateStatus }) {
  const [open, setOpen] = useState(false)

  const ACTIONS = [
    { label: 'Confirm',          status: 'placed',           icon: CheckCircle, color: 'text-blue-600 hover:bg-blue-50' },
    { label: 'Packed',           status: 'packed',           icon: Package,     color: 'text-yellow-600 hover:bg-yellow-50' },
    { label: 'Out for Delivery', status: 'out_for_delivery', icon: Truck,       color: 'text-orange-600 hover:bg-orange-50' },
    { label: 'Delivered',        status: 'delivered',        icon: CheckCircle, color: 'text-green-600 hover:bg-green-50' },
  ]

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-card-lg border border-gray-100 z-20 overflow-hidden py-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Update Status</p>
            {ACTIONS.map(({ label, status, icon: Icon, color }) => (
              <button
                key={status}
                onClick={() => { onUpdateStatus(order, status); setOpen(false) }}
                disabled={order.status === status}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
            <div className="border-t border-gray-50 mt-1 pt-1">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors">
                <MessageSquare size={15} /> Send WhatsApp
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Printer size={15} /> Print Invoice
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Desktop expand panel ─────────────────────────────────────────────── */
function OrderDetailPanel({ order }) {
  const items = order.items || []
  const addr  = order.address

  return (
    <tr>
      <td colSpan={9} className="p-0 border-t-0">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          {/* Meta bar */}
          <div className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-5 flex-wrap text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={11} className="text-slate-400" />
              {formatDateTime(order.created_at)}
            </span>
            <span className={`badge ${order.payment_method === 'cod' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
              <CreditCard size={10} className="mr-1" />
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </span>
            <span className="text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            {order.notes && (
              <span className="flex items-center gap-1 text-yellow-600">
                <StickyNote size={11} /> Has note
              </span>
            )}
          </div>

          <div className="bg-slate-50/70 px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items — 2/3 width */}
            <div className="lg:col-span-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Order Items</p>
              {items.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No items found.</p>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 w-full">Item</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">Qty</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">Unit Price</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">{item.product_name || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className="font-medium text-slate-700">{item.quantity}</span>
                            {item.unit && <span className="text-slate-400 text-xs ml-1">{item.unit}</span>}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">
                            {formatPrice(item.unit_price)}
                            {item.unit && <span className="text-slate-400 text-xs">/{item.unit}</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                            {formatPrice(item.unit_price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50/80 border-t border-gray-100">
                        <td colSpan={3} className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">
                          Order Total
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-primary whitespace-nowrap">
                          {formatPrice(order.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar — 1/3 width */}
            <div className="space-y-4">
              {/* Customer */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Customer</p>
                <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">{order.customer_name || '—'}</span>
                  </div>
                  {order.customer_email && (
                    <p className="text-xs text-slate-400 pl-5 truncate">{order.customer_email}</p>
                  )}
                  {(order.customer_phone || addr?.phone) && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <a href={`tel:${order.customer_phone || addr?.phone}`} className="text-primary hover:underline text-sm">
                        {order.customer_phone || addr?.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery address */}
              {addr && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Delivery Address</p>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-gray-50">
                        {[
                          { label: 'Name',    value: addr.full_name },
                          { label: 'Line 1',  value: addr.line1 },
                          addr.line2 ? { label: 'Line 2', value: addr.line2 } : null,
                          { label: 'City',    value: addr.city },
                          { label: 'State',   value: addr.state },
                          { label: 'Pincode', value: addr.pincode },
                        ].filter(Boolean).map(({ label, value }) => (
                          <tr key={label}>
                            <td className="px-3 py-2 text-slate-400 font-medium whitespace-nowrap w-16">{label}</td>
                            <td className="px-3 py-2 text-slate-700">{value || '—'}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className="px-3 py-2 text-slate-400 font-medium whitespace-nowrap w-16">Phone</td>
                          <td className="px-3 py-2">
                            <a
                              href={`tel:${addr.phone}`}
                              className="text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone size={10} /> {addr.phone}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3 text-sm text-yellow-700 flex items-start gap-2">
                  <StickyNote size={13} className="shrink-0 mt-0.5" />
                  <span>{order.notes}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </td>
    </tr>
  )
}

/* ── Mobile expand panel ──────────────────────────────────────────────── */
function MobileDetailPanel({ order }) {
  const items = order.items || []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="bg-slate-50 border border-gray-100 border-t-0 rounded-b-xl px-3 py-3 space-y-3 -mt-1">
          {/* Items — aligned table */}
          {items.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Order Items</p>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Item</th>
                      <th className="px-3 py-2 text-center font-semibold text-slate-500 whitespace-nowrap">Qty</th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-500 whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="px-3 py-2.5 font-medium text-slate-700">{item.product_name || '—'}</td>
                        <td className="px-3 py-2.5 text-center text-slate-500 whitespace-nowrap">
                          {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {formatPrice(item.unit_price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-100">
                      <td colSpan={2} className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-primary whitespace-nowrap">
                        {formatPrice(order.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Address */}
          {order.address && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Delivery Address</p>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { label: 'Name',    value: order.address.full_name },
                      { label: 'Line 1',  value: order.address.line1 },
                      order.address.line2 ? { label: 'Line 2', value: order.address.line2 } : null,
                      { label: 'City',    value: order.address.city },
                      { label: 'State',   value: order.address.state },
                      { label: 'Pincode', value: order.address.pincode },
                    ].filter(Boolean).map(({ label, value }) => (
                      <tr key={label}>
                        <td className="px-3 py-2 text-slate-400 font-medium whitespace-nowrap w-14">{label}</td>
                        <td className="px-3 py-2 text-slate-700">{value || '—'}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-3 py-2 text-slate-400 font-medium whitespace-nowrap w-14">Phone</td>
                      <td className="px-3 py-2">
                        <a href={`tel:${order.address.phone}`} className="text-primary flex items-center gap-1 hover:underline">
                          <Phone size={10} /> {order.address.phone}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-xl px-3 py-2 text-xs flex items-start gap-2">
              <StickyNote size={12} className="mt-0.5 shrink-0" />
              {order.notes}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(1)
  const [expandedId, setExpandedId]     = useState(null)

  const { data, isLoading, isError, error } = useAdminOrders({
    status:    statusFilter || undefined,
    page,
    page_size: 20,
  })
  const { mutate: updateStatus } = useUpdateOrderStatus()

  const orders     = data?.data       || []
  const totalPages = data?.total_pages || 1
  const total      = data?.total       || 0

  const filtered = search
    ? orders.filter((o) => {
        const hay = [o.id, o.customer_name, o.customer_email, o.customer_phone, o.address?.full_name, o.address?.phone]
          .join(' ').toLowerCase()
        return hay.includes(search.toLowerCase())
      })
    : orders

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === order.status) return
    updateStatus({ id: order.id, status: newStatus })
  }

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 sm:space-y-5 max-w-screen-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle hidden sm:block">{total} total orders</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order #, name, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Desktop filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); setExpandedId(null) }}
            className="hidden sm:block input-field w-auto pr-8 shrink-0"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile status chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none sm:hidden pb-0.5">
          {['', ...STATUSES].map((s) => {
            const lbl = !s ? 'All' : (STATUS_META[s]?.label ?? s)
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); setExpandedId(null) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-slate-600 hover:border-primary/40'
                }`}
              >
                {lbl}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton-box h-14 rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <p className="text-red-500 font-medium mb-1">Failed to load orders</p>
            <p className="text-slate-400 text-sm">{error?.response?.data?.data || error?.message || 'Re-login as admin'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingCart size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No orders found</p>
            <p className="text-slate-300 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards ─────────────────────────────────────────── */}
            <div className="sm:hidden divide-y divide-gray-50">
              {filtered.map((order) => {
                const si         = STATUSES.indexOf(order.status)
                const nextStatus = si >= 0 && si < 3 ? STATUSES[si + 1] : null
                const meta       = STATUS_META[order.status] || STATUS_META.cancelled
                const expanded   = expandedId === order.id

                return (
                  <React.Fragment key={order.id}>
                    <div className={`bg-white border-l-4 ${meta.border}`}>
                      <div className="px-3.5 py-3 space-y-2.5">

                        {/* Row 1 — order # · date · payment · menu */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-slate-800 text-sm shrink-0">#{order.id}</span>
                            <span className="text-xs text-slate-400 shrink-0">{formatDate(order.created_at)}</span>
                            {order.items?.length > 0 && (
                              <span className="text-[10px] text-slate-400 shrink-0">
                                · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`badge text-[10px] py-0.5 ${order.payment_method === 'cod' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                              {order.payment_method === 'cod' ? 'COD' : 'Online'}
                            </span>
                            <OrderActionMenu order={order} onUpdateStatus={handleStatusChange} />
                          </div>
                        </div>

                        {/* Row 2 — avatar · name · phone */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {(order.customer_name || order.address?.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-700 text-sm truncate">
                              {order.customer_name || order.address?.full_name || '—'}
                            </p>
                            {(order.customer_phone || order.address?.phone) ? (
                              <a
                                href={`tel:${order.customer_phone || order.address?.phone}`}
                                className="text-xs text-primary flex items-center gap-1 hover:underline"
                              >
                                <Phone size={10} className="shrink-0" />
                                {order.customer_phone || order.address?.phone}
                              </a>
                            ) : (
                              <p className="text-xs text-slate-400">No phone</p>
                            )}
                          </div>
                        </div>

                        {/* Row 3 — amount · status · next action · expand */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-base text-primary">{formatPrice(order.total_amount)}</span>
                            <span className={`badge text-[10px] py-0.5 shrink-0 ${meta.bg} ${meta.text}`}>
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {nextStatus && NEXT_LABEL[nextStatus] && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(order, nextStatus) }}
                                className="flex items-center gap-1 text-[11px] font-semibold text-white bg-primary hover:bg-primary/90 active:scale-95 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                              >
                                {NEXT_LABEL[nextStatus]} <ChevronRight size={11} />
                              </button>
                            )}
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile detail panel */}
                    {expanded && <MobileDetailPanel order={order} />}
                  </React.Fragment>
                )
              })}
            </div>

            {/* ── Desktop table ─────────────────────────────────────────── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="w-8" />
                    <th>Order #</th>
                    <th>Customer</th>
                    <th className="hidden lg:table-cell">Phone</th>
                    <th className="hidden lg:table-cell">Address</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th className="hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        onClick={() => toggleExpand(order.id)}
                        className={`cursor-pointer transition-colors ${
                          expandedId === order.id ? 'bg-primary/5' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Expand toggle */}
                        <td className="w-8 text-center text-slate-400">
                          {expandedId === order.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </td>

                        {/* Order # */}
                        <td>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(order.id) }}
                            className="font-bold text-primary hover:underline"
                          >
                            #{order.id}
                          </button>
                        </td>

                        {/* Customer */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {(order.customer_name || order.address?.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-700 text-sm truncate max-w-[140px]">
                                {order.customer_name || order.address?.full_name || '—'}
                              </p>
                              {order.customer_email && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{order.customer_email}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone — hidden below lg */}
                        <td className="hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                          {(order.customer_phone || order.address?.phone) ? (
                            <a
                              href={`tel:${order.customer_phone || order.address?.phone}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                            >
                              <Phone size={11} />
                              {order.customer_phone || order.address?.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Address — hidden below lg */}
                        <td className="hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 max-w-[160px]">
                            <MapPin size={12} className="text-slate-300 shrink-0" />
                            <span className="text-xs text-slate-500 truncate">
                              {[order.address?.city, order.address?.state].filter(Boolean).join(', ') || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Payment */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <span className={`badge ${order.payment_method === 'cod' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {order.payment_method === 'cod' ? 'COD' : 'Online'}
                          </span>
                        </td>

                        {/* Status dropdown */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                              order.status === 'placed'           ? 'bg-blue-50 text-blue-600' :
                              order.status === 'packed'           ? 'bg-yellow-50 text-yellow-600' :
                              order.status === 'out_for_delivery' ? 'bg-orange-50 text-orange-600' :
                              order.status === 'delivered'        ? 'bg-emerald-50 text-emerald-600' :
                                                                    'bg-red-50 text-red-500'
                            }`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s === 'placed'           ? 'Placed' :
                                 s === 'packed'           ? 'Packed' :
                                 s === 'out_for_delivery' ? 'Out for Delivery' :
                                 s === 'delivered'        ? 'Delivered' : 'Cancelled'}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Amount */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <span className="font-semibold text-primary whitespace-nowrap">
                            {formatPrice(order.total_amount)}
                          </span>
                        </td>

                        {/* Date — hidden below md */}
                        <td className="hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(order.created_at)}</span>
                        </td>
                      </tr>

                      {expandedId === order.id && (
                        <OrderDetailPanel key={`detail-${order.id}`} order={order} />
                      )}
                    </React.Fragment>
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
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary btn-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === p ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary btn-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </motion.div>
  )
}

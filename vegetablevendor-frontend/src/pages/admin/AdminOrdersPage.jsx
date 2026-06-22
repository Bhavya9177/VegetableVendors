import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, CheckCircle, Package, Truck, MapPin, ShoppingCart,
  MessageSquare, Printer, ChevronDown, ChevronUp, ChevronRight, MoreVertical,
  X, User, Phone, StickyNote,
} from 'lucide-react'
import { useAdminOrders, useUpdateOrderStatus } from '../../api/orders'
import { StatusBadge } from '../../components/ui/Badge'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate, formatDateTime } from '../../utils/formatDate'
import toast from 'react-hot-toast'

const STATUSES = ['placed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']


const QUICK_ACTIONS = [
  { label: 'Confirm',            status: 'placed',           icon: CheckCircle, color: 'text-blue-600 hover:bg-blue-50' },
  { label: 'Packed',             status: 'packed',           icon: Package,     color: 'text-yellow-600 hover:bg-yellow-50' },
  { label: 'Out for Delivery',   status: 'out_for_delivery', icon: Truck,       color: 'text-orange-600 hover:bg-orange-50' },
  { label: 'Delivered',          status: 'delivered',        icon: CheckCircle, color: 'text-green-600 hover:bg-green-50' },
]

function OrderActionMenu({ order, onUpdateStatus }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-card-lg border border-gray-100 z-20 overflow-hidden py-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Update Status</p>
            {QUICK_ACTIONS.map(({ label, status, icon: Icon, color }) => (
              <button
                key={status}
                onClick={() => { onUpdateStatus(order, status); setOpen(false) }}
                disabled={order.status === status}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
            <div className="border-t border-gray-50 mt-1 pt-1">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors">
                <MessageSquare size={15} />
                Send WhatsApp
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Printer size={15} />
                Print Invoice
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function OrderDetailPanel({ order }) {
  const items = order.items || []
  const addr  = order.address

  return (
    <tr>
      <td colSpan={8} className="p-0 border-t-0">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 border-t border-gray-100 px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items table */}
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Order Items</p>
                {items.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No items found for this order.</p>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Item</th>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">Qty</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Unit Price</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-700">{item.product_name || '—'}</p>
                              <p className="text-xs text-slate-400">per {item.unit}</p>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatPrice(item.unit_price)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-800">
                              {formatPrice(item.unit_price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t border-gray-100">
                          <td colSpan={3} className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">
                            Order Total
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-primary">
                            {formatPrice(order.total_amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Address + meta */}
              <div className="space-y-4">
                {/* Customer info */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Customer</p>
                  <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <User size={13} className="text-slate-400 shrink-0" />
                      <span className="font-medium">{order.customer_name || '—'}</span>
                    </div>
                    {order.customer_email && (
                      <p className="text-xs text-slate-400 pl-5">{order.customer_email}</p>
                    )}
                    {(order.customer_phone || order.address?.phone) && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <a
                          href={`tel:${order.customer_phone || order.address?.phone}`}
                          className="text-primary hover:underline"
                        >
                          {order.customer_phone || order.address?.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery address */}
                {addr && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Delivery Address</p>
                    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 text-sm text-slate-600 space-y-0.5">
                      <p className="font-semibold text-slate-800">{addr.full_name}</p>
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.state} – {addr.pincode}</p>
                      <a
                        href={`tel:${addr.phone}`}
                        className="text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📞 {addr.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Order Notes</p>
                    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 text-sm text-slate-600 flex items-start gap-2">
                      <StickyNote size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{order.notes}</span>
                    </div>
                  </div>
                )}

                {/* Placed at */}
                <p className="text-xs text-slate-400">
                  Placed: {formatDateTime(order.created_at)}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </td>
    </tr>
  )
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(1)
  const [expandedId, setExpandedId]     = useState(null)

  const { data, isLoading, isError, error } = useAdminOrders({
    status: statusFilter || undefined,
    page,
    page_size: 20,
  })
  const { mutate: updateStatus } = useUpdateOrderStatus()

  const orders     = data?.data       || []
  const totalPages = data?.total_pages || 1
  const total      = data?.total       || 0

  const filtered = search
    ? orders.filter((o) => {
        const hay = [
          o.id,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          o.address?.full_name,
          o.address?.phone,
        ].join(' ').toLowerCase()
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

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order, customer, phone..."
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
        {/* Mobile: scrollable status chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none sm:hidden pb-0.5">
          {['', ...STATUSES].map((s) => {
            const label = !s ? 'All' : s === 'out_for_delivery' ? 'Dispatched' : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); setExpandedId(null) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-slate-600'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        {/* Desktop: select */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); setExpandedId(null) }}
          className="hidden sm:block input-field w-auto pr-8 shrink-0"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-box h-10 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-red-500 font-medium mb-1">Failed to load orders</p>
            <p className="text-slate-400 text-sm">{error?.response?.data?.data || error?.message || 'Check your connection or re-login as admin'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingCart size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">No orders found</p>
            <p className="text-slate-300 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Mobile: vendor-optimised card list */}
            <div className="sm:hidden space-y-2 p-2.5">
              {filtered.map((order) => {
                const si = STATUSES.indexOf(order.status)
                const nextStatus = (si >= 0 && si < 3) ? STATUSES[si + 1] : null
                const nextLabel =
                  nextStatus === 'packed'           ? 'Mark Packed' :
                  nextStatus === 'out_for_delivery' ? 'Dispatch' :
                  nextStatus === 'delivered'        ? 'Mark Delivered' : null
                const borderColor =
                  order.status === 'placed'           ? 'border-l-blue-400' :
                  order.status === 'packed'           ? 'border-l-yellow-400' :
                  order.status === 'out_for_delivery' ? 'border-l-orange-400' :
                  order.status === 'delivered'        ? 'border-l-emerald-400' :
                                                       'border-l-red-400'
                const statusBg =
                  order.status === 'placed'           ? 'bg-blue-50 text-blue-600' :
                  order.status === 'packed'           ? 'bg-yellow-50 text-yellow-600' :
                  order.status === 'out_for_delivery' ? 'bg-orange-50 text-orange-600' :
                  order.status === 'delivered'        ? 'bg-emerald-50 text-emerald-600' :
                                                       'bg-red-50 text-red-500'
                const statusLabel =
                  order.status === 'placed'           ? 'Placed' :
                  order.status === 'packed'           ? 'Packed' :
                  order.status === 'out_for_delivery' ? 'Dispatched' :
                  order.status === 'delivered'        ? 'Delivered' : 'Cancelled'

                return (
                  <React.Fragment key={order.id}>
                    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-l-[3px] ${borderColor}`}>
                      <div className="p-3 space-y-2.5">
                        {/* Row 1: Order# + date + payment badge + action menu */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-slate-700 text-sm shrink-0">#{order.id}</span>
                            <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`badge text-[10px] py-0.5 ${order.payment_method === 'cod' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                              {order.payment_method === 'cod' ? 'COD' : 'Online'}
                            </span>
                            <OrderActionMenu order={order} onUpdateStatus={handleStatusChange} />
                          </div>
                        </div>

                        {/* Row 2: Customer avatar + name + phone */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {(order.customer_name || order.address?.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 text-sm truncate">{order.customer_name || order.address?.full_name || '—'}</p>
                            {(order.customer_phone || order.address?.phone) ? (
                              <a
                                href={`tel:${order.customer_phone || order.address?.phone}`}
                                className="text-xs text-primary flex items-center gap-1 hover:underline"
                              >
                                <Phone size={10} className="shrink-0" />
                                {order.customer_phone || order.address?.phone}
                              </a>
                            ) : (
                              <p className="text-xs text-slate-400">—</p>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Amount + status + one-tap next-step + expand */}
                        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-base text-primary">{formatPrice(order.total_amount)}</span>
                            <span className={`badge text-[10px] py-0.5 shrink-0 ${statusBg}`}>{statusLabel}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {nextLabel && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(order, nextStatus) }}
                                className="flex items-center gap-1 text-[11px] font-semibold text-white bg-primary hover:bg-primary/90 active:scale-95 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                              >
                                {nextLabel}
                                <ChevronRight size={11} />
                              </button>
                            )}
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                              {expandedId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable detail panel */}
                    {expandedId === order.id && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden -mt-1"
                        >
                          <div className="bg-slate-50 border border-gray-100 border-t-0 rounded-b-xl mx-0 px-3 py-3 space-y-3">
                            {(order.items || []).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Order Items</p>
                                <div className="space-y-1.5">
                                  {(order.items || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-slate-700">{item.product_name || '—'} <span className="text-slate-400">× {item.quantity}</span></span>
                                      <span className="font-semibold text-slate-800">{formatPrice(item.unit_price * item.quantity)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-bold">
                                    <span className="text-slate-600">Total</span>
                                    <span className="text-primary">{formatPrice(order.total_amount)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {order.address && (
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Delivery Address</p>
                                <div className="bg-white rounded-xl border border-gray-100 p-2.5 text-xs space-y-0.5">
                                  <p className="font-semibold text-slate-800">{order.address.full_name}</p>
                                  <p className="text-slate-600">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                                  <p className="text-slate-600">{order.address.city}, {order.address.state} – {order.address.pincode}</p>
                                  <a
                                    href={`tel:${order.address.phone}`}
                                    className="text-primary flex items-center gap-1.5 mt-1 hover:underline text-xs"
                                  >
                                    <Phone size={11} className="shrink-0" />{order.address.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                            {order.notes && (
                              <div className="bg-yellow-50 text-yellow-700 rounded-xl px-3 py-2 text-xs flex items-start gap-2">
                                <StickyNote size={12} className="mt-0.5 shrink-0" />
                                {order.notes}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </React.Fragment>
                )
              })}
            </div>

            {/* Desktop: table with expandable rows */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        onClick={() => toggleExpand(order.id)}
                        className={`cursor-pointer transition-colors ${expandedId === order.id ? 'bg-primary-50' : 'hover:bg-slate-50/60'}`}
                      >
                        <td className="w-8 text-center">
                          <span className="text-slate-400">
                            {expandedId === order.id
                              ? <ChevronUp size={15} />
                              : <ChevronDown size={15} />}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(order.id) }}
                            className="font-bold text-primary hover:underline cursor-pointer"
                          >
                            #{order.id}
                          </button>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {(order.customer_name || order.address?.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-700 whitespace-nowrap text-sm">
                                {order.customer_name || order.address?.full_name || '—'}
                              </p>
                              {order.customer_email && (
                                <p className="text-[11px] text-slate-400 whitespace-nowrap">{order.customer_email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {(order.customer_phone || order.address?.phone) ? (
                            <a
                              href={`tel:${order.customer_phone || order.address?.phone}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Phone size={11} />
                              {order.customer_phone || order.address?.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 max-w-[180px]">
                            <MapPin size={12} className="text-slate-300 shrink-0" />
                            <span className="text-xs text-slate-500 truncate">
                              {[order.address?.city, order.address?.state].filter(Boolean).join(', ') || '—'}
                            </span>
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <span className={`badge ${order.payment_method === 'cod' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {order.payment_method === 'cod' ? 'COD' : 'Online'}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                              order.status === 'placed'           ? 'bg-blue-50   text-blue-600' :
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
                                 s === 'delivered'        ? 'Delivered' :
                                 'Cancelled'}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <span className="font-semibold text-primary whitespace-nowrap">{formatPrice(order.total_amount)}</span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
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

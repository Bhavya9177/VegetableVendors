import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, MessageSquare, ChevronRight, Package, Truck, CheckCircle, ClipboardList, Search, X, Wallet, BadgeCheck } from 'lucide-react'
import { useAdminOrders, useUpdateOrderStatus, useRecordPayment } from '../../api/orders'
import { formatPrice } from '../../utils/formatPrice'

const COLUMNS = [
  { key: 'placed',          label: 'Placed',          icon: ClipboardList, color: 'border-t-blue-400',   count_color: 'bg-blue-100 text-blue-700' },
  { key: 'packed',          label: 'Packed',          icon: Package,       color: 'border-t-yellow-400', count_color: 'bg-yellow-100 text-yellow-700' },
  { key: 'out_for_delivery',label: 'Out for Delivery',icon: Truck,         color: 'border-t-orange-400', count_color: 'bg-orange-100 text-orange-700' },
  { key: 'delivered',       label: 'Delivered',       icon: CheckCircle,   color: 'border-t-green-400',  count_color: 'bg-green-100 text-green-700' },
]

function PaymentModal({ order, onConfirm, onClose, loading }) {
  const [reference, setReference] = useState('')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-card-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <Wallet size={22} className="text-emerald-600" />
        </div>
        <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">Record Payment</h3>
        <p className="text-sm text-slate-500 mb-4">
          Order #{order.id} — <span className="font-semibold text-slate-700">{formatPrice(order.total_amount)}</span>
        </p>

        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <span className="text-base">💵</span>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</p>
            <p className="text-sm font-medium text-slate-800">
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online / UPI'}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Transaction Reference <span className="normal-case text-slate-400">(optional)</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="UPI ref, transaction ID, or cash note"
            className="input-field"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reference.trim())}
            disabled={loading}
            className="flex-1 btn-primary justify-center py-2.5 disabled:opacity-50"
          >
            <BadgeCheck size={15} />
            {loading ? 'Saving…' : 'Mark Delivered & Paid'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DeliveryCard({ order, onMove, onMarkDelivered }) {
  const colIndex = COLUMNS.findIndex((c) => c.key === order.status)
  const nextCol  = COLUMNS[colIndex + 1]
  const addr     = order.address

  const isPaid = order.payment_status === 'paid'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 hover:shadow-card-lg transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{order.customer_name || addr?.full_name || '—'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Order #{order.id}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className={`badge shrink-0 ${order.payment_method === 'cod' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
            {order.payment_method === 'cod' ? 'COD' : 'Online'}
          </span>
          {order.status === 'delivered' && (
            <span className={`badge shrink-0 ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {isPaid ? '✓ Paid' : 'Unpaid'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-600">
        {addr && (
          <div className="flex items-start gap-2">
            <MapPin size={12} className="text-slate-300 mt-0.5 shrink-0" />
            <span className="leading-snug">{[addr.line1, addr.city].filter(Boolean).join(', ')}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Phone size={12} className="text-slate-300 shrink-0" />
          <span>{order.customer_phone || addr?.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-slate-300 shrink-0" />
          <span>{order.delivery_window || '—'}</span>
        </div>
        {order.notes && (
          <div className="bg-yellow-50 text-yellow-700 rounded-lg px-2 py-1 text-[11px] font-medium">
            📝 {order.notes}
          </div>
        )}
        {order.payment_reference && (
          <div className="bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 text-[11px] font-medium">
            💳 Ref: {order.payment_reference}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="font-bold text-primary text-sm">{formatPrice(order.total_amount)}</span>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="WhatsApp">
            <MessageSquare size={14} />
          </button>
          {nextCol && (
            <button
              onClick={() =>
                nextCol.key === 'delivered'
                  ? onMarkDelivered(order)
                  : onMove(order.id, nextCol.key)
              }
              className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              {nextCol.key === 'delivered' ? 'Mark Delivered' : `→ ${nextCol.label}`}
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDeliveriesPage() {
  const { data, isLoading, isError } = useAdminOrders({ page_size: 200 }, { refetchInterval: 30000 })
  const { mutate: updateStatus } = useUpdateOrderStatus()
  const { mutate: recordPayment, isPending: recordingPayment } = useRecordPayment()
  const [search, setSearch]         = useState('')
  const [activeTab, setActiveTab]   = useState('placed')
  const [paymentOrder, setPaymentOrder] = useState(null)

  const allOrders = (data?.data || []).filter((o) => o.status !== 'cancelled')

  const q = search.trim().toLowerCase()
  const filtered = q
    ? allOrders.filter((o) =>
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.address?.full_name || '').toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        (o.customer_phone || '').includes(q)
      )
    : allOrders

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = filtered.filter((o) => o.status === col.key)
    return acc
  }, {})

  const handleMove = (orderId, newStatus) => {
    updateStatus({ id: orderId, status: newStatus })
  }

  const handleMarkDelivered = (order) => {
    setPaymentOrder(order)
  }

  const handleConfirmDelivery = (reference) => {
    recordPayment(
      { id: paymentOrder.id, payment_reference: reference },
      {
        onSuccess: () => {
          updateStatus({ id: paymentOrder.id, status: 'delivered' })
          setPaymentOrder(null)
        },
      }
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="page-title">Deliveries</h1>
          <p className="page-subtitle">
            {q ? `${filtered.length} of ${allOrders.length} orders` : `${allOrders.length} active deliveries`} — click to advance status
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or order #"
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="rounded-2xl border border-gray-100 bg-slate-50/80 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-white/80">
                <div className="skeleton-box h-5 w-32 rounded-lg" />
              </div>
              <div className="p-3 space-y-3">
                {[1, 2].map((i) => <div key={i} className="skeleton-box h-32 rounded-2xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 text-center">
          <p className="text-red-500 font-medium">Failed to load deliveries</p>
        </div>
      ) : (
        <>
          {/* Mobile / tablet: tab strip + single active column */}
          <div className="xl:hidden space-y-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {COLUMNS.map(({ key, label, icon: Icon, count_color }) => {
                const count = grouped[key]?.length || 0
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                      activeTab === key
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-slate-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                    <span className={`ml-0.5 min-w-[16px] px-1 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === key ? 'bg-white/25 text-white' : count_color
                    }`}>{count}</span>
                  </button>
                )
              })}
            </div>
            {(() => {
              const col = COLUMNS.find((c) => c.key === activeTab)
              const items = grouped[activeTab] || []
              return items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <col.icon size={36} className="text-slate-200 mb-2" />
                  <p className="text-sm font-medium text-slate-400">No {col.label.toLowerCase()} orders</p>
                  <p className="text-xs text-slate-300 mt-0.5">Orders will appear here when ready</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((order) => (
                    <DeliveryCard
                      key={order.id}
                      order={order}
                      onMove={handleMove}
                      onMarkDelivered={handleMarkDelivered}
                    />
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Desktop: 4-column kanban */}
          <div className="hidden xl:grid xl:grid-cols-4 gap-4 items-start">
            {COLUMNS.map(({ key, label, icon: Icon, color, count_color }) => {
              const items = grouped[key] || []
              return (
                <div key={key} className={`rounded-2xl border-t-4 bg-slate-50/80 border border-gray-100 ${color} overflow-hidden`}>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white/80">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-slate-500" />
                      <span className="font-semibold text-slate-700 text-sm">{label}</span>
                    </div>
                    <span className={`badge text-xs font-bold ${count_color}`}>{items.length}</span>
                  </div>
                  <div className="p-3 space-y-3 min-h-24">
                    {items.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-slate-300">
                        <Icon size={24} />
                      </div>
                    ) : (
                      items.map((order) => (
                        <DeliveryCard
                          key={order.id}
                          order={order}
                          onMove={handleMove}
                          onMarkDelivered={handleMarkDelivered}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          loading={recordingPayment}
          onClose={() => setPaymentOrder(null)}
          onConfirm={handleConfirmDelivery}
        />
      )}
    </motion.div>
  )
}

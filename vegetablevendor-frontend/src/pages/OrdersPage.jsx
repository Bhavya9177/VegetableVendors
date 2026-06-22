import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck, ShoppingBag, RefreshCw } from 'lucide-react'
import { useOrders } from '../api/orders'
import { StatusBadge } from '../components/ui/Badge'
import { formatPrice } from '../utils/formatPrice'
import { formatDate } from '../utils/formatDate'

const STEPS = ['placed', 'packed', 'out_for_delivery', 'delivered']
const STEP_LABELS = {
  placed: 'Placed',
  packed: 'Packed',
  out_for_delivery: 'Shipped',
  delivered: 'Delivered',
}

const FILTER_TABS = [
  { key: '',                label: 'All Orders' },
  { key: 'placed',         label: 'Pending' },
  { key: 'out_for_delivery', label: 'On the Way' },
  { key: 'delivered',      label: 'Delivered' },
  { key: 'cancelled',      label: 'Cancelled' },
]

function OrderProgressBar({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5 mt-3">
        <XCircle size={14} className="text-red-400" />
        <span className="text-xs text-red-500 font-medium">Order Cancelled</span>
      </div>
    )
  }

  const currentIdx = STEPS.indexOf(status)
  // Place dots at 1/8, 3/8, 5/8, 7/8 of the bar so the fill always
  // extends to the active dot (even for 'placed' which is step 0).
  const dotPct = (i) => ((2 * i + 1) / (2 * STEPS.length)) * 100
  const progressPct = currentIdx < 0 ? 0 : dotPct(currentIdx)

  return (
    <div className="mt-3">
      <div className="relative h-1.5 bg-gray-100 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
        {STEPS.map((step, i) => {
          const pct = dotPct(i)
          const done = i <= currentIdx
          return (
            <div
              key={step}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                done ? 'bg-primary border-primary shadow-sm' : 'bg-white border-gray-200'
              }`}
              style={{ left: `calc(${pct}% - 6px)` }}
            />
          )
        })}
      </div>
      <div className="relative mt-1.5 h-4">
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={`absolute text-[10px] font-semibold -translate-x-1/2 ${i <= currentIdx ? 'text-primary' : 'text-slate-300'}`}
            style={{ left: `${dotPct(i)}%` }}
          >
            {STEP_LABELS[step]}
          </span>
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order }) {
  const itemNames = order.items?.slice(0, 2).map((i) => i.product_name).join(', ')
  const moreSuffix = (order.items?.length || 0) > 2 ? ` +${(order.items?.length || 0) - 2} more` : ''

  return (
    <Link
      to={`/orders/${order.id}`}
      className="card block p-4 sm:p-5 hover:shadow-card-lg transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          order.status === 'delivered'  ? 'bg-emerald-50' :
          order.status === 'cancelled'  ? 'bg-red-50' :
          order.status === 'out_for_delivery' ? 'bg-orange-50' :
          'bg-primary-50'
        }`}>
          {order.status === 'delivered'  ? <CheckCircle size={22} className="text-emerald-500" /> :
           order.status === 'cancelled'  ? <XCircle     size={22} className="text-red-400" /> :
           order.status === 'out_for_delivery' ? <Truck size={22} className="text-orange-500" /> :
           <Package size={22} className="text-primary" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading font-bold text-slate-800">Order #{order.id}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{itemNames}{moreSuffix}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={order.status} />
              <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="font-bold text-primary text-base">{formatPrice(order.total_amount)}</p>
            <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
          </div>

          <OrderProgressBar status={order.status} />
        </div>
      </div>
    </Link>
  )
}

function OrderSkeleton() {
  return (
    <div className="card p-5 space-y-3 animate-skeleton">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-3 bg-slate-200 rounded w-48" />
          <div className="h-3 bg-slate-200 rounded w-24 mt-2" />
          <div className="h-2 bg-slate-200 rounded-full mt-3" />
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('')
  const { data, isLoading, isFetching, refetch } = useOrders()
  const allOrders = data?.data || []

  const filtered = activeFilter
    ? allOrders.filter((o) => o.status === activeFilter)
    : allOrders

  const activeCount = allOrders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-800">My Orders</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {allOrders.length} total orders
                {activeCount > 0 && <span className="ml-2 text-primary font-semibold">· {activeCount} active</span>}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh orders"
              className="btn-secondary btn-sm"
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-thin">
          {FILTER_TABS.map(({ key, label }) => {
            const count = key ? allOrders.filter((o) => o.status === key).length : allOrders.length
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-gray-100 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                    activeFilter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </motion.div>

        {/* Orders */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Package size={28} className="text-slate-300" />
              </div>
              <p className="font-semibold text-slate-600 mb-1">
                {activeFilter ? `No ${activeFilter} orders` : 'No orders yet'}
              </p>
              <p className="text-sm text-slate-400 mb-4">
                {activeFilter ? 'Try a different filter.' : 'Your order history will appear here.'}
              </p>
              {!activeFilter && (
                <Link to="/shop" className="btn-primary">
                  Start Shopping
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <OrderCard order={order} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

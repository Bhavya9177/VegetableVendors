import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, XCircle, MapPin, Wallet, CheckCircle, Package, Truck, Clock, RefreshCw, ShoppingCart, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useOrder, useCancelOrder, useReorder, useConfirmPayment } from '../api/orders'
import { useOrderIssues, useReportIssue } from '../api/orderIssues'
import { StatusBadge } from '../components/ui/Badge'
import { formatPrice } from '../utils/formatPrice'
import { formatDateTime } from '../utils/formatDate'

const STEPS = [
  { key: 'placed',           label: 'Order Placed',     icon: '📋' },
  { key: 'packed',           label: 'Packed',           icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered',        label: 'Delivered',        icon: '✅' },
]

function StatusTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
        <XCircle size={20} className="text-red-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
          <p className="text-xs text-slate-500">This order was cancelled.</p>
        </div>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status)
  const progressPct = currentIdx > 0 ? (currentIdx / (STEPS.length - 1)) * (100 - 10) : 0

  return (
    <div className="relative">
      {/* Grey track */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" style={{ zIndex: 0 }} />
      {/* Colored progress */}
      <div
        className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-700"
        style={{ width: `${progressPct}%`, zIndex: 1 }}
      />

      <div className="relative flex justify-between" style={{ zIndex: 2 }}>
        {STEPS.map((step, i) => {
          const done    = i <= currentIdx
          const current = i === currentIdx
          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-base transition-all duration-500 ${
                done
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-gray-200 text-gray-300'
              } ${current ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                {done && i < currentIdx ? <CheckCircle size={18} className="text-white" /> : step.icon}
              </div>
              <span className={`text-[11px] font-semibold text-center leading-snug ${done ? 'text-primary' : 'text-slate-400'}`}>
                {step.label}
                {current && (
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-primary/70 mt-0.5">
                    Current
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CancelModal({ orderId, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-card-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
          <XCircle size={22} className="text-red-500" />
        </div>
        <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">Cancel Order?</h3>
        <p className="text-sm text-slate-500 mb-5">
          Order #{orderId} will be cancelled. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5">Keep Order</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const ISSUE_TYPE_LABELS = {
  missing_item:   'Missing Item',
  wrong_item:     'Wrong Item',
  bad_quality:    'Bad Quality',
  late_delivery:  'Late Delivery',
  damaged:        'Damaged Product',
  other:          'Other',
}

const ISSUE_STATUS_META = {
  open:       { label: 'Open',       bg: 'bg-red-50',    text: 'text-red-600' },
  reviewing:  { label: 'Reviewing',  bg: 'bg-yellow-50', text: 'text-yellow-700' },
  resolved:   { label: 'Resolved',   bg: 'bg-emerald-50',text: 'text-emerald-700' },
}

const RESOLUTION_LABELS = {
  refund: 'Refund issued', replacement: 'Replacement arranged',
  credit: 'Credit note added', none: 'No action required',
}

function PaymentConfirmCard({ order, onSuccess }) {
  const { mutate: confirmPayment, isPending } = useConfirmPayment()

  const paymentStatus = order.payment_status || 'pending'

  if (paymentStatus === 'paid') {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800">Payment Confirmed</p>
            <p className="text-xs text-slate-400 mt-0.5">Your payment has been verified.</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">Paid</span>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'submitted') {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800">Payment Under Review</p>
            <p className="text-xs text-slate-400 mt-0.5">Awaiting admin verification.</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">Pending</span>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    confirmPayment({ id: order.id, payment_reference: 'Cash' }, { onSuccess })
  }

  return (
    <div className="card overflow-hidden" style={{ borderColor: '#fde68a' }}>
      <div className="px-5 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <Wallet size={15} className="text-amber-600" />
        <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-widest">Confirm Your Payment</h2>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-600">
          Your order has been delivered. Please confirm cash payment of{' '}
          <span className="font-bold text-slate-800">{formatPrice(order.total_amount)}</span>.
        </p>

        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          <span className="text-xl">💵</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Cash on Delivery</p>
            <p className="text-xs text-slate-400">Pay the delivery person in cash</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full btn-primary justify-center py-3 disabled:opacity-50"
        >
          {isPending ? 'Submitting…' : 'Confirm Cash Payment'}
        </button>
      </div>
    </div>
  )
}

function ReportIssueModal({ orderId, onClose }) {
  const [issueType, setIssueType]   = useState('')
  const [description, setDescription] = useState('')
  const { mutate: report, isPending } = useReportIssue()

  const handleSubmit = () => {
    if (!issueType || !description.trim()) return
    report({ orderId, issue_type: issueType, description: description.trim() }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-card-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
          <AlertCircle size={22} className="text-amber-600" />
        </div>
        <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">Report an Issue</h3>
        <p className="text-sm text-slate-500 mb-5">Tell us what went wrong and we'll make it right.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Issue Type *</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="input-field"
            >
              <option value="">Select issue type…</option>
              {Object.entries(ISSUE_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the problem in detail…"
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !issueType || !description.trim()}
            className="flex-1 btn-primary justify-center py-2.5 disabled:opacity-50"
          >
            {isPending ? 'Submitting…' : 'Submit Issue'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading, isFetching, isError, refetch } = useOrder(id)
  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder()
  const { mutate: reorder, isPending: reordering } = useReorder()
  const { data: issues = [] } = useOrderIssues(id)
  const navigate = useNavigate()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showIssueModal, setShowIssueModal]   = useState(false)
  const [showIssues, setShowIssues]           = useState(false)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 h-28 skeleton-box animate-skeleton" />
        ))}
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-slate-300" />
        </div>
        <p className="font-semibold text-slate-600 mb-1">
          {isError ? 'Could not load order' : 'Order not found'}
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {isError ? 'There was a problem fetching this order.' : 'This order does not exist or you don\'t have access to it.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          {isError && (
            <button onClick={() => refetch()} className="btn-primary">
              <RefreshCw size={15} />
              Retry
            </button>
          )}
          <Link to="/orders" className="btn-secondary">Back to Orders</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Back + header */}
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft size={15} />
            Back to Orders
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-800">Order #{order.id}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(order.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={order.status} />
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh status"
                className="btn-secondary btn-sm"
              >
                <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => navigate(`/orders/${order.id}/invoice`)}
                className="btn-secondary btn-sm"
              >
                <FileText size={14} />
                Invoice
              </button>
              {order.status === 'placed' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="btn-sm inline-flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                >
                  <XCircle size={14} />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Delivered banner */}
          {order.status === 'delivered' && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
              <CheckCircle size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Order Delivered!</p>
                <p className="text-xs text-slate-500">Thank you for shopping with VegFresh.</p>
              </div>
            </div>
          )}

          {/* Status tracker */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Order Status</h2>
            <StatusTracker status={order.status} />
            {order.delivery_window && !['delivered', 'cancelled'].includes(order.status) && (
              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-2.5">
                <Clock size={14} className="text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expected Delivery</p>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">{order.delivery_window}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment confirmation — shown when delivered */}
          {order.status === 'delivered' && (
            <PaymentConfirmCard order={order} />
          )}

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-heading font-semibold text-slate-800">Items Ordered</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product_image
                      ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      : <span className="text-2xl">🥦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 text-sm">{item.product_name}</p>
                    <p className="text-xs text-slate-400">
                      {formatPrice(item.unit_price)}/{item.unit} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-700 text-sm shrink-0">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className="px-5 py-4 border-t border-gray-50 space-y-2 bg-slate-50/50">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Delivery</span>
                {order.delivery_fee > 0
                  ? <span>{formatPrice(order.delivery_fee)}</span>
                  : <span className="text-emerald-600 font-medium">FREE</span>
                }
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-heading font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Address + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-primary" />
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Delivery Address</h2>
              </div>
              {order.address ? (
                <div className="text-sm text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">{order.address.full_name}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
                  <p className="text-slate-400 text-xs mt-1">📞 {order.address.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No address on record</p>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={15} className="text-primary" />
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Payment</h2>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl shrink-0">💵</div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">Cash on Delivery</p>
                  <p className="text-xs text-slate-400">Pay on arrival</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Items total</span>
                  <span>{formatPrice(order.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Delivery</span>
                  {order.delivery_fee > 0
                    ? <span>{formatPrice(order.delivery_fee)}</span>
                    : <span className="text-emerald-600 font-medium">FREE</span>
                  }
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-amber-200">
                  <span className="text-amber-800">Amount due (COD)</span>
                  <span className="text-amber-700">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Order Notes</p>
                  <p className="text-sm text-slate-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice CTA */}
          <div className="card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-slate-800">Download Invoice</p>
              <p className="text-xs text-slate-400 mt-0.5">View or print a receipt for this order</p>
            </div>
            <button
              onClick={() => navigate(`/orders/${order.id}/invoice`)}
              className="btn-primary shrink-0"
            >
              <FileText size={16} />
              View Invoice
            </button>
          </div>

          {/* Reorder CTA */}
          <div className="card p-5 flex items-center justify-between gap-4 border-primary/20 bg-primary-50/40">
            <div>
              <p className="font-semibold text-sm text-slate-800">Order Again</p>
              <p className="text-xs text-slate-500 mt-0.5">Add all items from this order back to your cart</p>
            </div>
            <button
              onClick={() => reorder(order.id)}
              disabled={reordering}
              className="btn-primary shrink-0 disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              {reordering ? 'Adding to Cart…' : 'Reorder'}
            </button>
          </div>

          {/* Report Issue — only for delivered orders */}
          {order.status === 'delivered' && (
            <div className="card overflow-hidden">
              <div className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-slate-800">Report an Issue</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {issues.length > 0
                      ? `${issues.length} issue${issues.length > 1 ? 's' : ''} reported`
                      : 'Missing item, wrong product, or quality concern?'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {issues.length > 0 && (
                    <button
                      onClick={() => setShowIssues((s) => !s)}
                      className="btn-secondary btn-sm"
                    >
                      {showIssues ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {showIssues ? 'Hide' : 'View'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowIssueModal(true)}
                    className="btn-sm inline-flex items-center gap-1.5 border border-amber-200 text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                  >
                    <AlertCircle size={13} />
                    Report Issue
                  </button>
                </div>
              </div>

              {showIssues && issues.length > 0 && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {issues.map((issue) => {
                    const meta = ISSUE_STATUS_META[issue.status] || ISSUE_STATUS_META.open
                    return (
                      <div key={issue.id} className="px-5 py-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-700">{ISSUE_TYPE_LABELS[issue.issue_type] || issue.issue_type}</p>
                          <span className={`badge text-xs ${meta.bg} ${meta.text}`}>{meta.label}</span>
                        </div>
                        <p className="text-xs text-slate-500">{issue.description}</p>
                        {issue.resolution_type && issue.resolution_type !== 'none' && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                            <p className="text-xs font-semibold text-emerald-700">{RESOLUTION_LABELS[issue.resolution_type]}</p>
                            {issue.resolution_notes && (
                              <p className="text-xs text-emerald-600 mt-0.5">{issue.resolution_notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {showCancelModal && (
        <CancelModal
          orderId={order.id}
          loading={cancelling}
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => cancelOrder(order.id, { onSuccess: () => setShowCancelModal(false) })}
        />
      )}

      {showIssueModal && (
        <ReportIssueModal
          orderId={order.id}
          onClose={() => setShowIssueModal(false)}
        />
      )}
    </div>
  )
}

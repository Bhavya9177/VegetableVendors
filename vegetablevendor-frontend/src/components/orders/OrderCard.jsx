import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { StatusBadge } from '../ui/Badge'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'

const STEPS = ['placed', 'packed', 'out_for_delivery', 'delivered']
const STEP_LABELS = { placed: 'Placed', packed: 'Packed', out_for_delivery: 'Shipped', delivered: 'Delivered' }

function MiniProgressBar({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="mt-2">
        <span className="text-xs text-red-500 font-medium">❌ Order Cancelled</span>
      </div>
    )
  }

  const currentIdx = STEPS.indexOf(status)
  const progressPct = currentIdx < 0 ? 0 : (currentIdx / (STEPS.length - 1)) * 100

  return (
    <div className="mt-2.5">
      {/* Track */}
      <div className="relative h-1.5 bg-gray-100 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
        {/* Step dots */}
        {STEPS.map((step, i) => {
          const stepPct  = (i / (STEPS.length - 1)) * 100
          const done     = i <= currentIdx
          return (
            <div
              key={step}
              className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                done ? 'bg-primary border-primary' : 'bg-white border-gray-200'
              }`}
              style={{ left: `calc(${stepPct}% - 5px)` }}
            />
          )
        })}
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={`text-[10px] font-medium ${i <= currentIdx ? 'text-primary' : 'text-slate-300'}`}
          >
            {STEP_LABELS[step]}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function OrderCard({ order }) {
  const itemCount = order.items?.length || 0
  const itemNames = order.items?.slice(0, 2).map((i) => i.product_name).join(', ')
  const moreSuffix = itemCount > 2 ? ` +${itemCount - 2} more` : ''

  return (
    <Link
      to={`/orders/${order.id}`}
      className="card p-4 block hover:border-primary transition-colors group"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xl">📦</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-heading font-semibold text-sm text-text">Order #{order.id}</p>
            <StatusBadge status={order.status} />
          </div>

          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {itemNames}{moreSuffix}
          </p>

          <div className="flex items-center justify-between mt-1">
            <p className="text-primary font-bold text-sm">{formatPrice(order.total_amount)}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>{formatDate(order.created_at)}</span>
              <ChevronRightIcon className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            </div>
          </div>

          <MiniProgressBar status={order.status} />
        </div>
      </div>
    </Link>
  )
}

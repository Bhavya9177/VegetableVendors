import { CheckCircleIcon } from '@heroicons/react/24/solid'

const STEPS = ['placed', 'packed', 'out_for_delivery', 'delivered']
const LABELS = {
  placed: 'Placed',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
}
const ICONS = {
  placed: '📋',
  packed: '📦',
  out_for_delivery: '🚚',
  delivered: '✅',
}

export default function OrderStatusTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500">This order has been cancelled.</p>
        </div>
      </div>
    )
  }

  const currentIndex = STEPS.indexOf(status)

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" style={{ zIndex: 0 }} />
      <div
        className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
        style={{
          width: currentIndex > 0 ? `${(currentIndex / (STEPS.length - 1)) * (100 - 10)}%` : '0%',
          zIndex: 1,
        }}
      />

      <div className="relative flex justify-between" style={{ zIndex: 2 }}>
        {STEPS.map((step, i) => {
          const done = i <= currentIndex
          const current = i === currentIndex
          return (
            <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-base transition-all ${
                  done
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-200 text-gray-300'
                } ${current ? 'ring-4 ring-primary/20' : ''}`}
              >
                {done ? (i < currentIndex ? '✓' : ICONS[step]) : ICONS[step]}
              </div>
              <span
                className={`text-xs font-medium text-center leading-snug ${
                  done ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {LABELS[step]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

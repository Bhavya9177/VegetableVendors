const statusMap = {
  placed:           { label: 'Placed',           cls: 'bg-blue-50 text-blue-700' },
  packed:           { label: 'Packed',           cls: 'bg-yellow-50 text-yellow-700' },
  out_for_delivery: { label: 'Out for Delivery', cls: 'bg-orange-50 text-orange-700' },
  delivered:        { label: 'Delivered',        cls: 'bg-emerald-50 text-emerald-700' },
  cancelled:        { label: 'Cancelled',        cls: 'bg-red-50 text-red-700' },
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold'
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    green:   'bg-emerald-50 text-emerald-700',
    yellow:  'bg-yellow-50 text-yellow-700',
    red:     'bg-red-50 text-red-700',
    blue:    'bg-blue-50 text-blue-700',
    orange:  'bg-orange-50 text-orange-700',
    purple:  'bg-purple-50 text-purple-700',
  }
  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const info = statusMap[status] || { label: status, cls: 'bg-slate-100 text-slate-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${info.cls}`}>
      {info.label}
    </span>
  )
}

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const colorMap = {
  green:  { bg: 'bg-emerald-50',  iconBg: 'bg-emerald-500',  text: 'text-emerald-600',  ring: 'ring-emerald-100' },
  blue:   { bg: 'bg-blue-50',     iconBg: 'bg-blue-500',     text: 'text-blue-600',     ring: 'ring-blue-100' },
  orange: { bg: 'bg-orange-50',   iconBg: 'bg-orange-500',   text: 'text-orange-600',   ring: 'ring-orange-100' },
  red:    { bg: 'bg-red-50',      iconBg: 'bg-red-500',      text: 'text-red-600',      ring: 'ring-red-100' },
  yellow: { bg: 'bg-yellow-50',   iconBg: 'bg-yellow-500',   text: 'text-yellow-600',   ring: 'ring-yellow-100' },
  purple: { bg: 'bg-purple-50',   iconBg: 'bg-purple-500',   text: 'text-purple-600',   ring: 'ring-purple-100' },
  teal:   { bg: 'bg-teal-50',     iconBg: 'bg-teal-500',     text: 'text-teal-600',     ring: 'ring-teal-100' },
}

export default function MetricCard({ label, value, icon: Icon, iconEmoji, color = 'green', subtitle, trend, trendValue }) {
  const c = colorMap[color] || colorMap.green

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${c.iconBg} flex items-center justify-center shadow-sm ring-4 ${c.ring} shrink-0`}>
          {Icon ? (
            <Icon size={20} className="text-white" />
          ) : (
            <span className="text-lg">{iconEmoji}</span>
          )}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            trend > 0 ? 'bg-emerald-50 text-emerald-600' :
            trend < 0 ? 'bg-red-50 text-red-500' :
            'bg-slate-50 text-slate-500'
          }`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>{trendValue || `${Math.abs(trend)}%`}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-slate-800">{value ?? '—'}</p>
      <p className="text-sm font-medium text-slate-500 mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  )
}

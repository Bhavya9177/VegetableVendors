import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboard, useAdminUsers } from '../../api/admin'
import { formatPrice } from '../../utils/formatPrice'

const COLORS = ['#16A34A', '#F97316', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6']

const PIE_COLORS = { cod: '#F97316', online: '#16A34A', other: '#94A3B8' }

const STATUS_LABEL = {
  placed:           'Placed',
  packed:           'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-card-lg px-3 py-2.5 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name === 'Revenue' ? formatPrice(p.value) : `${p.value} orders`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminAnalyticsPage() {
  const { data: dashData, isLoading } = useDashboard()
  const { data: usersData }           = useAdminUsers({ per_page: 1 })

  const stats          = dashData?.data   || {}
  const totalCustomers = usersData?.total || 0

  // Revenue and orders — both restricted to delivered orders for consistency
  const totalRevenue = stats.total_revenue || 0
  const totalOrders  = stats.total_orders  || 0

  // Avg order value: delivered revenue ÷ delivered order count (same numerator & denominator)
  const deliveredCount  = useMemo(
    () => (stats.orders_by_status || []).find((s) => s.status === 'delivered')?.count || 0,
    [stats.orders_by_status]
  )
  const avgOrderValue = deliveredCount > 0 ? Math.round(totalRevenue / deliveredCount) : 0

  // Revenue by month — from dashboard (delivered orders only, all-time)
  const revenueByMonth = stats.revenue_by_month || []

  // Orders by status — from dashboard
  const ordersByStatus = useMemo(
    () => (stats.orders_by_status || []).map((s) => ({
      status: STATUS_LABEL[s.status] || s.status,
      count:  s.count,
    })),
    [stats.orders_by_status]
  )

  // Payment breakdown — from dashboard (all-time, not capped at 200)
  const paymentData = useMemo(() => {
    if (!stats.payment_breakdown?.length) return []
    const LABEL = { cod: 'COD', online: 'Online', other: 'Other' }
    return stats.payment_breakdown.map((p) => ({
      name:  LABEL[p.method] ?? p.method,
      value: p.count,
      color: PIE_COLORS[p.method] ?? '#94A3B8',
    }))
  }, [stats.payment_breakdown])

  // Top products — from dashboard (aggregated server-side over all delivered orders)
  const topProducts = stats.top_selling_products || []

  const kpis = [
    { label: 'Total Revenue',   value: isLoading ? '—' : formatPrice(totalRevenue),       icon: DollarSign,   color: 'bg-emerald-500 ring-emerald-100' },
    { label: 'Total Orders',    value: isLoading ? '—' : totalOrders.toLocaleString(),    icon: ShoppingCart, color: 'bg-blue-500 ring-blue-100' },
    { label: 'Customers',       value: isLoading ? '—' : totalCustomers.toLocaleString(), icon: Users,        color: 'bg-purple-500 ring-purple-100' },
    { label: 'Avg Order Value', value: isLoading ? '—' : formatPrice(avgOrderValue),      icon: Package,      color: 'bg-orange-500 ring-orange-100' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-2xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Business performance overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => {
          const [iconColor, ringColor] = color.split(' ')
          return (
            <div key={label} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-2xl ${iconColor} flex items-center justify-center ring-4 ${ringColor}`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              {isLoading
                ? <div className="skeleton-box h-7 w-24 rounded-lg mb-1" />
                : <p className="text-2xl font-bold font-heading text-slate-800">{value}</p>}
              <p className="text-sm text-slate-500 mt-0.5">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Revenue trend */}
      <div className="card p-5">
        <div className="mb-5">
          <h2 className="font-heading font-semibold text-slate-800">Revenue Trend</h2>
          <p className="text-xs text-slate-400 mt-0.5">Monthly revenue — delivered orders only</p>
        </div>
        {isLoading ? (
          <div className="h-[240px] skeleton-box rounded-xl" />
        ) : revenueByMonth.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No delivered orders yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByMonth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#16A34A" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#16A34A', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mid row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Orders by status */}
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-slate-800 mb-1">Orders by Status</h2>
          <p className="text-xs text-slate-400 mb-5">All-time order status distribution</p>
          {isLoading ? (
            <div className="h-[220px] skeleton-box rounded-xl" />
          ) : ordersByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersByStatus} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Orders" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment breakdown */}
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-slate-800 mb-1">Payment Methods</h2>
          <p className="text-xs text-slate-400 mb-5">COD vs Online — all-time orders</p>
          {isLoading ? (
            <div className="h-[220px] skeleton-box rounded-xl" />
          ) : paymentData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {paymentData.map((p, i) => (
                      <Cell key={i} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [`${v} orders`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {paymentData.map((p) => {
                  const total = paymentData.reduce((s, x) => s + x.value, 0)
                  const pct   = total > 0 ? Math.round((p.value / total) * 100) : 0
                  return (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                        <span className="text-slate-600">{p.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{p.value} orders ({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="card p-5">
        <h2 className="font-heading font-semibold text-slate-800 mb-1">Top Performing Products</h2>
        <p className="text-xs text-slate-400 mb-5">By revenue — delivered orders, all time</p>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-box h-10 rounded-xl" />)}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-slate-300 text-sm">No product data yet</div>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const maxRevenue = topProducts[0].revenue
              const pct = maxRevenue > 0 ? Math.round((p.revenue / maxRevenue) * 100) : 0
              return (
                <div key={p.id ?? p.name} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: COLORS[i] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{p.name}</span>
                      <span className="text-slate-500">
                        {p.units_sold} sold · <span className="text-primary font-semibold">{formatPrice(p.revenue)}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

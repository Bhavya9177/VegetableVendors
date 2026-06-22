import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useDashboard, useAdminUsers } from '../../api/admin'
import { useAdminOrders } from '../../api/orders'
import { formatPrice } from '../../utils/formatPrice'

const COLORS = ['#16A34A', '#F97316', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6']

const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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
            {p.name}: {p.name === 'Revenue' ? formatPrice(p.value * 100) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminAnalyticsPage() {
  const { data: dashData,  isLoading: dashLoading  } = useDashboard()
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders({ page_size: 200 })
  const { data: usersData  } = useAdminUsers({ per_page: 1 })

  const stats     = dashData?.data      || {}
  const allOrders = ordersData?.data    || []
  const totalCustomers = usersData?.total || 0

  // KPI values
  const totalRevenue   = stats.total_revenue || 0
  const totalOrders    = stats.total_orders  || 0
  const avgOrderValue  = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Revenue trend grouped by month
  const revenueByMonth = useMemo(() => {
    const map = {}
    allOrders.forEach((o) => {
      const month = new Date(o.created_at).toLocaleString('en-US', { month: 'short' })
      if (!map[month]) map[month] = { month, revenue: 0, orders: 0 }
      map[month].revenue += o.total_amount / 100
      map[month].orders  += 1
    })
    return MONTH_ORDER.filter((m) => map[m]).map((m) => map[m])
  }, [allOrders])

  // Orders by status (from dashboard)
  const ordersByStatus = useMemo(() =>
    (stats.orders_by_status || []).map((s) => ({
      status: STATUS_LABEL[s.status] || s.status,
      count: s.count,
    })),
    [stats.orders_by_status]
  )

  // Top products aggregated from order items
  const topProducts = useMemo(() => {
    const map = {}
    allOrders.forEach((o) => {
      ;(o.items || []).forEach((item) => {
        const key = item.product_name || `#${item.product_id}`
        if (!map[key]) map[key] = { name: key, sales: 0, revenue: 0 }
        map[key].sales   += item.quantity
        map[key].revenue += (item.unit_price * item.quantity) / 100
      })
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6)
  }, [allOrders])

  // Payment method breakdown
  const paymentData = useMemo(() => {
    const cod    = allOrders.filter((o) => o.payment_method === 'cod').length
    const online = allOrders.filter((o) => o.payment_method !== 'cod').length
    return [
      { name: 'COD',    value: cod },
      { name: 'Online', value: online },
    ].filter((p) => p.value > 0)
  }, [allOrders])

  const isLoading = dashLoading || ordersLoading

  const kpis = [
    { label: 'Total Revenue',    value: isLoading ? '—' : formatPrice(totalRevenue),              icon: DollarSign,  color: 'bg-emerald-500 ring-emerald-100' },
    { label: 'Total Orders',     value: isLoading ? '—' : totalOrders.toLocaleString(),           icon: ShoppingCart, color: 'bg-blue-500 ring-blue-100' },
    { label: 'Customers',        value: isLoading ? '—' : totalCustomers.toLocaleString(),        icon: Users,       color: 'bg-purple-500 ring-purple-100' },
    { label: 'Avg Order Value',  value: isLoading ? '—' : formatPrice(avgOrderValue),             icon: Package,     color: 'bg-orange-500 ring-orange-100' },
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
              <p className="text-2xl font-bold font-heading text-slate-800">{value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Revenue trend */}
      <div className="card p-5">
        <div className="mb-5">
          <h2 className="font-heading font-semibold text-slate-800">Revenue Trend</h2>
          <p className="text-xs text-slate-400 mt-0.5">Monthly revenue from all orders</p>
        </div>
        {revenueByMonth.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No order data yet</div>
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
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
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
          {ordersByStatus.length === 0 ? (
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
          <p className="text-xs text-slate-400 mb-5">COD vs Online payments</p>
          {paymentData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [`${v} orders`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {paymentData.map((p, i) => {
                  const total = paymentData.reduce((s, x) => s + x.value, 0)
                  const pct   = total > 0 ? Math.round((p.value / total) * 100) : 0
                  return (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                        <span className="text-slate-600">{p.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{p.value} ({pct}%)</span>
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
        <h2 className="font-heading font-semibold text-slate-800 mb-5">Top Performing Products</h2>
        {topProducts.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-slate-300 text-sm">No product data yet</div>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const pct = topProducts[0].revenue > 0 ? Math.round((p.revenue / topProducts[0].revenue) * 100) : 0
              return (
                <div key={p.name} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: COLORS[i] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{p.name}</span>
                      <span className="text-slate-500">
                        {p.sales} sold · <span className="text-primary font-semibold">₹{p.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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

import { motion } from 'framer-motion'
import {
  ShoppingCart, DollarSign, Truck, AlertTriangle,
  Banknote, Users, TrendingUp, Package,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useDashboard } from '../../api/admin'
import MetricCard from '../../components/admin/MetricCard'
import { StatusBadge } from '../../components/ui/Badge'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'

const COLORS = ['#16A34A', '#F97316', '#3B82F6', '#8B5CF6', '#EF4444']

const salesData = [
  { day: 'Mon', sales: 4200, orders: 18 },
  { day: 'Tue', sales: 3800, orders: 15 },
  { day: 'Wed', sales: 5600, orders: 24 },
  { day: 'Thu', sales: 4900, orders: 21 },
  { day: 'Fri', sales: 6200, orders: 28 },
  { day: 'Sat', sales: 7800, orders: 35 },
  { day: 'Sun', sales: 5100, orders: 22 },
]

const weeklyRevenue = [
  { week: 'W1', revenue: 28000 },
  { week: 'W2', revenue: 35000 },
  { week: 'W3', revenue: 31000 },
  { week: 'W4', revenue: 42000 },
]

const topProducts = [
  { name: 'Tomatoes', value: 340 },
  { name: 'Onions', value: 280 },
  { name: 'Potatoes', value: 210 },
  { name: 'Carrots', value: 180 },
  { name: 'Spinach', value: 150 },
]

const paymentBreakdown = [
  { name: 'Online', value: 65 },
  { name: 'COD', value: 35 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-card-lg px-3 py-2.5 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.name === 'sales' || p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function SkeletonCard() {
  return (
    <div className="stat-card space-y-3">
      <div className="skeleton-box h-11 w-11 rounded-2xl" />
      <div className="skeleton-box h-7 w-24 rounded-lg" />
      <div className="skeleton-box h-4 w-32 rounded" />
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: res, isLoading } = useDashboard()
  const data = res?.data

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6 max-w-screen-2xl">
      {/* Page header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's happening today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live data
        </div>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard label="Total Orders"      value={data?.total_orders}                     icon={ShoppingCart} color="blue"   trend={12} />
            <MetricCard label="Revenue"           value={formatPrice(data?.total_revenue ?? 0)}  icon={DollarSign}   color="green"  trend={8} subtitle="Delivered" />
            <MetricCard label="Pending Delivery"  value={data?.pending_orders}                   icon={Truck}        color="orange" />
            <MetricCard label="Low Stock Alerts"  value={data?.low_stock_count ?? 0}             icon={AlertTriangle} color="red" />
            <MetricCard label="COD Pending"       value={formatPrice(0)}                         icon={Banknote}     color="yellow" />
            <MetricCard label="Active Customers"  value={data?.total_products ?? 0}              icon={Users}        color="purple" />
          </>
        )}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Sales Area Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-semibold text-slate-800">Daily Sales</h2>
              <p className="text-xs text-slate-400 mt-0.5">This week's performance</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
              <TrendingUp size={12} />
              +14% vs last week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" name="sales" stroke="#16A34A" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 3, fill: '#16A34A', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-heading font-semibold text-slate-800">Payment Split</h2>
            <p className="text-xs text-slate-400 mt-0.5">Online vs COD</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                {paymentBreakdown.map((_, i) => (
                  <Cell key={i} fill={['#16A34A', '#F97316'][i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {paymentBreakdown.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: ['#16A34A', '#F97316'][i] }} />
                {p.name} ({p.value}%)
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Weekly Revenue + Top Products */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-heading font-semibold text-slate-800">Weekly Revenue</h2>
            <p className="text-xs text-slate-400 mt-0.5">This month breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="revenue" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-heading font-semibold text-slate-800">Top Selling Vegetables</h2>
            <p className="text-xs text-slate-400 mt-0.5">By units sold</p>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const pct = Math.round((p.value / topProducts[0].value) * 100)
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ background: COLORS[i] }}>
                        {i + 1}
                      </span>
                      {p.name}
                    </span>
                    <span className="text-slate-500">{p.value} units</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: COLORS[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Bottom row: recent orders + inventory alerts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-slate-800">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-primary font-semibold hover:underline">View all</a>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-box h-8 rounded-lg" />
              ))}
            </div>
          ) : !data?.recent_orders?.length ? (
            <p className="text-slate-400 text-sm text-center py-10">No orders yet</p>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="sm:hidden divide-y divide-gray-50">
                {data.recent_orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">#{order.id}</p>
                      <p className="text-xs text-slate-400">{order.address?.full_name || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span className="font-semibold text-primary text-sm">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_orders.slice(0, 6).map((order) => (
                      <tr key={order.id}>
                        <td><span className="font-semibold text-slate-700">#{order.id}</span></td>
                        <td><span className="text-slate-600">{order.address?.full_name || '—'}</span></td>
                        <td><span className="font-semibold text-primary">{formatPrice(order.total_amount)}</span></td>
                        <td><StatusBadge status={order.status} /></td>
                        <td><span className="text-slate-400 text-xs">{formatDate(order.created_at)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-slate-800">Stock Alerts</h2>
            <a href="/admin/inventory" className="text-xs text-primary font-semibold hover:underline">Manage</a>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-box h-12 rounded-xl" />
              ))}
            </div>
          ) : !data?.low_stock_products?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <Package size={32} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">All products well stocked</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.low_stock_products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    : <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base shrink-0">🥦</div>}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.unit}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${p.stock <= 0 ? 'text-red-500' : 'text-orange-500'}`}>
                      {p.stock} left
                    </p>
                    <p className="text-[11px] text-slate-400">min {p.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Orders by status row */}
      {data?.orders_by_status && (
        <motion.div variants={item} className="card p-5">
          <h2 className="font-heading font-semibold text-slate-800 mb-4">Order Status Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {data.orders_by_status.map(({ status, count }) => (
              <div key={status} className="text-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <p className="font-bold text-2xl text-slate-700 mb-2">{count}</p>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

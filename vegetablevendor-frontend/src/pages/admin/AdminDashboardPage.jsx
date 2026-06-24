import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart, DollarSign, Truck, AlertTriangle,
  Banknote, Users, Package, CheckCircle, ClipboardList,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '../../api/admin'
import MetricCard from '../../components/admin/MetricCard'
import { StatusBadge } from '../../components/ui/Badge'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'

const COLORS = ['#16A34A', '#F97316', '#3B82F6', '#8B5CF6', '#EF4444']

const PIE_COLORS = { cod: '#F97316', online: '#16A34A', other: '#94A3B8' }

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

  // Normalise payment breakdown into chart-friendly format
  const paymentChartData = useMemo(() => {
    if (!data?.payment_breakdown) return []
    const LABEL = { cod: 'COD', online: 'Online', other: 'Other' }
    return data.payment_breakdown.map((p) => ({
      name:  LABEL[p.method] ?? p.method,
      value: p.count,
      color: PIE_COLORS[p.method] ?? '#94A3B8',
    }))
  }, [data?.payment_breakdown])

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

      {/* Today at a Glance */}
      <motion.div variants={item} className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">☀️</span>
            <h2 className="font-heading font-bold text-slate-800">Today at a Glance</h2>
          </div>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 h-20 skeleton-box" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                label: "Today's Orders",
                value: data?.today_orders ?? 0,
                sub: 'placed today',
                icon: ShoppingCart,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
              },
              {
                label: 'Pending Packing',
                value: data?.pending_packing ?? 0,
                sub: 'need to be packed',
                icon: ClipboardList,
                color: 'text-yellow-600',
                bg: 'bg-yellow-50',
              },
              {
                label: 'Out for Delivery',
                value: data?.out_for_delivery ?? 0,
                sub: 'on the way',
                icon: Truck,
                color: 'text-orange-500',
                bg: 'bg-orange-50',
              },
              {
                label: 'Completed Today',
                value: data?.completed_today ?? 0,
                sub: 'delivered today',
                icon: CheckCircle,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                label: 'Expected Cash',
                value: formatPrice(data?.expected_cash ?? 0),
                sub: 'COD out for delivery',
                icon: Banknote,
                color: 'text-primary',
                bg: 'bg-primary-50',
              },
            ].map(({ label, value, sub, icon: Icon, color, bg, href }) => {
              const card = (
                <div className={`bg-white rounded-xl p-4 space-y-2 ${href ? 'hover:shadow-card transition-shadow cursor-pointer' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide leading-tight">{label}</p>
                    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      <Icon size={13} className={color} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-[11px] text-slate-400">{sub}</p>
                </div>
              )
              return href
                ? <a key={label} href={href}>{card}</a>
                : <div key={label}>{card}</div>
            })}
          </div>
        )}

        {/* Low stock row */}
        {!isLoading && data?.low_stock_products?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-100">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle size={13} className="text-red-500" />
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Low Stock — {data.low_stock_count} item{data.low_stock_count !== 1 ? 's' : ''}</p>
              <a href="/admin/inventory" className="ml-auto text-xs text-primary font-semibold hover:underline">Manage</a>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.low_stock_products.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 text-xs border border-red-100">
                  <span className={`font-bold ${p.stock <= 0 ? 'text-red-500' : 'text-orange-500'}`}>{p.stock}</span>
                  <span className="text-slate-500">{p.name}</span>
                </div>
              ))}
              {data.low_stock_products.length > 6 && (
                <span className="text-xs text-slate-400 self-center">+{data.low_stock_products.length - 6} more</span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard label="Total Orders"     value={data?.total_orders}                        icon={ShoppingCart} color="blue"   />
            <MetricCard label="Revenue"          value={formatPrice(data?.total_revenue ?? 0)}     icon={DollarSign}   color="green"  subtitle="Delivered orders" />
            <MetricCard label="New Orders"       value={data?.pending_orders}                      icon={Truck}        color="orange" />
            <MetricCard label="Low Stock Alerts" value={data?.low_stock_count ?? 0}                icon={AlertTriangle} color="red"  />
            <MetricCard label="COD Pending"      value={formatPrice(data?.cod_pending_amount ?? 0)} icon={Banknote}    color="yellow" />
            <MetricCard label="Customers"        value={data?.total_customers ?? 0}                icon={Users}        color="purple" />
          </>
        )}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Sales — current week */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-semibold text-slate-800">Daily Orders This Week</h2>
              <p className="text-xs text-slate-400 mt-0.5">Orders placed Mon – Sun</p>
            </div>
          </div>
          {isLoading ? (
            <div className="h-[220px] skeleton-box rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.daily_sales ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="orders" name="Orders" stroke="#16A34A" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 3, fill: '#16A34A', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Split */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-heading font-semibold text-slate-800">Payment Methods</h2>
            <p className="text-xs text-slate-400 mt-0.5">All-time order split</p>
          </div>
          {isLoading ? (
            <div className="h-[160px] skeleton-box rounded-xl" />
          ) : paymentChartData.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-slate-300 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={paymentChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {paymentChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [`${v} orders`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {paymentChartData.map((p) => {
                  const total = paymentChartData.reduce((s, x) => s + x.value, 0)
                  const pct   = total > 0 ? Math.round((p.value / total) * 100) : 0
                  return (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                      {p.name} ({pct}%)
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Revenue by month + Top Products */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-heading font-semibold text-slate-800">Revenue by Month</h2>
            <p className="text-xs text-slate-400 mt-0.5">Delivered orders — all time</p>
          </div>
          {isLoading ? (
            <div className="h-[200px] skeleton-box rounded-xl" />
          ) : !data?.revenue_by_month?.length ? (
            <div className="h-[200px] flex items-center justify-center text-slate-300 text-sm">No delivered orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.revenue_by_month} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                <Tooltip formatter={(v) => [formatPrice(v), 'Revenue']} />
                <Bar dataKey="revenue" name="Revenue" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-heading font-semibold text-slate-800">Top Selling Products</h2>
            <p className="text-xs text-slate-400 mt-0.5">By units sold (delivered orders)</p>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-box h-10 rounded-xl" />)}
            </div>
          ) : !data?.top_selling_products?.length ? (
            <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No sales data yet</div>
          ) : (
            <div className="space-y-3">
              {data.top_selling_products.map((p, i) => {
                const pct = Math.round((p.units_sold / data.top_selling_products[0].units_sold) * 100)
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ background: COLORS[i] }}>
                          {i + 1}
                        </span>
                        {p.name}
                      </span>
                      <span className="text-slate-500">{p.units_sold} units · {formatPrice(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom row: recent orders + stock alerts */}
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
              {/* Mobile */}
              <div className="sm:hidden divide-y divide-gray-50">
                {data.recent_orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">#{order.id}</p>
                      <p className="text-xs text-slate-400">{order.address?.full_name || order.customer_name || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span className="font-semibold text-primary text-sm">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop */}
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
                        <td><span className="text-slate-600">{order.address?.full_name || order.customer_name || '—'}</span></td>
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

      {/* Order Status Overview */}
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

import { useState, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, Bell, ChevronRight, ShoppingCart, AlertTriangle, ClipboardList } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useDashboard } from '../../api/admin'
import { formatPrice } from '../../utils/formatPrice'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const routeLabels = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/inventory': 'Inventory',
  '/admin/customers': 'Customers',
  '/admin/deliveries': 'Deliveries',
  '/admin/whatsapp': 'WhatsApp Logs',
  '/admin/analytics': 'Analytics',
  '/admin/coupons': 'Coupons',
  '/admin/settings': 'Settings',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/reviews': 'Reviews',
  '/admin/contact-messages': 'Contact Messages',
}

export default function AdminTopbar({ onOpenSidebar }) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [showNotifications, setShowNotifications] = useState(false)
  const { data: res } = useDashboard()
  const data = res?.data

  const pageTitle = routeLabels[pathname] || 'Admin'

  const notifications = useMemo(() => {
    if (!data) return []
    const items = []

    // New / recent orders
    ;(data.recent_orders || []).slice(0, 3).forEach((order) => {
      items.push({
        icon: ShoppingCart,
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        dot: 'bg-primary',
        title: `Order #${order.id} placed`,
        desc: `${order.address?.full_name || order.customer_name || 'Customer'} — ${formatPrice(order.total_amount)}`,
        time: timeAgo(order.created_at),
        href: '/admin/orders',
      })
    })

    // Pending packing
    if (data.pending_packing > 0) {
      items.push({
        icon: ClipboardList,
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        dot: 'bg-yellow-400',
        title: `${data.pending_packing} order${data.pending_packing > 1 ? 's' : ''} need packing`,
        desc: 'Waiting to be packed and dispatched',
        time: '',
        href: '/admin/orders',
      })
    }

    // Low stock alerts
    ;(data.low_stock_products || []).slice(0, 3).forEach((p) => {
      items.push({
        icon: AlertTriangle,
        iconBg: p.stock <= 0 ? 'bg-red-50' : 'bg-orange-50',
        iconColor: p.stock <= 0 ? 'text-red-500' : 'text-orange-500',
        dot: p.stock <= 0 ? 'bg-red-500' : 'bg-accent',
        title: p.stock <= 0 ? 'Out of stock' : 'Low stock alert',
        desc: `${p.name} — ${p.stock} ${p.unit} left`,
        time: '',
        href: '/admin/inventory',
      })
    })

    return items
  }, [data])

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <span className="font-heading font-bold text-slate-800 text-base lg:hidden">{pageTitle}</span>
          <div className="hidden lg:flex items-center gap-1.5 text-sm">
            <Link to="/admin" className="text-slate-400 hover:text-primary transition-colors font-medium">
              Admin
            </Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-700 font-semibold">{pageTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-accent text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center px-0.5">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-card-lg border border-gray-100 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-800">Notifications</p>
                      {notifications.length > 0 && (
                        <span className="bg-accent text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                          {notifications.length}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/admin/orders"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      View orders
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-400">All caught up!</p>
                        <p className="text-xs text-slate-300 mt-1">No pending actions</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <Link
                          key={i}
                          to={n.href}
                          onClick={() => setShowNotifications(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-7 h-7 rounded-lg ${n.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <n.icon size={14} className={n.iconColor} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 leading-tight">{n.title}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{n.desc}</p>
                            {n.time && <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>}
                          </div>
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${n.dot}`} />
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.full_name || 'Admin'}</p>
              <p className="text-[11px] text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, Bell, Search, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

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

  const pageTitle = routeLabels[pathname] || 'Admin'

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
          {/* Mobile: just the current page title */}
          <span className="font-heading font-bold text-slate-800 text-base lg:hidden">{pageTitle}</span>
          {/* Desktop: breadcrumb */}
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-white" />
            </button>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-card-lg border border-gray-100 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <p className="font-semibold text-sm text-slate-800">Notifications</p>
                    <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {[
                      { title: 'New order placed', desc: 'Order #1042 — ₹480', time: '2m ago', dot: 'bg-primary' },
                      { title: 'Low stock alert', desc: 'Tomatoes — 3 kg left', time: '15m ago', dot: 'bg-accent' },
                      { title: 'COD order pending', desc: 'Order #1039 — ₹260', time: '1h ago', dot: 'bg-yellow-400' },
                    ].map((n, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 truncate">{n.desc}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
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

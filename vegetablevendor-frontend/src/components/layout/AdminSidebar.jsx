import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, Users, Truck,
  MessageSquare, BarChart3, Tag, Settings, LogOut,
  Store, ChevronLeft, ChevronRight, Star, Mail, X,
  ShoppingBag, Layers,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/admin',                   label: 'Dashboard',        icon: LayoutDashboard, end: true },
  { to: '/admin/orders',            label: 'Orders',           icon: ShoppingCart },
  { to: '/admin/products',          label: 'Products',         icon: ShoppingBag },
  { to: '/admin/categories',        label: 'Categories',       icon: Layers },
  { to: '/admin/inventory',         label: 'Inventory',        icon: Package },
  { to: '/admin/customers',         label: 'Customers',        icon: Users },
  { to: '/admin/deliveries',        label: 'Deliveries',       icon: Truck },
  { to: '/admin/whatsapp',          label: 'WhatsApp Logs',    icon: MessageSquare },
  { to: '/admin/analytics',         label: 'Analytics',        icon: BarChart3 },
  { to: '/admin/coupons',           label: 'Coupons',          icon: Tag },
  { to: '/admin/reviews',           label: 'Reviews',          icon: Star },
  { to: '/admin/contact-messages',  label: 'Contact Messages', icon: Mail },
]

const bottomItems = [
  { to: '/admin/settings',         label: 'Settings',       icon: Settings },
]

export default function AdminSidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const logout = useAuthStore((s) => s.logout)
  const user   = useAuthStore((s) => s.user)

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 bg-sidebar flex flex-col shrink-0 overflow-hidden lg:h-full
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'lg:w-[68px]' : 'w-64'}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white font-bold text-base">V</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-heading font-bold text-white text-sm leading-tight truncate">VegFresh</p>
                <p className="text-sidebar-text text-xs">Admin Panel</p>
              </div>
            )}
          </Link>
          {/* Desktop collapse toggle */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {/* Mobile close */}
          <button onClick={onClose} className="lg:hidden text-sidebar-text hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full h-10 border-b border-sidebar-border text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
              Main Menu
            </p>
          )}
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon size={18} className={`shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {!collapsed && (
            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              System
            </p>
          )}
          {collapsed && <div className="my-2 border-t border-sidebar-border" />}
          {bottomItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon size={18} className={`shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && <span>{label}</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Divider before store/logout */}
          <div className="my-2 border-t border-sidebar-border" />

          <Link
            to="/"
            title={collapsed ? 'Back to Store' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors group relative ${collapsed ? 'justify-center' : ''}`}
          >
            <Store size={18} className="shrink-0" />
            {!collapsed && <span>Back to Store</span>}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                Back to Store
              </span>
            )}
          </Link>
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-text hover:text-red-400 hover:bg-red-500/10 transition-colors group relative ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                Logout
              </span>
            )}
          </button>

          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-xl bg-sidebar-hover">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {user.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.full_name}</p>
                <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="pb-2" />
        </nav>
      </aside>
    </>
  )
}

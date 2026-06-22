import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Truck, Package, MoreHorizontal } from 'lucide-react'

const items = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingCart },
  { to: '/admin/deliveries', label: 'Deliveries', icon: Truck },
  { to: '/admin/inventory',  label: 'Inventory',  icon: Package },
]

export default function AdminBottomNav({ onOpenMenu }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.07)]">
      <div className="flex h-16">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`w-10 h-7 flex items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={onOpenMenu}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="w-10 h-7 flex items-center justify-center rounded-xl">
            <MoreHorizontal size={19} strokeWidth={1.8} />
          </span>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </div>
    </nav>
  )
}

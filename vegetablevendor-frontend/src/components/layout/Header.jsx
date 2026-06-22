import { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useCart } from '../../api/cart'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const { user, token, logout }   = useAuthStore()
  const openCart                  = useCartStore((s) => s.openCart)
  const { data: cart }            = useCart()
  const navigate                  = useNavigate()
  const location                  = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const cartCount = cart?.item_count || 0
  const firstName = user?.full_name?.split(' ')[0] || 'Account'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-heading font-bold text-xl text-text hidden sm:block">
            VegFresh
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === to ? 'text-primary' : 'text-slate-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCartIcon className="w-6 h-6 text-text" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-text text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold leading-none">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Auth section */}
          {token ? (
            /* ── Profile dropdown (authenticated) ── */
            <div className="hidden md:block">
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50">
                  <UserCircleIcon className="w-5 h-5 text-primary" />
                  <span className="max-w-[100px] truncate">{firstName}</span>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                </MenuButton>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg ring-1 ring-black/5 divide-y divide-gray-50 focus:outline-none z-50">
                    {/* User info header */}
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-text truncate">{user?.full_name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    {/* Navigation items */}
                    <div className="py-1">
                      <MenuItem>
                        {({ focus }) => (
                          <Link
                            to="/profile"
                            className={`flex items-center gap-2.5 px-4 py-2 text-sm ${focus ? 'bg-primary-50 text-primary' : 'text-slate-700'}`}
                          >
                            <UserIcon className="w-4 h-4" />
                            My Profile
                          </Link>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ focus }) => (
                          <Link
                            to="/orders"
                            className={`flex items-center gap-2.5 px-4 py-2 text-sm ${focus ? 'bg-primary-50 text-primary' : 'text-slate-700'}`}
                          >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                            My Orders
                          </Link>
                        )}
                      </MenuItem>
                    </div>

                    {/* Admin link (if admin) */}
                    {user?.role === 0 && (
                      <div className="py-1">
                        <MenuItem>
                          {({ focus }) => (
                            <Link
                              to="/admin"
                              className={`flex items-center gap-2.5 px-4 py-2 text-sm ${focus ? 'bg-primary-50 text-primary' : 'text-slate-700'}`}
                            >
                              <ShieldCheckIcon className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </MenuItem>
                      </div>
                    )}

                    {/* Logout */}
                    <div className="py-1">
                      <MenuItem>
                        {({ focus }) => (
                          <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm ${focus ? 'bg-red-50 text-red-600' : 'text-slate-600'}`}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Logout
                          </button>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>
          ) : (
            /* ── Guest buttons ── */
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm py-1.5">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium text-slate-700 hover:text-primary py-2 px-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              {label}
            </Link>
          ))}

          {token ? (
            <>
              <div className="border-t border-gray-100 pt-3 mt-2 px-2">
                <p className="text-xs text-slate-400 mb-2">Signed in as <strong>{user?.full_name}</strong></p>
              </div>
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary py-2 px-2 rounded-lg hover:bg-primary-50 transition-colors">
                <UserIcon className="w-4 h-4" />
                My Profile
              </Link>
              <Link to="/orders" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary py-2 px-2 rounded-lg hover:bg-primary-50 transition-colors">
                <ClipboardDocumentListIcon className="w-4 h-4" />
                My Orders
              </Link>
              {user?.role === 0 && (
                <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary py-2 px-2 rounded-lg hover:bg-primary-50 transition-colors">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-500 font-medium text-left py-2 px-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
              <Link to="/login" className="btn-ghost text-sm text-center">Login</Link>
              <Link to="/register" className="btn-primary text-sm text-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { getUserInfo } from './api/auth'
import api from './api/axios'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import AdminSidebar from './components/layout/AdminSidebar'
import AdminTopbar from './components/layout/AdminTopbar'
import AdminBottomNav from './components/layout/AdminBottomNav'
import CartDrawer from './components/cart/CartDrawer'

// User pages
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import InvoicePage from './pages/InvoicePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import RefundPolicyPage from './pages/RefundPolicyPage'

// Admin pages — lazy loaded so their code (including Recharts) is never
// downloaded by customers who only visit the shop.
const AdminLoginPage           = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage       = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage        = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminCategoriesPage      = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminOrdersPage          = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminReviewsPage         = lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminInventoryPage       = lazy(() => import('./pages/admin/AdminInventoryPage'))
const AdminContactMessagesPage = lazy(() => import('./pages/admin/AdminContactMessagesPage'))
const AdminCustomersPage       = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminDeliveriesPage      = lazy(() => import('./pages/admin/AdminDeliveriesPage'))
const AdminWhatsAppPage        = lazy(() => import('./pages/admin/AdminWhatsAppPage'))
const AdminAnalyticsPage       = lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const AdminCouponsPage         = lazy(() => import('./pages/admin/AdminCouponsPage'))
const AdminSettingsPage        = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminIssuesPage          = lazy(() => import('./pages/admin/AdminIssuesPage'))

// Validates the persisted token once on startup. If the server rejects it
// (new login on another device invalidated this session), clears auth immediately
// instead of letting the user navigate to a page and get kicked mid-session.
function useSessionGuard() {
  const token = useAuthStore((s) => s.token)
  const login = useAuthStore((s) => s.login)

  useEffect(() => {
    if (!token) return
    getUserInfo()
      .then((user) => login(token, user))
      .catch(() => {
        // 401/403 → the axios interceptor already calls logout() and shows the
        // "session expired" toast. Network errors / 5xx (e.g. Render cold-start)
        // must NOT log the user out — the token is still valid.
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// Keeps the Render free-tier backend alive by pinging /api/version every 9 min
// (Render sleeps services after 15 min of inactivity). Also wakes it up immediately
// when the admin tab regains focus, so the first real request doesn't fail.
function useKeepAlive() {
  useEffect(() => {
    const ping = () => api.get('/version').catch(() => {})
    ping()
    const interval = setInterval(ping, 9 * 60 * 1000)
    const onVisible = () => { if (document.visibilityState === 'visible') ping() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
}

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 2 * 60_000 },
  },
})

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function AdminLayout() {
  useKeepAlive()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <AdminTopbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <AdminBottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  )
}

function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

function AdminRoute() {
  const user  = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/admin/login" replace />
  if (user?.role !== 0) return <Navigate to="/" replace />
  return <Outlet />
}

function GuestOnly() {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/" replace /> : <Outlet />
}

function AppInner() {
  useSessionGuard()
  return <Outlet />
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route element={<AppInner />}>
          {/* Admin login — standalone */}
          <Route path="/admin/login" element={<Suspense fallback={null}><AdminLoginPage /></Suspense>} />

          {/* Public layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />

            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/orders/:id/invoice" element={<InvoicePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/inventory" element={<AdminInventoryPage />} />
              <Route path="/admin/customers" element={<AdminCustomersPage />} />
              <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
              <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/coupons" element={<AdminCouponsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/contact-messages" element={<AdminContactMessagesPage />} />
              <Route path="/admin/issues" element={<AdminIssuesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Route>{/* AppInner */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

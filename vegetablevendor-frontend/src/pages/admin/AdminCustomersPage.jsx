import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, X, TrendingUp, Phone, Mail, ShieldCheck, ShoppingBag, CheckCircle } from 'lucide-react'
import { useAdminUsers } from '../../api/admin'
import { formatDate } from '../../utils/formatDate'

function CustomerRow({ c }) {
  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {(c.full_name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-700">{c.full_name}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Mail size={10} />
              {c.email}
            </div>
          </div>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Phone size={12} className="text-slate-300" />
          {c.phone_number || '—'}
        </div>
      </td>
      <td>
        <span className={`badge ${c.role === 0 ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
          {c.role === 0 ? 'Admin' : 'Customer'}
        </span>
      </td>
      <td>
        <span className={`badge ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {c.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <ShoppingBag size={12} className="text-slate-300" />
            {c.order_count ?? 0}
          </div>
          {(c.delivered_count ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle size={12} />
              {c.delivered_count} delivered
            </div>
          )}
        </div>
      </td>
      <td>
        <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
      </td>
    </tr>
  )
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage]     = useState(1)

  const { data, isLoading, isError } = useAdminUsers({ page, search: search || undefined, page_size: 25 })

  const customers  = data?.data        || []
  const totalPages = data?.total_pages || 1

  const filtered = customers.filter((c) => {
    if (filter === 'active')   return c.active
    if (filter === 'inactive') return !c.active
    if (filter === 'admin')    return c.role === 0
    return true
  })

  const activeCount = customers.filter((c) => c.active).length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-2xl">
      <div>
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">Registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Users',      value: customers.length,        icon: Users,        color: 'bg-blue-500',    ring: 'ring-blue-100' },
          { label: 'Active Users',     value: activeCount,             icon: TrendingUp,   color: 'bg-emerald-500', ring: 'ring-emerald-100' },
          { label: 'Admins',           value: customers.filter((c) => c.role === 0).length, icon: ShieldCheck, color: 'bg-purple-500', ring: 'ring-purple-100' },
        ].map(({ label, value, icon: Icon, color, ring }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0 ring-4 ${ring}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold font-heading text-slate-800">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="card p-1 flex gap-1">
          {[
            { key: 'all',      label: 'All' },
            { key: 'active',   label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'admin',    label: 'Admins' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`filter-tab ${filter === key ? 'filter-tab-active' : 'filter-tab-inactive'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-box h-10 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-red-500 font-medium">Failed to load customers</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400">No customers found</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {filtered.map((c) => (
                <div key={c.id} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {(c.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-700 text-sm truncate">{c.full_name}</p>
                      <span className={`badge shrink-0 ${c.role === 0 ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                        {c.role === 0 ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      {c.phone_number && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Phone size={11} className="text-slate-300" />{c.phone_number}
                        </span>
                      )}
                      <span className={`badge ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <ShoppingBag size={11} className="text-slate-300" />{c.order_count ?? 0} orders
                      </span>
                      <span className="text-slate-400">Joined {formatDate(c.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Orders</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => <CustomerRow key={c.id} c={c} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const p = i + 1
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            )
          })}
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </motion.div>
  )
}

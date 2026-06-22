import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Plus, Search, X, Copy, ToggleLeft, ToggleRight, Trash2, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../../api/admin'

function CouponModal({ onClose, onCreate, isCreating }) {
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', value: '', min_order_amount: '', max_uses: '', expires_at: '', description: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = () => {
    if (!form.code || !form.value || !form.min_order_amount) { toast.error('Fill required fields'); return }
    onCreate({
      code:             form.code.trim().toUpperCase(),
      discount_type:    form.discount_type,
      value:            Number(form.value),
      min_order_amount: Number(form.min_order_amount),
      max_uses:         form.max_uses ? Number(form.max_uses) : null,
      expires_at:       form.expires_at || null,
      description:      form.description,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-card-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-slate-800">Create Coupon</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Coupon Code *</label>
            <input value={form.code} onChange={set('code')} placeholder="e.g. FRESH20" className="input-field uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Type</label>
              <select value={form.discount_type} onChange={set('discount_type')} className="input-field">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Value *</label>
              <input type="number" value={form.value} onChange={set('value')} placeholder={form.discount_type === 'percent' ? '20' : '50'} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Min Order (₹) *</label>
              <input type="number" value={form.min_order_amount} onChange={set('min_order_amount')} placeholder="200" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={set('max_uses')} placeholder="100 (leave blank = unlimited)" className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Expiry Date</label>
            <input type="date" value={form.expires_at} onChange={set('expires_at')} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Description</label>
            <input value={form.description} onChange={set('description')} placeholder="Internal note" className="input-field" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={isCreating} className="btn-primary">
            {isCreating ? 'Creating…' : 'Create Coupon'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminCouponsPage() {
  const [search, setSearch]   = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data: res, isLoading } = useAdminCoupons()
  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon()
  const { mutate: updateCoupon } = useUpdateCoupon()
  const { mutate: deleteCoupon } = useDeleteCoupon()

  const coupons = res?.data || []

  const toggle = (c) => updateCoupon({ id: c.id, active: !c.active })
  const remove = (id) => { if (window.confirm('Delete this coupon?')) deleteCoupon(id) }
  const copy   = (code) => { navigator.clipboard?.writeText(code); toast.success(`Copied: ${code}`) }

  const filtered = coupons.filter((c) =>
    !search ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-xl">
      {showModal && (
        <CouponModal
          onClose={() => setShowModal(false)}
          isCreating={isCreating}
          onCreate={(data) => createCoupon(data, { onSuccess: () => setShowModal(false) })}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-subtitle">{coupons.filter((c) => c.active).length} active coupons</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Coupons',     value: coupons.length },
          { label: 'Active',            value: coupons.filter((c) => c.active).length },
          { label: 'Inactive',          value: coupons.filter((c) => !c.active).length },
          { label: 'Total Redemptions', value: coupons.reduce((s, c) => s + (c.used_count || 0), 0) },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card text-center">
            <p className="text-2xl font-bold font-heading text-slate-800">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
      </div>

      {/* Coupon cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Tag size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{search ? 'No coupons match your search.' : 'No coupons yet — create your first one!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const maxUses    = c.max_uses || 0
            const usePct     = maxUses > 0 ? Math.min(Math.round((c.used_count / maxUses) * 100), 100) : 0
            const expired    = c.expires_at && new Date(c.expires_at) < new Date()

            return (
              <div key={c.id} className={`card-hover p-5 ${!c.active ? 'opacity-60' : ''}`}>
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading font-bold text-lg text-slate-800 tracking-wider">{c.code}</span>
                      <button onClick={() => copy(c.code)} className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-primary-50 transition-colors" title="Copy code">
                        <Copy size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(c)} className={`p-1.5 rounded-lg transition-colors ${c.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                      {c.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Value badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`badge text-sm font-bold px-3 py-1 ${c.discount_type === 'percent' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {c.discount_type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </span>
                  <span className="text-xs text-slate-400">Min ₹{c.min_order_amount}</span>
                  {expired && <span className="badge bg-red-50 text-red-500 ml-auto">Expired</span>}
                  {!expired && c.active && <span className="badge bg-emerald-50 text-emerald-600 ml-auto">Active</span>}
                </div>

                {/* Usage bar */}
                {maxUses > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Usage</span>
                      <span className="font-medium">{c.used_count} / {maxUses}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${usePct >= 90 ? 'bg-red-400' : usePct >= 60 ? 'bg-orange-400' : 'bg-primary'}`}
                        style={{ width: `${usePct}%` }}
                      />
                    </div>
                  </div>
                )}
                {maxUses === 0 && (
                  <p className="text-xs text-slate-400">Used {c.used_count} times · Unlimited uses</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 text-xs text-slate-400">
                  {c.expires_at
                    ? <span>Expires {new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    : <span>No expiry</span>
                  }
                  <span className={`font-medium ${c.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {c.active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Search, X, CheckCircle, Clock, Eye } from 'lucide-react'
import { useAdminIssues, useResolveIssue, useUpdateIssueStatus } from '../../api/orderIssues'
import { formatPrice } from '../../utils/formatPrice'
import { formatDateTime } from '../../utils/formatDate'

const STATUS_TABS = [
  { key: '',          label: 'All' },
  { key: 'open',      label: 'Open' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'resolved',  label: 'Resolved' },
]

const STATUS_META = {
  open:       { label: 'Open',       bg: 'bg-red-50',     text: 'text-red-600' },
  reviewing:  { label: 'Reviewing',  bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  resolved:   { label: 'Resolved',   bg: 'bg-emerald-50', text: 'text-emerald-700' },
}

const ISSUE_TYPE_LABELS = {
  missing_item:   'Missing Item',
  wrong_item:     'Wrong Item',
  bad_quality:    'Bad Quality',
  late_delivery:  'Late Delivery',
  damaged:        'Damaged Product',
  other:          'Other',
}

const RESOLUTION_TYPES = [
  { value: 'refund',      label: 'Issue Refund' },
  { value: 'replacement', label: 'Send Replacement' },
  { value: 'credit',      label: 'Add Credit Note' },
  { value: 'none',        label: 'No Action Required' },
]

function ResolveModal({ issue, onClose }) {
  const [resType, setResType]   = useState('')
  const [notes, setNotes]       = useState('')
  const { mutate: resolve, isPending } = useResolveIssue()

  const handleResolve = () => {
    if (!resType) return
    resolve({ id: issue.id, resolution_type: resType, resolution_notes: notes.trim() }, { onSuccess: onClose })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-card-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={22} className="text-emerald-600" />
        </div>
        <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">Resolve Issue</h3>
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 space-y-0.5">
          <p className="text-xs font-semibold text-slate-500">
            {ISSUE_TYPE_LABELS[issue.issue_type] || issue.issue_type} — Order #{issue.order_id}
          </p>
          <p className="text-xs text-slate-600 line-clamp-2">{issue.description}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Resolution *</label>
            <div className="space-y-2">
              {RESOLUTION_TYPES.map(({ value, label }) => (
                <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  resType === value ? 'border-primary bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="resolution"
                    value={value}
                    checked={resType === value}
                    onChange={() => setResType(value)}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Notes <span className="normal-case text-slate-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Details shown to customer after resolution…"
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5">Cancel</button>
          <button
            onClick={handleResolve}
            disabled={isPending || !resType}
            className="flex-1 btn-primary justify-center py-2.5 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Resolve Issue'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function IssueCard({ issue, onResolve, onMarkReviewing }) {
  const meta = STATUS_META[issue.status] || STATUS_META.open

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800 text-sm">
            {ISSUE_TYPE_LABELS[issue.issue_type] || issue.issue_type}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Order #{issue.order_id}
            {issue.order_total ? ` — ${formatPrice(issue.order_total)}` : ''}
          </p>
        </div>
        <span className={`badge text-xs shrink-0 ${meta.bg} ${meta.text}`}>{meta.label}</span>
      </div>

      <p className="text-sm text-slate-600">{issue.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
        {issue.customer_name && (
          <span className="font-medium text-slate-600">{issue.customer_name}</span>
        )}
        {issue.customer_phone && <span>{issue.customer_phone}</span>}
        <span className="ml-auto">{formatDateTime(issue.created_at)}</span>
      </div>

      {issue.status !== 'resolved' && (
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          {issue.status === 'open' && (
            <button
              onClick={() => onMarkReviewing(issue.id)}
              className="btn-sm inline-flex items-center gap-1.5 border border-yellow-200 text-yellow-700 hover:bg-yellow-50 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            >
              <Eye size={12} />
              Mark Reviewing
            </button>
          )}
          <button
            onClick={() => onResolve(issue)}
            className="btn-sm inline-flex items-center gap-1.5 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            <CheckCircle size={12} />
            Resolve
          </button>
        </div>
      )}

      {issue.resolution_type && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-xs">
          <p className="font-semibold text-emerald-700">
            {RESOLUTION_TYPES.find((r) => r.value === issue.resolution_type)?.label || issue.resolution_type}
          </p>
          {issue.resolution_notes && (
            <p className="text-emerald-600 mt-0.5">{issue.resolution_notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminIssuesPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]             = useState('')
  const [resolveTarget, setResolveTarget] = useState(null)

  const { data, isLoading } = useAdminIssues(statusFilter ? { status: statusFilter } : {})
  const { mutate: updateStatus } = useUpdateIssueStatus()

  const allIssues = data?.data || []

  const q = search.trim().toLowerCase()
  const filtered = q
    ? allIssues.filter((i) =>
        (i.customer_name || '').toLowerCase().includes(q) ||
        String(i.order_id).includes(q) ||
        (i.description || '').toLowerCase().includes(q)
      )
    : allIssues

  const openCount = allIssues.filter((i) => i.status === 'open').length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="page-title flex items-center gap-2">
            Customer Issues
            {openCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">{openCount}</span>
            )}
          </h1>
          <p className="page-subtitle">Post-delivery complaints, refund requests, and replacements</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or order"
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 h-32 skeleton-box animate-skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">No issues found</p>
          <p className="text-sm text-slate-400 mt-1">
            {statusFilter ? `No ${statusFilter} issues` : 'All clear — no customer issues reported'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onResolve={setResolveTarget}
              onMarkReviewing={(id) => updateStatus({ id, status: 'reviewing' })}
            />
          ))}
        </div>
      )}

      {resolveTarget && (
        <ResolveModal
          issue={resolveTarget}
          onClose={() => setResolveTarget(null)}
        />
      )}
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MailOpen, Trash2, X, Reply, Search, Inbox } from 'lucide-react'
import { useContactMessages, useMarkContactMessageRead, useDeleteContactMessage } from '../../api/admin'
import { formatDate } from '../../utils/formatDate'

function MessageModal({ msg, onClose, onDelete }) {
  const { mutate: markRead } = useMarkContactMessageRead()

  useEffect(() => {
    if (msg && !msg.read) markRead(msg.id)
  }, [msg?.id])

  if (!msg) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl shadow-card-lg w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="font-heading font-bold text-slate-800 truncate">
                {msg.subject || '(no subject)'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                From <span className="font-medium text-slate-700">{msg.name}</span>
                <span className="text-slate-400"> · {msg.email}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(msg.created_at)}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Message body */}
          <div className="px-6 py-5">
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {msg.message}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => { onDelete(msg.id); onClose() }}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
            >
              <Trash2 size={15} />
              Delete
            </button>
            <a
              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message')}`}
              className="btn-primary"
            >
              <Reply size={16} />
              Reply via Email
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AdminContactMessagesPage() {
  const [page, setPage]         = useState(1)
  const [unreadOnly, setUnread] = useState(false)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useContactMessages({
    page,
    unread: unreadOnly ? 'true' : undefined,
    page_size: 20,
  })
  const { mutate: markRead } = useMarkContactMessageRead()
  const { mutate: deleteMsg } = useDeleteContactMessage()

  const messages    = data?.data       || []
  const totalPages  = data?.total_pages || 1
  const total       = data?.total       || 0
  const unreadCount = data?.unread_count ?? 0

  const filtered = search
    ? messages.filter((m) =>
        `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(search.toLowerCase())
      )
    : messages

  const open = (msg) => {
    setSelected(msg)
    if (!msg.read) markRead(msg.id)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-subtitle">
            {total} total
            {unreadCount > 0 && (
              <span className="ml-2 badge bg-primary/10 text-primary">{unreadCount} unread</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Messages', value: total,       icon: Mail,     color: 'bg-blue-500',    ring: 'ring-blue-100' },
          { label: 'Unread',         value: unreadCount, icon: Inbox,    color: 'bg-primary',     ring: 'ring-primary-100' },
          { label: 'Read',           value: total - unreadCount, icon: MailOpen, color: 'bg-slate-400', ring: 'ring-slate-100' },
        ].map(({ label, value, icon: Icon, color, ring }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0 ring-4 ${ring}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-slate-800">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => { setUnread(e.target.checked); setPage(1) }}
            className="rounded accent-primary"
          />
          Unread only
        </label>
      </div>

      {/* Message list */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-box h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Inbox size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => open(msg)}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors cursor-pointer group ${!msg.read ? 'bg-primary-50/40' : ''}`}
              >
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  <span className={`block w-2 h-2 rounded-full ${msg.read ? 'bg-slate-200' : 'bg-primary'}`} />
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
                  {msg.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${!msg.read ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                      {msg.name}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0">{formatDate(msg.created_at)}</span>
                  </div>
                  {msg.subject && (
                    <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>
                      {msg.subject}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 truncate mt-0.5">{msg.message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!msg.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(msg.id) }}
                      title="Mark as read"
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <MailOpen size={15} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm('Delete this message?')) deleteMsg(msg.id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Message detail modal */}
      {selected && (
        <MessageModal
          msg={selected}
          onClose={() => setSelected(null)}
          onDelete={(id) => { deleteMsg(id) }}
        />
      )}
    </motion.div>
  )
}

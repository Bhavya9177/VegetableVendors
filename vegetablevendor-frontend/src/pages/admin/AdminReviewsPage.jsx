import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Trash2, Star, StarHalf, TrendingUp, MessageSquare } from 'lucide-react'
import { useAdminReviews, useDeleteReview } from '../../api/reviews'
import { formatDate } from '../../utils/formatDate'

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  )
}

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-slate-500 text-right">{stars}</span>
      <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-slate-400">{count}</span>
    </div>
  )
}

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')

  const { data: res, isLoading } = useAdminReviews({ page, search: search || undefined, page_size: 20 })
  const { mutate: deleteReview } = useDeleteReview()

  const reviews    = res?.data || []
  const totalPages = res?.total_pages || 1
  const total      = res?.total || 0

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  const filtered = ratingFilter
    ? reviews.filter((r) => r.rating === parseInt(ratingFilter))
    : reviews

  const handleDelete = (review) => {
    if (window.confirm(`Remove this review by "${review.user_name}"?`)) {
      deleteReview(review.id)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Reviews</h1>
        <p className="page-subtitle">{total} total customer reviews</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Avg rating card */}
        <div className="stat-card flex flex-col items-center justify-center text-center py-6">
          <p className="text-5xl font-bold font-heading text-slate-800">{avgRating}</p>
          <div className="flex items-center gap-1 mt-2 mb-1">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={16} className={parseFloat(avgRating) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'} />
            ))}
          </div>
          <p className="text-sm text-slate-500">Average Rating</p>
          <p className="text-xs text-slate-400 mt-1">{total} reviews</p>
        </div>

        {/* Rating distribution */}
        <div className="lg:col-span-2 stat-card">
          <p className="text-sm font-semibold text-slate-700 mb-3">Rating Distribution</p>
          <div className="space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar key={star} stars={star} count={count} total={reviews.length} />
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="stat-card space-y-4">
          {[
            { label: '5-star reviews', value: ratingCounts[0].count, color: 'text-yellow-500' },
            { label: 'Reviews this month', value: total, color: 'text-primary' },
            { label: 'With comments', value: reviews.filter((r) => r.comment).length, color: 'text-blue-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <span className={`font-bold text-lg font-heading ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer or product..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="card p-1 flex gap-1">
          {['', '5', '4', '3', '2', '1'].map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={`filter-tab flex items-center gap-1 ${ratingFilter === r ? 'filter-tab-active' : 'filter-tab-inactive'}`}
            >
              {r ? (
                <>
                  <Star size={11} className={ratingFilter === r ? 'text-white fill-white' : 'text-yellow-400 fill-yellow-400'} />
                  {r}
                </>
              ) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 skeleton-box h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare size={40} className="text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-card-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {review.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      <span className="font-semibold text-slate-800 text-sm">{review.user_name || 'User'}</span>
                      <StarDisplay rating={review.rating} />
                      <span className={`badge text-xs font-bold ${
                        review.rating >= 4 ? 'bg-emerald-50 text-emerald-600' :
                        review.rating === 3 ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {review.rating}/5
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                    </div>

                    <p className="text-xs text-primary font-semibold mb-1.5">{review.product_name}</p>

                    {review.comment ? (
                      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No written comment</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(review)}
                  className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors shrink-0"
                  title="Remove review"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </motion.div>
  )
}

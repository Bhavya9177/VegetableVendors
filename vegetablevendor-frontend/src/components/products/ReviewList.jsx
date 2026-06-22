import StarRating from '../ui/StarRating'
import { formatDate } from '../../utils/formatDate'
import { useProductReviews } from '../../api/reviews'

function Avatar({ name }) {
  return (
    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
      {name?.[0]?.toUpperCase() || 'U'}
    </div>
  )
}

export default function ReviewList({ productId }) {
  const { data, isLoading } = useProductReviews(productId)

  if (isLoading)
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )

  if (!data?.length)
    return (
      <p className="text-slate-400 text-sm text-center py-8">
        No reviews yet — be the first to review this product!
      </p>
    )

  return (
    <div className="space-y-3">
      {data.map((review) => (
        <div key={review.id} className="p-4 bg-slate-50 rounded-xl border border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={review.user_name} />
              <div>
                <p className="font-semibold text-sm text-text leading-tight">
                  {review.user_name || 'Customer'}
                </p>
                <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
              </div>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.comment && (
            <p className="text-sm text-slate-600 mt-3 leading-relaxed pl-11">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}

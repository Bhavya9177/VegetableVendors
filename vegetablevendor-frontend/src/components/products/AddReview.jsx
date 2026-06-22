import { useState } from 'react'
import { Link } from 'react-router-dom'
import StarRating from '../ui/StarRating'
import { useAddReview } from '../../api/reviews'
import { useAuthStore } from '../../store/authStore'

export default function AddReview({ productId }) {
  const token = useAuthStore((s) => s.token)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const { mutate: addReview, isPending, isSuccess } = useAddReview(productId)

  if (!token)
    return (
      <div className="p-5 border border-dashed border-gray-200 rounded-xl text-center">
        <p className="text-sm text-slate-500 mb-2">Want to share your experience?</p>
        <Link to="/login" className="btn-primary text-sm">
          Login to Write a Review
        </Link>
      </div>
    )

  if (isSuccess)
    return (
      <div className="p-5 bg-green-50 border border-green-100 rounded-xl text-center">
        <p className="text-green-700 font-medium text-sm">
          Thanks for your review! ✅
        </p>
      </div>
    )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!rating) return
    addReview(
      { rating, comment },
      { onSuccess: () => { setRating(0); setComment('') } }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm">
      <h4 className="font-heading font-semibold text-sm text-text mb-4">Write a Review</h4>

      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">Your rating *</p>
        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-xs text-slate-400 mt-1">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product (optional)"
        rows={4}
        className="input-field resize-none mb-4 text-sm"
      />

      <button
        type="submit"
        disabled={!rating || isPending}
        className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

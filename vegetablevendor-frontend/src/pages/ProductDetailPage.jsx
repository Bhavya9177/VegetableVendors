import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useProduct } from '../api/products'
import { useAddToCart } from '../api/cart'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/formatPrice'
import { PageLoader } from '../components/ui/Spinner'
import StarRating from '../components/ui/StarRating'
import ReviewList from '../components/products/ReviewList'
import AddReview from '../components/products/AddReview'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(id)
  const { mutate: addToCart, isPending } = useAddToCart()
  const openCart = useCartStore((s) => s.openCart)
  const token = useAuthStore((s) => s.token)
  const [qty, setQty] = useState(1)

  if (isLoading) return <PageLoader />

  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Product not found.</p>
        <Link to="/shop" className="btn-primary mt-4 inline-flex">Back to Shop</Link>
      </div>
    )

  const outOfStock = product.is_out_of_stock || !product.stock || product.stock < 1
  const lowStock   = !outOfStock && product.low_stock

  const handleAdd = () => {
    if (!token) { navigate('/login'); return }
    addToCart({ product_id: product.id, quantity: qty }, { onSuccess: openCart })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-text">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-primary-50 aspect-square flex items-center justify-center relative">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            : <span className="text-9xl">🥦</span>}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-slate-700 font-bold px-4 py-2 rounded-full text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="text-xs font-medium text-primary bg-primary-50 px-2.5 py-1 rounded-full">
            {product.category_name}
          </span>
          <h1 className="font-heading font-bold text-3xl text-text mt-3 mb-2">{product.name}</h1>

          {product.review_count > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.average_rating} size="md" />
              <span className="text-sm font-medium text-slate-600">{product.average_rating?.toFixed(1)}</span>
              <span className="text-sm text-slate-400">
                ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          {product.description && (
            <p className="text-slate-500 text-sm leading-relaxed mb-6">{product.description}</p>
          )}

          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-heading font-bold text-4xl text-primary">{formatPrice(product.price)}</span>
            <span className="text-slate-400 text-lg">per {product.unit}</span>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              outOfStock ? 'bg-red-400' : lowStock ? 'bg-orange-400' : 'bg-green-400'
            }`} />
            <span className={`text-sm font-medium ${
              outOfStock ? 'text-red-500' : lowStock ? 'text-orange-500' : 'text-green-600'
            }`}>
              {outOfStock
                ? 'Out of Stock'
                : lowStock
                  ? `Low Stock — Only ${product.stock} ${product.unit} left!`
                  : `In Stock (${product.stock} ${product.unit} available)`}
            </span>
          </div>

          {/* Qty selector */}
          {!outOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-slate-700">Quantity:</span>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-text">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={qty >= product.stock}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-slate-400">
                Subtotal: <span className="font-semibold text-text">{formatPrice(product.price * qty)}</span>
              </span>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={isPending || outOfStock}
            className="btn-primary w-full py-3.5 text-base rounded-xl flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            {isPending ? 'Adding...' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
            {[
              { icon: '🌿', label: 'Farm Fresh' },
              { icon: '🚚', label: 'Cash on Delivery' },
              { icon: '✅', label: 'Quality Assured' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      <div className="mt-14 pt-10 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-heading font-bold text-xl text-text">Customer Reviews</h2>
          {product.review_count > 0 && (
            <span className="text-sm text-slate-400">({product.review_count})</span>
          )}
        </div>

        {product.review_count > 0 && (
          <div className="flex items-center gap-5 mb-8 p-5 bg-primary-50 rounded-2xl border border-primary-100">
            <span className="font-heading font-bold text-5xl text-primary leading-none">
              {product.average_rating?.toFixed(1)}
            </span>
            <div>
              <StarRating rating={product.average_rating} size="lg" />
              <p className="text-sm text-slate-500 mt-1.5">
                Based on {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ReviewList productId={product.id} />
          </div>
          <div>
            <AddReview productId={product.id} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

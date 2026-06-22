import { motion } from 'framer-motion'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import { useAddToCart } from '../../api/cart'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import StarRating from '../ui/StarRating'

export default function ProductCard({ product }) {
  const { mutate: addToCart, isPending } = useAddToCart()
  const openCart = useCartStore((s) => s.openCart)
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()

  const outOfStock = product.is_out_of_stock || !product.stock || product.stock < 1
  const lowStock = !outOfStock && product.low_stock

  const handleAdd = (e) => {
    e.preventDefault()
    if (!token) { navigate('/login'); return }
    addToCart({ product_id: product.id, quantity: 1 }, { onSuccess: openCart })
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 group"
    >
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-44 bg-primary-50 flex items-center justify-center text-5xl">🥦</div>
        )}

        {product.featured && !outOfStock && (
          <span className="absolute top-2 left-2 bg-accent text-text text-xs font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}

        {lowStock && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left!
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-3">
        <p className="text-xs text-slate-400 mb-0.5">{product.category_name}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-heading font-semibold text-sm text-text hover:text-primary transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={product.average_rating} size="sm" />
            <span className="text-xs text-slate-400">({product.review_count})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-primary font-bold text-base">{formatPrice(product.price)}</span>
            <span className="text-slate-400 text-xs">/{product.unit}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={isPending || outOfStock}
            className="flex items-center gap-1 bg-primary text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCartIcon className="w-3.5 h-3.5" />
            {isPending ? '...' : outOfStock ? 'Out of Stock' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

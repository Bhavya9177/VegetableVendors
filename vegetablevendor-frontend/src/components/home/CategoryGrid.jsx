import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCategories } from '../../api/categories'
import Skeleton from '../ui/Skeleton'

const fallbackEmojis = ['🥦', '🍎', '🥬', '🌽', '🥕', '🍆', '🍇', '🧅']

export default function CategoryGrid() {
  const { data: categories, isLoading } = useCategories()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-heading">Shop by Category</h2>
        <Link to="/shop" className="text-sm text-primary font-medium hover:underline">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))
          : (categories || []).slice(0, 8).map((cat, i) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(22,163,74,0.15)' }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Link
                  to={`/shop?category_id=${cat.id}`}
                  className="card flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-primary transition-colors group"
                >
                  <span className="text-4xl">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      fallbackEmojis[i % fallbackEmojis.length]
                    )}
                  </span>
                  <div>
                    <p className="font-heading font-semibold text-sm text-text group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>
                    {cat.product_count > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">{cat.product_count} items</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { useProducts } from '../../api/products'
import ProductCard from '../shop/ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'

export default function FeaturedProducts() {
  const { data, isLoading } = useProducts({ featured: 'true', page_size: 8 })
  const products = data?.data || []

  if (!isLoading && products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-heading">Featured Products</h2>
          <p className="text-slate-500 text-sm mt-1">Hand-picked fresh picks just for you</p>
        </div>
        <Link to="/shop" className="text-sm text-primary font-medium hover:underline">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </section>
  )
}

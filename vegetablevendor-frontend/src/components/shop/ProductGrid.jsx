import { ProductCardSkeleton } from '../ui/Skeleton'
import ProductCard from './ProductCard'
import EmptyState from '../ui/EmptyState'

export default function ProductGrid({ data, isLoading }) {
  const products = data?.data || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        message="No products found"
        subMessage="Try adjusting your filters or search query."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

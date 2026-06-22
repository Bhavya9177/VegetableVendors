import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useProducts } from '../api/products'
import ProductGrid from '../components/shop/ProductGrid'
import ProductFilters from '../components/shop/ProductFilters'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    category_id: searchParams.get('category_id') || '',
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    page: searchParams.get('page') || 1,
    page_size: 12,
  })

  const { data, isLoading } = useProducts(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== null))
  )

  useEffect(() => {
    const params = {}
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== 1 && k !== 'page_size') params[k] = v
    })
    setSearchParams(params, { replace: true })
  }, [filters])

  const handleFiltersChange = (newFilters) => {
    setFilters((f) => ({ ...f, ...newFilters }))
  }

  const handleSearch = (e) => {
    handleFiltersChange({ search: e.target.value, page: 1 })
  }

  const totalPages = data?.total_pages || 1
  const total = data?.total || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
    >
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-text mb-1">Shop Fresh Produce</h1>
        <p className="text-slate-500 text-sm">{total > 0 ? `${total} products available` : 'Browse our fresh collection'}</p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vegetables, fruits..."
            value={filters.search}
            onChange={handleSearch}
            className="input-field pl-9"
          />
          {filters.search && (
            <button
              onClick={() => handleFiltersChange({ search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 btn-secondary"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Mobile filter drawer overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-heading font-semibold text-base text-text">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close filters"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ProductFilters filters={filters} onChange={handleFiltersChange} />
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary w-full py-2.5 rounded-xl text-sm"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar filters — hidden on mobile */}
        <div className="hidden lg:block lg:w-56 shrink-0">
          <ProductFilters filters={filters} onChange={handleFiltersChange} />
        </div>

        {/* Product grid — always visible */}
        <div className="flex-1 min-w-0">
          <ProductGrid data={data} isLoading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={filters.page <= 1}
                onClick={() => handleFiltersChange({ page: filters.page - 1 })}
                className="btn-secondary disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="flex items-center px-4 text-sm text-slate-600">
                Page {filters.page} of {totalPages}
              </span>
              <button
                disabled={filters.page >= totalPages}
                onClick={() => handleFiltersChange({ page: Number(filters.page) + 1 })}
                className="btn-secondary disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

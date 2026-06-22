import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, X, Edit2, Trash2, Star, Eye, EyeOff, ShoppingBag, Package, AlertTriangle } from 'lucide-react'
import { useAdminProducts } from '../../api/products'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../api/admin'
import ProductForm from '../../components/admin/ProductForm'
import { formatPrice } from '../../utils/formatPrice'
import toast from 'react-hot-toast'

function StockBadge({ product }) {
  if (product.is_out_of_stock || product.stock <= 0)
    return <span className="badge bg-red-50 text-red-600">Out of Stock</span>
  if (product.low_stock)
    return (
      <span className="badge bg-orange-50 text-orange-600">
        <AlertTriangle size={10} />
        Low Stock
      </span>
    )
  return <span className="badge bg-emerald-50 text-emerald-600">In Stock</span>
}

function ProductRow({ product, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100">
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl">🥦</div>}
          </div>
          <div>
            <p className="font-semibold text-slate-700 text-sm">{product.name}</p>
            <p className="text-xs text-slate-400 truncate max-w-xs">{product.description || '—'}</p>
          </div>
        </div>
      </td>
      <td>
        <span className="badge bg-slate-100 text-slate-600">{product.category_name || '—'}</span>
      </td>
      <td>
        {product.price > 0 ? (
          <>
            <p className="font-semibold text-slate-700">{formatPrice(product.price)}</p>
            <p className="text-xs text-slate-400">per {product.unit}</p>
          </>
        ) : (
          <span className="badge bg-red-50 text-red-600 flex items-center gap-1">
            <AlertTriangle size={10} />
            Price not set
          </span>
        )}
      </td>
      <td>
        <p className="font-semibold text-slate-700">{product.stock}</p>
        <p className="text-xs text-slate-400">{product.unit}</p>
      </td>
      <td><StockBadge product={product} /></td>
      <td>
        <div className="flex items-center gap-2">
          {product.featured && (
            <span className="badge bg-yellow-50 text-yellow-600">
              <Star size={10} className="fill-yellow-400" /> Featured
            </span>
          )}
          <span className={`badge ${product.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {product.active ? <Eye size={10} /> : <EyeOff size={10} />}
            {product.active ? 'Active' : 'Hidden'}
          </span>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminProductsPage() {
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]   = useState(null)

  const { data, isLoading } = useAdminProducts({ page, search: search || undefined, page_size: 20 })
  const { mutate: create, isPending: creating } = useCreateProduct()
  const { mutate: update, isPending: updating } = useUpdateProduct()
  const { mutate: del }                          = useDeleteProduct()

  const products   = data?.data       || []
  const totalPages = data?.total_pages || 1
  const total      = data?.total       || 0

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = (p) => { setEditing(p);   setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSubmit = (formData) => {
    if (editing) {
      update({ id: editing.id, ...formData }, { onSuccess: closeModal })
    } else {
      create(formData, { onSuccess: closeModal })
    }
  }

  const handleDelete = (p) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) del(p.id)
  }

  const activeCount    = products.filter((p) => p.active).length
  const featuredCount  = products.filter((p) => p.featured).length
  const lowCount       = products.filter((p) => p.low_stock || p.is_out_of_stock).length
  const noPriceCount   = products.filter((p) => !p.price || p.price <= 0).length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{total} products in catalogue</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Price warning banner */}
      {noPriceCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            <strong>{noPriceCount} product{noPriceCount > 1 ? 's have' : ' has'} no price set.</strong>{' '}
            Orders placed with these products will show ₹0.00. Click Edit to set a price.
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products',   value: total,        icon: ShoppingBag,   color: 'bg-blue-500',    ring: 'ring-blue-100' },
          { label: 'Active',           value: activeCount,  icon: Eye,           color: 'bg-emerald-500', ring: 'ring-emerald-100' },
          { label: 'Featured',         value: featuredCount,icon: Star,          color: 'bg-yellow-500',  ring: 'ring-yellow-100' },
          { label: 'Stock Issues',     value: lowCount,     icon: AlertTriangle, color: 'bg-orange-500',  ring: 'ring-orange-100' },
        ].map(({ label, value, icon: Icon, color, ring }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0 ring-4 ${ring}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold font-heading text-slate-800">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-box h-14 rounded-xl animate-skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">No products found</p>
            <button onClick={openCreate} className="btn-primary mt-4">
              <Plus size={15} />
              Add your first product
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🥦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-700 text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="badge bg-slate-100 text-slate-600">{p.category_name || '—'}</span>
                      {p.price > 0
                        ? <span className="font-semibold text-slate-700">{formatPrice(p.price)}/{p.unit}</span>
                        : <span className="badge bg-red-50 text-red-600">No price</span>}
                      <StockBadge product={p} />
                      {p.featured && <span className="badge bg-yellow-50 text-yellow-600"><Star size={10} className="fill-yellow-400" /> Featured</span>}
                      <span className={`badge ${p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {p.active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Stock: <span className="font-semibold text-slate-600">{p.stock} {p.unit}</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Stock Status</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <ProductRow key={p.id} product={p} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === i + 1 ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Product form modal */}
      <ProductForm
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        product={editing}
        isLoading={creating || updating}
      />
    </motion.div>
  )
}

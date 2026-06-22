import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit2, Trash2, Layers, Eye, EyeOff, ImageOff, CheckCircle, Package } from 'lucide-react'
import { useAdminCategories } from '../../api/categories'
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../api/admin'

function CategoryForm({ isOpen, onClose, onSubmit, category, isLoading }) {
  const [form, setForm] = useState({ name: '', description: '', image_url: '', active: true })
  const [errors, setErrors] = useState({})
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setForm({
          name:        category.name                || '',
          description: category.description         || '',
          image_url:   category.image_url           || '',
          active:      category.active !== false,
        })
      } else {
        setForm({ name: '', description: '', image_url: '', active: true })
      }
      setErrors({})
      setImgError(false)
    }
  }, [category, isOpen])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleActive = () => setForm((f) => ({ ...f, active: !f.active }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Category name is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-card-lg w-full max-w-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-heading font-bold text-slate-800 text-lg">
                {category ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {category ? `Editing: ${category.name}` : 'Fill in the details below'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Image preview */}
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Category Image
                </label>
                <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-slate-50 flex items-center justify-center mb-2">
                  {form.image_url && !imgError ? (
                    <img
                      src={form.image_url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                      onLoad={() => setImgError(false)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300 p-4 text-center">
                      <ImageOff size={28} />
                      <span className="text-xs">Paste image URL below</span>
                    </div>
                  )}
                </div>
                <input
                  value={form.image_url}
                  onChange={(e) => { set('image_url')(e); setImgError(false) }}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field text-xs"
                />

                {/* Active toggle */}
                <button
                  type="button"
                  onClick={toggleActive}
                  className={`mt-3 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                    form.active ? 'border-primary/40 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {form.active
                    ? <Eye size={16} className="text-primary" />
                    : <EyeOff size={16} className="text-slate-300" />}
                  <div className="text-left flex-1">
                    <p className="text-xs font-semibold text-slate-700">{form.active ? 'Active' : 'Hidden'}</p>
                    <p className="text-[10px] text-slate-400">{form.active ? 'Visible in shop' : 'Not shown in shop'}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.active ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {form.active && <CheckCircle size={10} className="text-white fill-white" />}
                  </div>
                </button>
              </div>

              {/* Fields */}
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Vegetables"
                    className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-200' : ''}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={set('description')}
                    rows={4}
                    placeholder="Brief description of this category…"
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary preview */}
            {form.name && (
              <div className="flex items-center gap-3 bg-slate-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm">
                <CheckCircle size={16} className="text-primary shrink-0" />
                <span className="text-slate-600">
                  <strong className="text-slate-800">{form.name}</strong>
                  {form.description && ` · ${form.description.slice(0, 60)}${form.description.length > 60 ? '…' : ''}`}
                  {` · ${form.active ? 'Active' : 'Hidden'}`}
                </span>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading
                ? (category ? 'Updating…' : 'Adding…')
                : (category ? 'Update Category' : 'Add Category')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function CategoryRow({ category, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100">
            {category.image_url
              ? <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl">🏷️</div>}
          </div>
          <div>
            <p className="font-semibold text-slate-700 text-sm">{category.name}</p>
            <p className="text-xs text-slate-400 truncate max-w-xs">{category.description || '—'}</p>
          </div>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-1.5">
          <Package size={13} className="text-slate-400" />
          <span className="font-semibold text-slate-700">{category.product_count ?? 0}</span>
          <span className="text-xs text-slate-400">products</span>
        </div>
      </td>
      <td>
        <span className={`badge ${category.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
          {category.active ? <Eye size={10} /> : <EyeOff size={10} />}
          {category.active ? 'Active' : 'Hidden'}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(category)}
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

export default function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)

  const { data, isLoading }                        = useAdminCategories()
  const { mutate: create,   isPending: creating }  = useCreateCategory()
  const { mutate: update,   isPending: updating }  = useUpdateCategory()
  const { mutate: del }                            = useDeleteCategory()

  const categories  = data?.data || []
  const activeCount = categories.filter((c) => c.active).length
  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count ?? 0), 0)

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = (c) => { setEditing(c);   setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSubmit = (formData) => {
    if (editing) {
      update({ id: editing.id, ...formData }, { onSuccess: closeModal })
    } else {
      create(formData, { onSuccess: closeModal })
    }
  }

  const handleDelete = (c) => {
    if (window.confirm(`Delete category "${c.name}"? This cannot be undone.`)) del(c.id)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories in catalogue</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Categories', value: categories.length, icon: Layers,  color: 'bg-blue-500',    ring: 'ring-blue-100' },
          { label: 'Active',           value: activeCount,        icon: Eye,     color: 'bg-emerald-500', ring: 'ring-emerald-100' },
          { label: 'Total Products',   value: totalProducts,      icon: Package, color: 'bg-violet-500',  ring: 'ring-violet-100' },
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

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-box h-14 rounded-xl animate-skeleton" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">No categories yet</p>
            <p className="text-xs text-slate-300 mt-1 mb-4">Categories are used to organise your products</p>
            <button onClick={openCreate} className="btn-primary">
              <Plus size={15} />
              Add your first category
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    {c.image_url
                      ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🏷️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 text-sm">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Package size={11} className="text-slate-400" />{c.product_count ?? 0} products
                      </span>
                      <span className={`badge ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {c.active ? <Eye size={10} /> : <EyeOff size={10} />}
                        {c.active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <CategoryRow key={c.id} category={c} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <CategoryForm
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        category={editing}
        isLoading={creating || updating}
      />
    </motion.div>
  )
}

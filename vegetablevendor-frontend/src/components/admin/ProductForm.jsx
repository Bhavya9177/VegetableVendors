import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImageOff, CheckCircle, Star, Eye, EyeOff, AlertTriangle, Upload, Loader2 } from 'lucide-react'
import { useCategories } from '../../api/categories'
import { useUploadImage } from '../../api/admin'

const UNIT_PRESETS = ['kg', '500g', '250g', 'g', 'piece', 'dozen', 'bunch', '6 pieces', '1 litre', 'pack', '100ml']

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function ProductForm({ isOpen, onClose, onSubmit, product, isLoading }) {
  const { data: categories = [] } = useCategories()
  const [customUnit, setCustomUnit]   = useState(false)
  const [imgError, setImgError]       = useState(false)
  const fileInputRef                  = useRef(null)
  const uploadImage                   = useUploadImage()

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    price: '',
    unit: 'kg',
    stock: '',
    low_stock_threshold: '10',
    description: '',
    image_url: '',
    featured: false,
    active: true,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (product) {
        const unitIsPreset = UNIT_PRESETS.includes(product.unit)
        setCustomUnit(!unitIsPreset)
        setForm({
          name:                product.name                                    || '',
          category_id:         product.category_id                            || '',
          price:               product.price ? (product.price / 100).toFixed(2) : '',
          unit:                product.unit                                   || 'kg',
          stock:               product.stock ?? '',
          low_stock_threshold: product.low_stock_threshold ?? 10,
          description:         product.description                            || '',
          image_url:           product.image_url                              || '',
          featured:            product.featured                               || false,
          active:              product.active !== false,
        })
      } else {
        setCustomUnit(false)
        setForm({ name: '', category_id: '', price: '', unit: 'kg', stock: '', low_stock_threshold: '10', description: '', image_url: '', featured: false, active: true })
      }
      setErrors({})
      setImgError(false)
    }
  }, [product, isOpen])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())                      e.name        = 'Product name is required'
    if (!form.category_id)                       e.category_id = 'Select a category'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price (must be greater than 0)'
    if (!form.unit.trim())                       e.unit        = 'Unit is required'
    if (form.stock === '' || isNaN(form.stock)) e.stock       = 'Enter initial stock'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...form,
      price:               Math.round(Number(form.price) * 100),
      stock:               Number(form.stock),
      low_stock_threshold: Number(form.low_stock_threshold) || 10,
      category_id:         Number(form.category_id),
    })
  }

  const priceNum = parseFloat(form.price)
  const stockNum = parseInt(form.stock)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-card-lg w-full max-w-2xl max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="font-heading font-bold text-slate-800 text-lg">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {product ? `Editing: ${product.name}` : 'Fill in the details below'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Left: image preview */}
              <div className="sm:col-span-1">
                <Field label="Product Image">
                  {/* Preview */}
                  <div
                    className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-slate-50 flex items-center justify-center mb-2 relative group cursor-pointer"
                    onClick={() => !uploadImage.isPending && fileInputRef.current?.click()}
                  >
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
                        <ImageOff size={32} />
                        <span className="text-xs">Click to upload or paste URL</span>
                      </div>
                    )}
                    {/* Upload overlay */}
                    {uploadImage.isPending && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                        <Loader2 size={28} className="text-white animate-spin" />
                        <span className="text-white text-xs font-medium">Uploading…</span>
                      </div>
                    )}
                    {/* Hover overlay when image exists */}
                    {form.image_url && !imgError && !uploadImage.isPending && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex flex-col items-center gap-1 text-white">
                          <Upload size={20} />
                          <span className="text-xs">Replace</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      e.target.value = ''
                      const url = await uploadImage.mutateAsync(file).catch(() => null)
                      if (url) { setForm((f) => ({ ...f, image_url: url })); setImgError(false) }
                    }}
                  />

                  {/* Upload button */}
                  <button
                    type="button"
                    disabled={uploadImage.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary transition-colors text-xs font-medium disabled:opacity-50 mb-2"
                  >
                    {uploadImage.isPending
                      ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                      : <><Upload size={13} /> Upload from device</>}
                  </button>

                  {/* URL input */}
                  <input
                    value={form.image_url}
                    onChange={(e) => { set('image_url')(e); setImgError(false) }}
                    placeholder="Or paste image URL…"
                    className="input-field text-xs"
                  />
                </Field>

                {/* Featured + Active toggles */}
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={toggle('featured')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                      form.featured ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <Star size={16} className={form.featured ? 'text-yellow-500 fill-yellow-400' : 'text-slate-300'} />
                    <div className="text-left flex-1">
                      <p className="text-xs font-semibold text-slate-700">Featured</p>
                      <p className="text-[10px] text-slate-400">Shows on homepage</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.featured ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'}`}>
                      {form.featured && <CheckCircle size={10} className="text-white fill-white" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={toggle('active')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                      form.active ? 'border-primary/40 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {form.active
                      ? <Eye size={16} className="text-primary" />
                      : <EyeOff size={16} className="text-slate-300" />}
                    <div className="text-left flex-1">
                      <p className="text-xs font-semibold text-slate-700">{form.active ? 'Active' : 'Hidden'}</p>
                      <p className="text-[10px] text-slate-400">{form.active ? 'Visible to customers' : 'Not shown in shop'}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.active ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                      {form.active && <CheckCircle size={10} className="text-white fill-white" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Right: fields */}
              <div className="sm:col-span-2 space-y-4">
                <Field label="Product Name" required error={errors.name}>
                  <input
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Fresh Tomatoes"
                    className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-200' : ''}`}
                  />
                </Field>

                <Field label="Category" required error={errors.category_id}>
                  <select
                    value={form.category_id}
                    onChange={set('category_id')}
                    className={`input-field ${errors.category_id ? 'border-red-400 focus:ring-red-200' : ''}`}
                  >
                    <option value="">— Select category —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price per unit (₹)" required error={errors.price}
                    hint={priceNum > 0 ? `= ₹${priceNum.toFixed(2)} per ${form.unit}` : undefined}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={set('price')}
                      placeholder="e.g. 40.00"
                      className={`input-field ${errors.price ? 'border-red-400 focus:ring-red-200' : ''}`}
                    />
                  </Field>

                  <Field label="Unit" required error={errors.unit}>
                    {customUnit ? (
                      <div className="flex gap-1.5">
                        <input
                          value={form.unit}
                          onChange={set('unit')}
                          placeholder="e.g. 500g"
                          className={`input-field flex-1 ${errors.unit ? 'border-red-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => { setCustomUnit(false); setForm((f) => ({ ...f, unit: 'kg' })) }}
                          className="p-2 rounded-xl border border-gray-200 text-slate-400 hover:bg-slate-50"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={UNIT_PRESETS.includes(form.unit) ? form.unit : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') { setCustomUnit(true); setForm((f) => ({ ...f, unit: '' })) }
                          else set('unit')(e)
                        }}
                        className="input-field"
                      >
                        {UNIT_PRESETS.map((u) => <option key={u} value={u}>{u}</option>)}
                        <option value="__custom__">Custom…</option>
                      </select>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Initial Stock" required error={errors.stock}
                    hint={!errors.stock && stockNum === 0 ? 'Will be marked Out of Stock' : undefined}>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={set('stock')}
                      placeholder="e.g. 100"
                      className={`input-field ${errors.stock ? 'border-red-400 focus:ring-red-200' : ''}`}
                    />
                  </Field>

                  <Field label="Low Stock Alert at" hint={`Alert when stock ≤ this`}>
                    <div className="relative">
                      <AlertTriangle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                      <input
                        type="number"
                        min="1"
                        value={form.low_stock_threshold}
                        onChange={set('low_stock_threshold')}
                        placeholder="10"
                        className="input-field pl-9"
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={set('description')}
                    rows={3}
                    placeholder="Describe the product — freshness, origin, use cases…"
                    className="input-field resize-none"
                  />
                </Field>
              </div>
            </div>

            {/* Summary preview */}
            {form.name && form.price && form.unit && (
              <div className="flex items-center gap-3 bg-slate-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm">
                <CheckCircle size={16} className="text-primary shrink-0" />
                <span className="text-slate-600">
                  <strong className="text-slate-800">{form.name}</strong>
                  {form.price && ` · ₹${parseFloat(form.price).toFixed(2)}/${form.unit}`}
                  {form.stock !== '' && ` · ${form.stock} in stock`}
                  {form.category_id && ` · ${categories.find((c) => c.id == form.category_id)?.name || ''}`}
                </span>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading
                ? (product ? 'Updating…' : 'Adding…')
                : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

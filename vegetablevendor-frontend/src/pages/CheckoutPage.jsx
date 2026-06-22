import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Plus, Check, X, Wallet, ShoppingBag, Tag } from 'lucide-react'
import { useCart } from '../api/cart'
import { useAddresses, useCreateAddress } from '../api/addresses'
import { usePlaceOrder } from '../api/orders'
import { useApplyCoupon } from '../api/coupons'
import { formatPrice } from '../utils/formatPrice'

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry']

function AddressForm({ onSave, onCancel, isPending }) {
  const [form, setForm] = useState({ full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Required'
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid phone required'
    if (!form.line1.trim()) e.line1 = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.state) e.state = 'Required'
    if (!form.pincode.trim() || form.pincode.length < 6) e.pincode = 'Valid pincode required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = () => { if (validate()) onSave(form) }

  return (
    <div className="mt-4 p-4 bg-slate-50/80 rounded-2xl border border-gray-100 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Full Name *', key: 'full_name', placeholder: 'Recipient name' },
          { label: 'Phone *', key: 'phone', placeholder: '10-digit mobile' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
            <input value={form[key]} onChange={set(key)} placeholder={placeholder}
              className={`input-field ${errors[key] ? 'border-red-400' : ''}`} />
            {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Address Line 1 *</label>
        <input value={form.line1} onChange={set('line1')} placeholder="Flat/House no, Street"
          className={`input-field ${errors.line1 ? 'border-red-400' : ''}`} />
        {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Address Line 2</label>
        <input value={form.line2} onChange={set('line2')} placeholder="Area, Landmark (optional)" className="input-field" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">City *</label>
          <input value={form.city} onChange={set('city')} className={`input-field ${errors.city ? 'border-red-400' : ''}`} />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">State *</label>
          <select value={form.state} onChange={set('state')} className={`input-field ${errors.state ? 'border-red-400' : ''}`}>
            <option value="">Select</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Pincode *</label>
          <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit"
            className={`input-field ${errors.pincode ? 'border-red-400' : ''}`} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={isPending} className="btn-primary">
          <Check size={15} />
          {isPending ? 'Saving…' : 'Save Address'}
        </button>
        <button onClick={onCancel} className="btn-ghost">
          <X size={15} />
          Cancel
        </button>
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <Icon size={17} className="text-primary" />
        <h2 className="font-heading font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// Delivery fee thresholds (must match backend Setting defaults)
const FREE_DELIVERY_ABOVE = 50000  // ₹500 in paise
const DELIVERY_FEE        = 4000   // ₹40 in paise

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading: cartLoading } = useCart()
  const { data: addresses = [], isLoading: addrLoading } = useAddresses()
  const { mutate: placeOrder, isPending: placing } = usePlaceOrder()
  const { mutate: createAddr, isPending: creatingAddr } = useCreateAddress()
  const { mutate: applyCoupon, isPending: applyingCoupon } = useApplyCoupon()

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showNewForm, setShowNewForm]     = useState(false)
  const [notes, setNotes]                 = useState('')
  const [couponInput, setCouponInput]     = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const orderSubmittedRef = useRef(false)

  useEffect(() => {
    if (!selectedAddress && addresses?.length) {
      const def = addresses.find((a) => a.is_default) || addresses[0]
      setSelectedAddress(def.id)
    }
  }, [addresses])

  const subtotal     = cart?.total || 0
  const deliveryFee  = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const discount     = appliedCoupon?.discount_amount || 0
  const orderTotal   = subtotal + deliveryFee - discount

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return
    applyCoupon(
      { coupon_code: couponInput.trim(), subtotal },
      { onSuccess: (data) => { setAppliedCoupon(data); setCouponInput('') } }
    )
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) { alert('Please select a delivery address.'); return }
    orderSubmittedRef.current = true
    placeOrder(
      { address_id: selectedAddress, notes, coupon_code: appliedCoupon?.code || null },
      {
        onSuccess: (order) => navigate(`/orders/${order.id}`),
        onError: () => { orderSubmittedRef.current = false },
      }
    )
  }

  if (cartLoading || addrLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-32 skeleton-box animate-skeleton" />)}
        </div>
        <div className="lg:col-span-2">
          <div className="card h-64 skeleton-box animate-skeleton" />
        </div>
      </div>
    )
  }

  if (!cart?.items?.length && !orderSubmittedRef.current) { navigate('/cart'); return null }

  const selectedAddr = addresses.find((a) => a.id === selectedAddress)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading font-bold text-2xl text-slate-800 mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column */}
            <div className="lg:col-span-3 space-y-4">
              {/* Address section */}
              <SectionCard icon={MapPin} title="Delivery Address">
                {selectedAddr && (
                  <div className="flex items-start gap-3 p-3 bg-primary-50 border border-primary/20 rounded-xl mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-semibold text-slate-800">{selectedAddr.full_name}</p>
                      <p className="text-slate-600 text-xs mt-0.5">
                        {selectedAddr.line1}{selectedAddr.line2 ? `, ${selectedAddr.line2}` : ''}, {selectedAddr.city}, {selectedAddr.state} – {selectedAddr.pincode}
                      </p>
                      <p className="text-slate-400 text-xs">📞 {selectedAddr.phone}</p>
                    </div>
                  </div>
                )}

                {addresses.length > 1 && (
                  <div className="space-y-2 mb-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAddress === addr.id
                            ? 'border-primary bg-primary-50'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1 accent-primary"
                        />
                        <div className="text-sm flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-700">{addr.full_name}</p>
                            {addr.is_default && (
                              <span className="badge bg-primary/10 text-primary text-[10px]">Default</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}
                          </p>
                          <p className="text-slate-400 text-xs">📞 {addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  {showNewForm ? <X size={14} /> : <Plus size={14} />}
                  {showNewForm ? 'Cancel' : 'Add New Address'}
                </button>

                {showNewForm && (
                  <AddressForm
                    onSave={(data) => createAddr(data, { onSuccess: (saved) => { setSelectedAddress(saved.id); setShowNewForm(false) } })}
                    onCancel={() => setShowNewForm(false)}
                    isPending={creatingAddr}
                  />
                )}
              </SectionCard>

              {/* Payment method */}
              <SectionCard icon={Wallet} title="Payment Method">
                <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-primary bg-primary-50">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl shrink-0">💵</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-800">Cash on Delivery</p>
                    <p className="text-xs text-slate-500">Pay when your order arrives</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
              </SectionCard>

              {/* Coupon */}
              <SectionCard icon={Tag} title="Coupon Code">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <p className="font-semibold text-emerald-700 text-sm">{appliedCoupon.code}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {appliedCoupon.description || (appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700 text-sm">-{formatPrice(appliedCoupon.discount_amount)}</span>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="p-1 rounded-lg text-emerald-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove coupon"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || applyingCoupon}
                      className="btn-primary shrink-0 disabled:opacity-50"
                    >
                      {applyingCoupon ? 'Applying…' : 'Apply'}
                    </button>
                  </div>
                )}
              </SectionCard>

              {/* Order notes */}
              <SectionCard icon={Tag} title="Order Notes (Optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Special delivery instructions, e.g. leave at door, call before delivery…"
                  className="input-field resize-none"
                />
              </SectionCard>
            </div>

            {/* Order summary sticky */}
            <div className="lg:col-span-2">
              <div className="card p-5 sticky top-20">
                <h2 className="font-heading font-semibold text-slate-800 mb-4">Order Summary</h2>

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product_image
                          ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          : <span className="text-base">🥦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate font-medium">{item.product_name}</p>
                        <p className="text-xs text-slate-400">× {item.quantity} {item.unit}</p>
                      </div>
                      <span className="text-sm text-slate-700 font-semibold shrink-0">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal ({cart.item_count} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Delivery</span>
                    {deliveryFee === 0
                      ? <span className="text-emerald-600 font-semibold">FREE</span>
                      : <span>{formatPrice(deliveryFee)}</span>
                    }
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  {subtotal > 0 && subtotal < FREE_DELIVERY_ABOVE && (
                    <p className="text-xs text-amber-600">
                      Add {formatPrice(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery
                    </p>
                  )}

                  <div className="flex justify-between font-heading font-bold text-lg pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddress}
                  className="btn-primary w-full justify-center py-3.5 text-base mt-5 disabled:opacity-50"
                >
                  <ShoppingBag size={18} />
                  {placing ? 'Placing Order…' : 'Place Order'}
                </button>

                {!selectedAddress && (
                  <p className="text-xs text-center text-amber-500 mt-2 font-medium">
                    ⚠ Please select a delivery address
                  </p>
                )}

                <p className="text-xs text-center text-slate-400 mt-2">
                  By placing order you agree to our{' '}
                  <a href="/terms" className="underline hover:text-primary">Terms & Conditions</a>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

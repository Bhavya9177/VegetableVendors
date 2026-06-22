import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, MapPin, Plus, Trash2, Star, ChevronRight, Edit2, X, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile } from '../api/auth'
import { useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress } from '../api/addresses'
import { useOrders } from '../api/orders'
import { formatPrice } from '../utils/formatPrice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry']

const TABS = [
  { key: 'profile',   label: 'Profile',    icon: User },
  { key: 'addresses', label: 'Addresses',  icon: MapPin },
  { key: 'security',  label: 'Security',   icon: Lock },
]

function AddressForm({ initial = {}, onSave, onCancel, isPending }) {
  const [form, setForm] = useState({
    full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
    ...initial,
  })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Required'
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid 10-digit phone required'
    if (!form.line1.trim()) e.line1 = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.state) e.state = 'Required'
    if (!form.pincode.trim() || form.pincode.length < 6) e.pincode = 'Valid pincode required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = () => { if (validate()) onSave(form) }

  return (
    <div className="border border-gray-100 rounded-2xl p-5 bg-slate-50/50 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Full Name *', key: 'full_name', placeholder: 'Recipient name' },
          { label: 'Phone *',     key: 'phone',     placeholder: '10-digit mobile' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
            <input value={form[key]} onChange={set(key)} placeholder={placeholder}
              className={`input-field ${errors[key] ? 'border-red-400 focus:ring-red-200' : ''}`} />
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
          <input value={form.city} onChange={set('city')} placeholder="City"
            className={`input-field ${errors.city ? 'border-red-400' : ''}`} />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">State *</label>
          <select value={form.state} onChange={set('state')}
            className={`input-field ${errors.state ? 'border-red-400' : ''}`}>
            <option value="">Select</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Pincode *</label>
          <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode"
            className={`input-field ${errors.pincode ? 'border-red-400' : ''}`} />
          {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
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

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [showAddressForm, setShowAddressForm] = useState(false)

  // Profile form
  const [info, setInfo] = useState({ full_name: user?.full_name || '', phone_number: user?.phone_number || '' })
  const [infoErrors, setInfoErrors] = useState({})
  const { mutate: updateProfile, isPending: savingInfo } = useUpdateProfile()

  // Password
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [pwdLoading, setPwdLoading] = useState(false)

  // Addresses
  const { data: addresses = [] } = useAddresses()
  const { mutate: createAddr, isPending: creatingAddr } = useCreateAddress()
  const { mutate: deleteAddr } = useDeleteAddress()
  const { mutate: setDefault } = useSetDefaultAddress()

  // Orders stats
  const { data: ordersData } = useOrders()
  const orders = ordersData?.data || []
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const totalSpent = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total_amount, 0)

  const validateInfo = () => {
    const e = {}
    if (!info.full_name.trim()) e.full_name = 'Name is required'
    if (info.phone_number && !/^[6-9]\d{9}$/.test(info.phone_number.trim()))
      e.phone_number = 'Enter a valid 10-digit mobile number'
    setInfoErrors(e)
    return !Object.keys(e).length
  }

  const handleSaveInfo = () => {
    if (!validateInfo()) return
    updateProfile({ full_name: info.full_name.trim(), phone_number: info.phone_number.trim() })
  }

  const validatePwd = () => {
    const e = {}
    if (!pwd.current_password) e.current_password = 'Required'
    if (pwd.new_password.length < 6) e.new_password = 'Minimum 6 characters'
    if (pwd.new_password !== pwd.confirm_password) e.confirm_password = 'Passwords do not match'
    setPwdErrors(e)
    return !Object.keys(e).length
  }

  const handleChangePassword = async () => {
    if (!validatePwd()) return
    setPwdLoading(true)
    try {
      await api.put('/me/update-password', {
        data: { current_password: pwd.current_password, new_password: pwd.new_password },
      })
      toast.success('Password changed successfully')
      setPwd({ current_password: '', new_password: '', confirm_password: '' })
      setPwdErrors({})
    } catch (err) {
      toast.error(err.response?.data?.data || 'Failed to change password')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="card p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-2xl font-bold text-white font-heading">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="font-heading font-bold text-xl text-slate-800">{user?.full_name}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
              {user?.phone_number && (
                <p className="text-slate-400 text-xs mt-0.5">📞 {user.phone_number}</p>
              )}
            </div>
            {/* Quick stats */}
            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 shrink-0">
              <div className="text-center">
                <p className="font-bold text-lg font-heading text-primary">{orders.length}</p>
                <p className="text-xs text-slate-400">Orders</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg font-heading text-emerald-600">{deliveredCount}</p>
                <p className="text-xs text-slate-400">Delivered</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg font-heading text-slate-700">{formatPrice(totalSpent)}</p>
                <p className="text-xs text-slate-400">Spent</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <div className="flex gap-1 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm mb-5">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
              <h2 className="font-heading font-semibold text-slate-800">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                  <input
                    value={info.full_name}
                    onChange={(e) => setInfo((s) => ({ ...s, full_name: e.target.value }))}
                    placeholder="Your full name"
                    className={`input-field ${infoErrors.full_name ? 'border-red-400' : ''}`}
                  />
                  {infoErrors.full_name && <p className="text-xs text-red-500 mt-1">{infoErrors.full_name}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
                  <input value={user?.email || ''} disabled className="input-field bg-slate-50 text-slate-400 cursor-not-allowed" />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Mobile Number</label>
                  <input
                    type="tel"
                    value={info.phone_number}
                    onChange={(e) => setInfo((s) => ({ ...s, phone_number: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className={`input-field ${infoErrors.phone_number ? 'border-red-400' : ''}`}
                  />
                  {infoErrors.phone_number && <p className="text-xs text-red-500 mt-1">{infoErrors.phone_number}</p>}
                  <p className="text-xs text-slate-400 mt-1">Used for WhatsApp order updates.</p>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-50">
                <button onClick={handleSaveInfo} disabled={savingInfo} className="btn-primary">
                  {savingInfo ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Addresses tab */}
          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className={`card p-4 sm:p-5 ${addr.is_default ? 'border-primary/30 bg-primary-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${addr.is_default ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-slate-800 text-sm">{addr.full_name}</p>
                          {addr.is_default && (
                            <span className="badge bg-primary/10 text-primary text-[10px]">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                        </p>
                        <p className="text-sm text-slate-500">{addr.city}, {addr.state} – {addr.pincode}</p>
                        <p className="text-xs text-slate-400 mt-0.5">📞 {addr.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!addr.is_default && (
                        <button
                          onClick={() => setDefault(addr.id)}
                          className="text-xs text-primary font-medium hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteAddr(addr.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="card w-full p-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary-50 transition-colors border-dashed"
                >
                  <Plus size={16} />
                  Add New Address
                </button>
              ) : (
                <AddressForm
                  onSave={(data) => createAddr(data, { onSuccess: () => setShowAddressForm(false) })}
                  onCancel={() => setShowAddressForm(false)}
                  isPending={creatingAddr}
                />
              )}

              {addresses.length === 0 && !showAddressForm && (
                <div className="card p-10 text-center">
                  <MapPin size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium mb-1">No saved addresses</p>
                  <p className="text-slate-400 text-sm">Add an address for faster checkout.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
              <h2 className="font-heading font-semibold text-slate-800">Change Password</h2>
              <div className="space-y-4">
                {[
                  { label: 'Current Password', key: 'current_password', auto: 'current-password' },
                  { label: 'New Password',      key: 'new_password',     auto: 'new-password' },
                  { label: 'Confirm Password',  key: 'confirm_password', auto: 'new-password' },
                ].map(({ label, key, auto }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                    <input
                      type="password"
                      value={pwd[key]}
                      onChange={(e) => setPwd((s) => ({ ...s, [key]: e.target.value }))}
                      placeholder="••••••••"
                      autoComplete={auto}
                      className={`input-field ${pwdErrors[key] ? 'border-red-400' : ''}`}
                    />
                    {pwdErrors[key] && <p className="text-xs text-red-500 mt-1">{pwdErrors[key]}</p>}
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-50">
                <button onClick={handleChangePassword} disabled={pwdLoading} className="btn-primary">
                  {pwdLoading ? 'Updating…' : 'Change Password'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

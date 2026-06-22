import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Bell, Truck, MessageSquare, Shield, Save, ChevronRight, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings, useUpdateSettings } from '../../api/admin'

const sections = [
  { key: 'store',         label: 'Store Info',          icon: Store },
  { key: 'notifications', label: 'Notifications',        icon: Bell },
  { key: 'delivery',      label: 'Delivery Settings',    icon: Truck },
  { key: 'whatsapp',      label: 'WhatsApp Config',      icon: MessageSquare },
  { key: 'security',      label: 'Security',             icon: Shield },
]

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [active, setActive] = useState('store')

  const [store, setStore] = useState({
    name: 'VegFresh',
    tagline: 'Fresh from Farm to Your Door',
    phone: '',
    email: '',
    address: '',
    currency: 'INR',
    tax: '5',
  })

  const [notif, setNotif] = useState({
    newOrder: true,
    lowStock: true,
    delivery: true,
    marketing: false,
  })

  const [delivery, setDelivery] = useState({
    freeAbove:     '500',
    deliveryFee:   '40',
    minOrder:      '100',
    sameDayCutoff: '14:00',
    slots:         true,
  })

  const [whatsapp, setWhatsapp] = useState({
    enabled:     true,
    apiKey:      '',
    fromNumber:  '',
    autoConfirm: true,
    autoDelivery: true,
    autoCod:     false,
  })

  const [security, setSecurity] = useState({
    currentPwd:     '',
    newPwd:         '',
    confirmPwd:     '',
    twoFactor:      false,
    sessionTimeout: '8',
  })

  const { data: settingsData, isLoading } = useSettings()
  const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings()

  // Populate state from API data when it loads
  useEffect(() => {
    if (!settingsData) return
    setStore((s) => ({
      ...s,
      name:     settingsData.store_name     || s.name,
      tagline:  settingsData.store_tagline  || s.tagline,
      phone:    settingsData.store_phone    ?? s.phone,
      email:    settingsData.store_email    ?? s.email,
      address:  settingsData.store_address  ?? s.address,
      currency: settingsData.currency       || s.currency,
      tax:      settingsData.tax_rate       || s.tax,
    }))
    setDelivery((d) => ({
      ...d,
      freeAbove:     settingsData.free_delivery_above ?? d.freeAbove,
      deliveryFee:   settingsData.delivery_fee        ?? d.deliveryFee,
      minOrder:      settingsData.min_order_amount    ?? d.minOrder,
      sameDayCutoff: settingsData.same_day_cutoff     || d.sameDayCutoff,
      slots:         settingsData.enable_delivery_slots !== 'false',
    }))
    setNotif((n) => ({
      ...n,
      newOrder: settingsData.notify_new_orders !== 'false',
      lowStock: settingsData.notify_low_stock  !== 'false',
    }))
    setWhatsapp((w) => ({
      ...w,
      enabled: settingsData.whatsapp_enabled !== 'false',
    }))
  }, [settingsData])

  const handleSave = () => {
    updateSettings({
      store_name:            store.name,
      store_tagline:         store.tagline,
      store_phone:           store.phone,
      store_email:           store.email,
      store_address:         store.address,
      currency:              store.currency,
      tax_rate:              store.tax,
      notify_new_orders:     String(notif.newOrder),
      notify_low_stock:      String(notif.lowStock),
      delivery_fee:          delivery.deliveryFee,
      min_order_amount:      delivery.minOrder,
      free_delivery_above:   delivery.freeAbove,
      same_day_cutoff:       delivery.sameDayCutoff,
      enable_delivery_slots: String(delivery.slots),
      whatsapp_enabled:      String(whatsapp.enabled),
    })
  }

  const storeSet = (k) => (e) => setStore((s) => ({ ...s, [k]: e.target.value }))
  const delivSet = (k) => (e) => setDelivery((s) => ({ ...s, [k]: e.target.value }))
  const waSet   = (k) => (e) => setWhatsapp((s) => ({ ...s, [k]: e.target.value }))
  const secSet  = (k) => (e) => setSecurity((s) => ({ ...s, [k]: e.target.value }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your store configuration</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary disabled:opacity-60">
          {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Mobile: horizontal scrollable tab strip */}
      <div className="lg:hidden card p-1 flex gap-1 overflow-x-auto scrollbar-none">
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              active === key ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon size={14} className={active === key ? 'text-primary' : 'text-slate-400'} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar nav — desktop only */}
        <div className="hidden lg:block card p-2 h-fit">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === key ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={active === key ? 'text-primary' : 'text-slate-400'} />
                {label}
              </div>
              <ChevronRight size={14} className={`transition-transform ${active === key ? 'text-primary rotate-90' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>

        {/* Content panels */}
        <div className="lg:col-span-3 card p-5 sm:p-6">
          {active === 'store' && (
            <div>
              <h2 className="font-heading font-semibold text-slate-800 mb-5">Store Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Store Name',   key: 'name',     placeholder: 'VegFresh' },
                  { label: 'Tagline',      key: 'tagline',  placeholder: 'Fresh vegetables...' },
                  { label: 'Phone',        key: 'phone',    placeholder: '9876543210' },
                  { label: 'Email',        key: 'email',    placeholder: 'support@...' },
                  { label: 'Currency',     key: 'currency', placeholder: 'INR' },
                  { label: 'Tax Rate (%)', key: 'tax',      placeholder: '5' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                    <input value={store[key]} onChange={storeSet(key)} placeholder={placeholder} className="input-field" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Address</label>
                  <input value={store.address} onChange={storeSet('address')} placeholder="Full address" className="input-field" />
                </div>
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div>
              <h2 className="font-heading font-semibold text-slate-800 mb-5">Notification Preferences</h2>
              <SettingRow label="New Order Alerts" desc="Notify when a new order is placed">
                <Toggle value={notif.newOrder} onChange={(v) => setNotif((n) => ({ ...n, newOrder: v }))} />
              </SettingRow>
              <SettingRow label="Low Stock Alerts" desc="Alert when product stock drops below threshold">
                <Toggle value={notif.lowStock} onChange={(v) => setNotif((n) => ({ ...n, lowStock: v }))} />
              </SettingRow>
              <SettingRow label="Delivery Updates" desc="Notifications for delivery status changes">
                <Toggle value={notif.delivery} onChange={(v) => setNotif((n) => ({ ...n, delivery: v }))} />
              </SettingRow>
              <SettingRow label="Marketing Emails" desc="Promotional and marketing notifications">
                <Toggle value={notif.marketing} onChange={(v) => setNotif((n) => ({ ...n, marketing: v }))} />
              </SettingRow>
            </div>
          )}

          {active === 'delivery' && (
            <div>
              <h2 className="font-heading font-semibold text-slate-800 mb-5">Delivery Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Free Delivery Above (₹)', key: 'freeAbove',     placeholder: '500' },
                  { label: 'Delivery Fee (₹)',         key: 'deliveryFee',   placeholder: '40' },
                  { label: 'Minimum Order (₹)',        key: 'minOrder',      placeholder: '100' },
                  { label: 'Same-day Order Cutoff',    key: 'sameDayCutoff', placeholder: '14:00' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                    <input value={delivery[key]} onChange={delivSet(key)} placeholder={placeholder} className="input-field" />
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <SettingRow label="Delivery Time Slots" desc="Allow customers to choose a delivery slot">
                  <Toggle value={delivery.slots} onChange={(v) => setDelivery((d) => ({ ...d, slots: v }))} />
                </SettingRow>
              </div>
            </div>
          )}

          {active === 'whatsapp' && (
            <div>
              <h2 className="font-heading font-semibold text-slate-800 mb-5">WhatsApp Configuration</h2>
              <SettingRow label="Enable WhatsApp" desc="Send notifications via WhatsApp">
                <Toggle value={whatsapp.enabled} onChange={(v) => setWhatsapp((w) => ({ ...w, enabled: v }))} />
              </SettingRow>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">API Key</label>
                  <input
                    type="password"
                    value={whatsapp.apiKey}
                    onChange={waSet('apiKey')}
                    placeholder="Configured in .env"
                    className="input-field"
                    disabled
                  />
                  <p className="text-xs text-slate-400 mt-1">Edit WHATSAPP_ACCESS_TOKEN in .env to change</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">From Number</label>
                  <input
                    value={whatsapp.fromNumber}
                    onChange={waSet('fromNumber')}
                    placeholder="Configured in .env"
                    className="input-field"
                    disabled
                  />
                  <p className="text-xs text-slate-400 mt-1">Edit VENDOR_WHATSAPP_PHONE in .env to change</p>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Message Triggers</p>
                <SettingRow label="Auto Order Confirmation" desc="Send WhatsApp to customer when order is placed">
                  <Toggle value={whatsapp.autoConfirm} onChange={(v) => setWhatsapp((w) => ({ ...w, autoConfirm: v }))} />
                </SettingRow>
                <SettingRow label="Auto Delivery Update" desc="Send WhatsApp when order is out for delivery">
                  <Toggle value={whatsapp.autoDelivery} onChange={(v) => setWhatsapp((w) => ({ ...w, autoDelivery: v }))} />
                </SettingRow>
                <SettingRow label="COD Reminder" desc="Remind COD customers before delivery">
                  <Toggle value={whatsapp.autoCod} onChange={(v) => setWhatsapp((w) => ({ ...w, autoCod: v }))} />
                </SettingRow>
              </div>
            </div>
          )}

          {active === 'security' && (
            <div>
              <h2 className="font-heading font-semibold text-slate-800 mb-5">Security Settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'Current Password',     key: 'currentPwd', type: 'password' },
                  { label: 'New Password',         key: 'newPwd',     type: 'password' },
                  { label: 'Confirm New Password', key: 'confirmPwd', type: 'password' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                    <input value={security[key]} onChange={secSet(key)} type={type} placeholder="••••••••" className="input-field" />
                  </div>
                ))}
                <button className="btn-secondary w-full justify-center mt-2">Update Password</button>
              </div>
              <div className="mt-6">
                <SettingRow label="Two-Factor Authentication" desc="Extra security for admin login">
                  <Toggle value={security.twoFactor} onChange={(v) => setSecurity((s) => ({ ...s, twoFactor: v }))} />
                </SettingRow>
                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Session Timeout (hours)</label>
                  <select value={security.sessionTimeout} onChange={secSet('sessionTimeout')} className="input-field w-auto">
                    {['1', '2', '4', '8', '24'].map((h) => (
                      <option key={h} value={h}>{h} {h === '1' ? 'hour' : 'hours'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

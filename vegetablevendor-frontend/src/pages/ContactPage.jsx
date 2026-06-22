import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import api from '../api/axios'

export default function ContactPage() {
  const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      await api.post('/contact', { data: { ...form } })
      toast.success("Message sent! We'll get back to you within 24 hours.")
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.data || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-gradient-to-br from-primary-dark to-primary py-16 text-center">
        <h1 className="font-heading font-bold text-4xl text-white mb-3">Contact Us</h1>
        <p className="text-white/80 max-w-md mx-auto">We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <div>
            <h2 className="font-heading font-bold text-xl text-text mb-4">Get in Touch</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Have questions about your order, need help with returns, or want to partner with us? We're here to help.
            </p>
          </div>

          {[
            { icon: '📍', title: 'Our Address', lines: ['123 Market Street', 'Fresh Town, IN 500001'] },
            { icon: '📞', title: 'Phone', lines: ['+91 99999 99999', 'Mon–Sat, 8 AM – 8 PM'] },
            { icon: '✉️', title: 'Email', lines: ['hello@vegfresh.in', 'support@vegfresh.in'] },
            { icon: '🕐', title: 'Business Hours', lines: ['Monday – Saturday: 8 AM – 8 PM', 'Sunday: 9 AM – 5 PM'] },
          ].map(({ icon, title, lines }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-xl shrink-0">{icon}</div>
              <div>
                <p className="font-semibold text-sm text-text">{title}</p>
                {lines.map((l) => <p key={l} className="text-sm text-slate-500">{l}</p>)}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="font-heading font-bold text-lg text-text mb-2">Message Sent!</h3>
              <p className="text-slate-500 text-sm">We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); setLoading(false) }} className="btn-primary mt-4">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-heading font-semibold text-base text-text mb-2">Send a Message</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Your Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Doe" />
                <Input label="Email *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
              </div>
              <Input label="Subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="What's this about?" />
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <Button type="submit" loading={loading} className="w-full py-3 rounded-xl">Send Message</Button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}

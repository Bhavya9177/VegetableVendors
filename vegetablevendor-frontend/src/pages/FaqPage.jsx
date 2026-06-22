import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    category: 'Orders & Delivery',
    items: [
      { q: 'What are the delivery timings?', a: 'We deliver Monday to Saturday, 7 AM – 12 PM. Orders placed before 10 PM are delivered the next morning.' },
      { q: 'Is there a minimum order value?', a: 'No minimum order! You can order as little as 250g of any product. Free delivery on all orders.' },
      { q: 'Do you deliver on Sundays?', a: 'Currently we deliver Monday to Saturday. Sunday delivery is available in select areas — check at checkout.' },
      { q: 'How do I track my order?', a: 'Once placed, you can track your order status in real-time under My Orders in your account.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We currently accept Cash on Delivery (COD) only. Pay when your fresh produce arrives at your doorstep.' },
      { q: 'Is it safe to order?', a: 'Absolutely! Our COD model means you pay only after you receive and inspect your order.' },
    ],
  },
  {
    category: 'Products & Quality',
    items: [
      { q: 'Are your products organic?', a: 'Most of our products are naturally grown with minimal pesticides. Certified organic items are labeled accordingly.' },
      { q: 'How fresh are the products?', a: 'All produce is harvested the same morning and delivered within hours. We maintain a strict farm-to-door freshness guarantee.' },
      { q: 'What if I receive a damaged or bad product?', a: "We have a 100% freshness guarantee. Just click 'Report Issue' in your order within 24 hours and we'll replace it or issue a full refund." },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: "If you're not satisfied with the quality of any item, report it within 24 hours of delivery. We offer a free replacement or full refund." },
      { q: 'How long does a refund take?', a: 'Since we use Cash on Delivery, refunds are issued as store credits or cash at your next delivery within 2 business days.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I create an account?', a: "Click 'Sign Up' on the top right, enter your name, email, and password — that's it! Takes less than a minute." },
      { q: 'Can I change my delivery address?', a: 'Yes! You can manage multiple addresses under your account. Choose a different address at checkout.' },
    ],
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-sm text-text pr-4">{q}</span>
        <ChevronDownIcon className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-gray-100 pt-3">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-gradient-to-br from-primary-dark to-primary py-16 text-center">
        <h1 className="font-heading font-bold text-4xl text-white mb-3">Frequently Asked Questions</h1>
        <p className="text-white/80 max-w-md mx-auto">Got questions? We've got answers.</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {faqs.map(({ category, items }) => (
          <div key={category}>
            <h2 className="font-heading font-bold text-lg text-text mb-4">{category}</h2>
            <div className="space-y-2">
              {items.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div className="card p-6 text-center bg-primary-50 border-primary-100">
          <p className="text-slate-700 font-medium mb-2">Still have questions?</p>
          <p className="text-slate-500 text-sm mb-4">Our support team is available 8 AM – 8 PM, Mon–Sat.</p>
          <a href="/contact" className="btn-primary">Contact Support</a>
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-bold text-lg text-text mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function RefundPolicyPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-gradient-to-br from-primary-dark to-primary py-12 text-center">
        <h1 className="font-heading font-bold text-3xl text-white mb-2">Return & Refund Policy</h1>
        <p className="text-white/70 text-sm">Last updated: May 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Quick summary */}
        <div className="card p-5 mb-8 bg-primary-50 border-primary-100">
          <p className="font-heading font-semibold text-primary text-base mb-1">Our Promise</p>
          <p className="text-slate-700 text-sm">If you receive a product that is damaged, spoiled, or not what you ordered — we will replace it for free or issue a full refund. No questions asked.</p>
        </div>

        <Section title="1. Eligibility for Return / Refund">
          <p>You are eligible for a return or refund if:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The product is damaged, spoiled, or rotten on delivery</li>
            <li>You received the wrong product or wrong quantity</li>
            <li>The product quality does not meet our freshness standards</li>
          </ul>
          <p>Requests must be made within <strong>24 hours</strong> of delivery.</p>
        </Section>

        <Section title="2. How to Request a Return / Refund">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to <strong>My Orders</strong> in your account</li>
            <li>Select the order and click <strong>"Report Issue"</strong></li>
            <li>Select the affected item(s) and describe the issue</li>
            <li>Attach a photo if possible (helps us improve)</li>
            <li>Submit — our team will respond within 4 hours</li>
          </ol>
        </Section>

        <Section title="3. Refund Process">
          <p>Since we use Cash on Delivery, refunds are processed as:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Free Replacement:</strong> The item is replaced in your next delivery (same day or next day)</li>
            <li><strong>Cash Refund:</strong> Refunded in cash at your next delivery</li>
            <li><strong>Store Credit:</strong> Added to your account for use on future orders</li>
          </ul>
          <p>We will confirm the refund method within 4 hours of your request.</p>
        </Section>

        <Section title="4. Non-Refundable Situations">
          <p>We cannot process returns or refunds if:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The request is made after 24 hours of delivery</li>
            <li>The product has been consumed or used</li>
            <li>The issue is due to improper storage after delivery</li>
          </ul>
        </Section>

        <Section title="5. Contact Us">
          <p>For refund queries: <a href="mailto:support@vegfresh.in" className="text-primary hover:underline">support@vegfresh.in</a> or call <a href="tel:+919999999999" className="text-primary hover:underline">+91 99999 99999</a></p>
        </Section>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-bold text-lg text-text mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-gradient-to-br from-primary-dark to-primary py-12 text-center">
        <h1 className="font-heading font-bold text-3xl text-white mb-2">Terms & Conditions</h1>
        <p className="text-white/70 text-sm">Last updated: May 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Section title="1. Acceptance of Terms">
          <p>By accessing or using VegFresh, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </Section>

        <Section title="2. Use of Service">
          <p>You may use VegFresh for personal, non-commercial purposes only. You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create fake accounts or place fraudulent orders</li>
            <li>Misuse promotional offers or discounts</li>
            <li>Attempt to interfere with our platform's security or functionality</li>
          </ul>
        </Section>

        <Section title="3. Orders & Pricing">
          <p>All prices are in Indian Rupees (₹) and inclusive of applicable taxes. We reserve the right to change prices without prior notice. An order is confirmed only after you receive a confirmation notification.</p>
          <p>We reserve the right to cancel orders due to product unavailability, pricing errors, or suspected fraud, with a full refund where applicable.</p>
        </Section>

        <Section title="4. Payment">
          <p>We accept Cash on Delivery (COD) only. You agree to pay the exact amount shown at checkout when your order is delivered. Refusal to pay upon delivery may result in account suspension.</p>
        </Section>

        <Section title="5. Delivery">
          <p>We make every effort to deliver within the promised timeframe, but delivery times may vary due to weather, traffic, or other unforeseen circumstances. We are not liable for delays beyond our control.</p>
        </Section>

        <Section title="6. Limitation of Liability">
          <p>VegFresh's liability is limited to the value of the order in question. We are not liable for indirect or consequential damages arising from use of our services.</p>
        </Section>

        <Section title="7. Governing Law">
          <p>These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Hyderabad, Telangana.</p>
        </Section>

        <Section title="8. Contact">
          <p>For questions about these terms: <a href="mailto:legal@vegfresh.in" className="text-primary hover:underline">legal@vegfresh.in</a></p>
        </Section>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-bold text-lg text-text mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-gradient-to-br from-primary-dark to-primary py-12 text-center">
        <h1 className="font-heading font-bold text-3xl text-white mb-2">Privacy Policy</h1>
        <p className="text-white/70 text-sm">Last updated: May 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Section title="1. Information We Collect">
          <p>We collect information you provide when creating an account, placing orders, or contacting us. This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name, email address, phone number</li>
            <li>Delivery addresses</li>
            <li>Order history and preferences</li>
            <li>Device information and IP address</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and deliver your orders</li>
            <li>Send order confirmations and updates</li>
            <li>Improve our services and personalize your experience</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>We do not sell your personal data to third parties.</p>
        </Section>

        <Section title="3. Data Security">
          <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), secure password storage, and regular security audits. Your payment information is never stored on our servers — all transactions are Cash on Delivery.</p>
        </Section>

        <Section title="4. Cookies">
          <p>We use essential cookies to keep you logged in and remember your cart. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, though this may affect functionality.</p>
        </Section>

        <Section title="5. Your Rights">
          <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@vegfresh.in to exercise these rights. We will respond within 30 days.</p>
        </Section>

        <Section title="6. Contact">
          <p>For privacy-related questions, contact: <a href="mailto:privacy@vegfresh.in" className="text-primary hover:underline">privacy@vegfresh.in</a></p>
        </Section>
      </div>
    </motion.div>
  )
}

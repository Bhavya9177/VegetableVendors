import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-dark to-primary py-16 text-center">
        <h1 className="font-heading font-bold text-4xl text-white mb-3">About VegFresh</h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">
          From our farms to your table — the freshest vegetables and fruits delivered with love.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Our Story */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Our Story</span>
            <h2 className="font-heading font-bold text-2xl text-text mt-2 mb-4">
              Started with a Simple Idea
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              VegFresh was born in 2020 when our founders visited local farms and saw tonnes of fresh produce go to waste because of broken supply chains. We decided to bridge the gap between farmers and consumers — cutting out the middlemen and ensuring both sides benefit.
            </p>
            <p className="text-slate-600 leading-relaxed">
              What started as a small WhatsApp group with 50 customers has grown into a thriving platform serving 10,000+ happy families across the city — and we're just getting started.
            </p>
          </div>
          <div className="bg-primary-50 rounded-2xl p-8 text-center">
            <div className="text-7xl mb-4">🌾</div>
            <p className="text-primary font-heading font-bold text-lg">50+ Partner Farms</p>
            <p className="text-slate-500 text-sm mt-1">Directly sourced, zero middlemen</p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-heading font-bold text-lg text-text mb-2">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To make fresh, nutritious produce accessible and affordable for every household by directly connecting local farmers with city consumers — creating a fair, transparent, and sustainable food system.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-4xl mb-3">🔭</div>
            <h3 className="font-heading font-bold text-lg text-text mb-2">Our Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              A world where eating healthy is easy, affordable, and doesn't compromise the environment. We envision a network of thriving local farms supplying fresh food directly to every home.
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="font-heading font-bold text-2xl text-text mb-6 text-center">Why Choose VegFresh?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🌿', title: 'Freshness First', desc: 'Harvested the same morning, delivered the same day. No cold-storage chemicals.' },
              { icon: '🤝', title: 'Fair to Farmers', desc: 'We pay our farmers 30% more than wholesale markets — because they deserve it.' },
              { icon: '♻️', title: 'Eco-Friendly', desc: 'Minimal plastic packaging, biodegradable bags, and carbon-offset delivery.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-5xl mb-3">{icon}</div>
                <h3 className="font-heading font-semibold text-text mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary rounded-2xl p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { val: '10K+', label: 'Happy Customers' },
              { val: '50+', label: 'Partner Farms' },
              { val: '500+', label: 'Products' },
              { val: '4.8★', label: 'Average Rating' },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="font-heading font-bold text-3xl text-white">{val}</p>
                <p className="text-white/70 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  )
}

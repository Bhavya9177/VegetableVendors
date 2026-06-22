const features = [
  {
    icon: '🌱',
    title: 'Farm Fresh',
    desc: 'Directly sourced from verified local farms, harvested fresh every morning.',
  },
  {
    icon: '🚚',
    title: 'Same Day Delivery',
    desc: 'Order before noon and get your fresh produce delivered the same day.',
  },
  {
    icon: '✅',
    title: 'Quality Guaranteed',
    desc: 'Not happy with quality? We offer hassle-free returns within 24 hours.',
  },
  {
    icon: '💰',
    title: 'Best Prices',
    desc: 'Competitive pricing because we work directly with farmers — no middlemen.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="bg-primary-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="section-heading mb-2">Why Choose VegFresh?</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            We're not just a grocery store — we're your partner in healthy living.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-heading font-semibold text-base text-text mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

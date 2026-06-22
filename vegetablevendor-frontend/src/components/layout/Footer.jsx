import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
]

const policyLinks = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/refund-policy', label: 'Refund Policy' },
]

export default function Footer() {
  return (
    <footer className="bg-text text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-heading font-bold text-lg">VegFresh</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fresh vegetables and fruits delivered to your doorstep. Farm to table, every day.
            </p>
            <div className="flex gap-3 mt-4">
              {['Facebook', 'Instagram', 'Twitter'].map((s) => (
                <div key={s} className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                  <span className="text-xs font-bold">{s[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 text-sm hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-white">Policies</h4>
            <ul className="space-y-2">
              {policyLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 text-sm hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>123 Market Street, Fresh Town, IN 500001</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+919999999999" className="hover:text-primary transition-colors">+91 99999 99999</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:hello@vegfresh.in" className="hover:text-primary transition-colors">hello@vegfresh.in</a>
              </li>
              <li className="flex items-center gap-2">
                <span>🕐</span>
                <span>Mon–Sat: 8 AM – 8 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} VegFresh. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm">
            🌿 Fresh · Healthy · Delivered
          </p>
        </div>
      </div>
    </footer>
  )
}

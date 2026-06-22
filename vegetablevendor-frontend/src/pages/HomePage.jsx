import { motion } from 'framer-motion'
import HeroBanner from '../components/home/HeroBanner'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import WhyChooseUs from '../components/home/WhyChooseUs'

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyChooseUs />

      {/* Banner strip */}
      <section className="bg-primary py-8 my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-heading font-bold text-white text-2xl mb-2">
            🚚 Free Delivery on All Orders
          </p>
          <p className="text-white/80 text-sm">
            Cash on Delivery · No minimum order · Delivered fresh every morning
          </p>
        </div>
      </section>
    </motion.div>
  )
}

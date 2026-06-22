import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../api/cart'
import CartItem from '../components/cart/CartItem'
import { formatPrice } from '../utils/formatPrice'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'

export default function CartPage() {
  const { data: cart, isLoading } = useCart()

  if (isLoading) return <PageLoader />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
    >
      <h1 className="font-heading font-bold text-2xl text-text mb-6">Your Cart</h1>

      {!cart?.items?.length ? (
        <EmptyState
          icon="🛒"
          message="Your cart is empty"
          subMessage="Browse our fresh produce and add items to your cart."
          action={{ to: '/shop', label: 'Start Shopping' }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 card p-4 divide-y divide-gray-50">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit sticky top-20">
            <h2 className="font-heading font-semibold text-base mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-slate-600">
                  <span className="truncate mr-2">{item.product_name} × {item.quantity}</span>
                  <span className="shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary text-lg">{formatPrice(cart.total)}</span>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 text-center">🚚 Free delivery · Cash on Delivery</p>
            </div>
            <Link
              to="/checkout"
              className="btn-primary block text-center mt-4 py-3 rounded-xl text-base"
            >
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="block text-center text-sm text-slate-400 mt-3 hover:text-primary transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  )
}

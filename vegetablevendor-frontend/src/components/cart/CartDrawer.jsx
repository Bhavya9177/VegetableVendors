import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useCart } from '../../api/cart'
import CartItem from './CartItem'
import { formatPrice } from '../../utils/formatPrice'
import EmptyState from '../ui/EmptyState'
import Spinner from '../ui/Spinner'

export default function CartDrawer() {
  const { isOpen, closeCart } = useCartStore()
  const { data: cart, isLoading } = useCart()

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full" enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0" leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-sm bg-white flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <ShoppingBagIcon className="w-5 h-5 text-primary" />
                      <DialogTitle className="font-heading font-semibold text-base text-text">
                        Your Cart
                        {cart?.item_count > 0 && (
                          <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">
                            {cart.item_count}
                          </span>
                        )}
                      </DialogTitle>
                    </div>
                    <button
                      onClick={closeCart}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Spinner />
                      </div>
                    ) : !cart?.items?.length ? (
                      <EmptyState
                        icon="🛒"
                        message="Your cart is empty"
                        subMessage="Add some fresh produce to get started!"
                      />
                    ) : (
                      cart.items.map((item) => <CartItem key={item.id} item={item} />)
                    )}
                  </div>

                  {/* Footer */}
                  {cart?.items?.length > 0 && (
                    <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Subtotal</span>
                        <span className="font-heading font-bold text-lg text-primary">
                          {formatPrice(cart.total)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 text-center">
                        🚚 Free delivery on all orders
                      </p>
                      <Link
                        to="/checkout"
                        onClick={closeCart}
                        className="block w-full text-center btn-primary py-3 text-base rounded-xl"
                      >
                        Proceed to Checkout
                      </Link>
                      <Link
                        to="/cart"
                        onClick={closeCart}
                        className="block w-full text-center text-sm text-primary hover:underline"
                      >
                        View Full Cart
                      </Link>
                    </div>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

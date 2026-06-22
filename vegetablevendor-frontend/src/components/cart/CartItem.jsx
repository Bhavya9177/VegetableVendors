import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '../../utils/formatPrice'
import { useUpdateCartItem, useRemoveFromCart } from '../../api/cart'

export default function CartItem({ item }) {
  const { mutate: update, isPending: updating } = useUpdateCartItem()
  const { mutate: remove, isPending: removing } = useRemoveFromCart()

  const handleQty = (delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) {
      remove(item.product_id)
    } else {
      update({ product_id: item.product_id, quantity: newQty })
    }
  }

  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-primary-50">
        {item.product_image ? (
          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🥦</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-text truncate">{item.product_name}</p>
        <p className="text-xs text-slate-400">{formatPrice(item.unit_price)}/{item.unit}</p>
        <p className="text-primary font-semibold text-sm mt-1">{formatPrice(item.subtotal)}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => remove(item.product_id)}
          disabled={removing}
          className="text-slate-300 hover:text-red-400 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
          <button
            onClick={() => handleQty(-1)}
            disabled={updating || removing}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
          <button
            onClick={() => handleQty(1)}
            disabled={updating || removing}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

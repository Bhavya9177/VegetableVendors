import { useParams, Link } from 'react-router-dom'
import { useOrder } from '../api/orders'
import { formatPrice } from '../utils/formatPrice'
import { PageLoader } from '../components/ui/Spinner'

function InvoiceSkeleton() {
  return <PageLoader />
}

export default function InvoicePage() {
  const { id }                     = useParams()
  const { data: order, isLoading } = useOrder(id)

  if (isLoading) return <InvoiceSkeleton />

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Order not found.</p>
          <Link to="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    )
  }

  const subtotal      = order.subtotal_amount || order.total_amount || 0
  const deliveryFee   = order.delivery_fee || 0
  const discountAmt   = order.discount_amount || 0
  const issuedDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  }) : '—'

  return (
    <>
      {/* Print-control bar — hidden when printing */}
      <div className="no-print bg-slate-800 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/orders/${order.id}`} className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Back to Order
          </Link>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          🖨️ Print / Download PDF
        </button>
      </div>

      {/* Invoice document */}
      <div className="invoice-page bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-10 pb-8 border-b-2 border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base">V</span>
                </div>
                <h1 className="font-bold text-2xl text-gray-900">VegFresh</h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">Fresh Vegetables &amp; Fruits Delivered Daily</p>
              <p className="text-xs text-gray-400">support@vegfresh.in · +91 98765 43210</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800 tracking-tight">INVOICE</p>
              <p className="text-sm text-gray-500 mt-1">Order #{order.id}</p>
              <p className="text-xs text-gray-400 mt-0.5">Date: {issuedDate}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{order.status?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Billing / Delivery info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Deliver To</p>
              {order.address ? (
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p className="font-bold text-gray-900">{order.address.full_name}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{order.address.city}, {order.address.state}</p>
                  <p>PIN: {order.address.pincode}</p>
                  <p className="text-gray-500">Phone: {order.address.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Address not available</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Info</p>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="text-gray-400">Method:</span> <strong>Cash on Delivery</strong></p>
                <p><span className="text-gray-400">Status:</span> <span className="text-orange-600 font-semibold">Pay on Delivery</span></p>
                {order.delivery_window && (
                  <p><span className="text-gray-400">Est. Delivery:</span> {order.delivery_window}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Item</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items?.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-gray-400">per {item.unit}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatPrice(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(item.unit_price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery charges</span>
                {deliveryFee > 0
                  ? <span>{formatPrice(deliveryFee)}</span>
                  : <span className="text-green-600 font-semibold">FREE</span>
                }
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                  <span>-{formatPrice(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Taxes</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2 text-gray-900">
                <span>Amount Due (COD)</span>
                <span className="text-green-700">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* COD note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-10">
            <p className="text-sm font-semibold text-amber-800">💵 Cash on Delivery Order</p>
            <p className="text-xs text-amber-700 mt-1">
              Please keep <strong>{formatPrice(order.total_amount)}</strong> ready at the time of delivery.
              Our delivery executive will collect the payment at your door.
            </p>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order Notes</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-400">
              Thank you for choosing VegFresh! 🥦🍅 For queries, contact us at support@vegfresh.in
            </p>
            <p className="text-xs text-gray-300 mt-1">
              This is a computer-generated invoice. No signature required.
            </p>
          </div>
        </div>
      </div>

      {/* Print styles injected via a style tag */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .invoice-page { padding: 0; }
        }
      `}</style>
    </>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'
import { useCartStore } from '../store/cartStore'

export const useOrders = (params = {}) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.get('/orders', { params }).then((r) => r.data),
    refetchInterval: 8_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  })

const TERMINAL_STATUSES = ['delivered', 'cancelled']

export const useOrder = (id) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data.data),
    enabled: !!id,
    // Stop polling once order reaches a terminal state
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (TERMINAL_STATUSES.includes(status)) return false
      return 5_000
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  })

export const usePlaceOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) =>
      api.post('/orders', { data: payload }).then((r) => r.data.data),
    onSuccess: (order) => {
      // Seed the detail page cache immediately from the POST response
      qc.setQueryData(['order', String(order.id)], order)
      qc.invalidateQueries({ queryKey: ['orders'] })
      // Directly set empty cart instead of invalidating — invalidate triggers a
      // background refetch that can race with a subsequent add-to-cart and
      // overwrite the newly added items with the stale empty cart.
      qc.setQueryData(['cart'], { items: [], total: 0, item_count: 0 })
      toast.success('Order placed successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to place order')
    },
  })
}

export const useReorder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/orders/${id}/reorder`).then((r) => r.data),
    onSuccess: ({ data: cart, skipped }) => {
      qc.cancelQueries({ queryKey: ['cart'] })
      qc.setQueryData(['cart'], cart)
      useCartStore.getState().openCart()
      if (skipped?.length) {
        toast(`Cart updated — ${skipped.length} item(s) currently unavailable`, { icon: '⚠️' })
      } else {
        toast.success('Cart filled with your previous order!')
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to reorder')
    },
  })
}

export const useAdminOrders = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => api.get('/admin/orders', { params }).then((r) => r.data),
    retry: 1,
    ...options,
  })

export const useCancelOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      api.put(`/orders/${id}/cancel`).then((r) => r.data.data),
    onSuccess: (order) => {
      qc.setQueryData(['order', String(order.id)], order)
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to cancel order')
    },
  })
}

export const useRecordPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payment_reference }) =>
      api.put(`/admin/orders/${id}/payment`, { data: { payment_reference } }).then((r) => r.data.data),
    onSuccess: (order) => {
      qc.setQueryData(['order', String(order.id)], order)
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to record payment')
    },
  })
}

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) =>
      api.put(`/admin/orders/${id}`, { data: { status } }).then((r) => r.data.data),
    onSuccess: (order) => {
      // Update customer-facing cache so detail page reflects change immediately
      qc.setQueryData(['order', String(order.id)], order)
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order status updated')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update status')
    },
  })
}

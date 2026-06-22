import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export const useCart = () => {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data.data),
    enabled: !!token,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export const useAddToCart = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ product_id, quantity }) =>
      api.post('/cart/add', { data: { product_id, quantity } }).then((r) => r.data.data),
    onSuccess: (data) => {
      // Cancel any in-flight cart fetch so it doesn't overwrite our fresh data
      qc.cancelQueries({ queryKey: ['cart'] })
      qc.setQueryData(['cart'], data)
      toast.success('Added to cart!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to add to cart')
    },
  })
}

export const useUpdateCartItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ product_id, quantity }) =>
      api.put('/cart/update', { data: { product_id, quantity } }).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.cancelQueries({ queryKey: ['cart'] })
      qc.setQueryData(['cart'], data)
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update cart')
    },
  })
}

export const useRemoveFromCart = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (product_id) =>
      api.delete('/cart/remove', { data: { data: { product_id } } }).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.cancelQueries({ queryKey: ['cart'] })
      qc.setQueryData(['cart'], data)
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to remove item')
    },
  })
}

export const useClearCart = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.delete('/cart/clear').then((r) => r.data.data),
    onSuccess: (data) => {
      qc.cancelQueries({ queryKey: ['cart'] })
      qc.setQueryData(['cart'], data)
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useProductReviews = (productId) =>
  useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/products/${productId}/reviews`).then((r) => r.data.data),
    enabled: !!productId,
  })

export const useAddReview = (productId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.post(`/products/${productId}/reviews`, { data }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] })
      qc.invalidateQueries({ queryKey: ['product', productId] })
      toast.success('Review submitted!')
    },
    onError: (err) => toast.error(err.response?.data?.data || 'Failed to submit review'),
  })
}

export const useAdminReviews = (params = {}) =>
  useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: () => api.get('/admin/reviews', { params }).then((r) => r.data),
  })

export const useDeleteReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review removed')
    },
    onError: () => toast.error('Failed to remove review'),
  })
}

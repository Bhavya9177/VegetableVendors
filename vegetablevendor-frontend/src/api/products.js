import { useQuery } from '@tanstack/react-query'
import api from './axios'

export const useProducts = (filters = {}) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then((r) => r.data),
    staleTime: 60 * 1000,
  })

export const useProduct = (id) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })

export const useAdminProducts = (params = {}) =>
  useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => api.get('/admin/products', { params }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  })

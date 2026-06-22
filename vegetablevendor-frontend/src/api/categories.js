import { useQuery } from '@tanstack/react-query'
import api from './axios'

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

export const useAdminCategories = (params = {}) =>
  useQuery({
    queryKey: ['admin-categories', params],
    queryFn: () => api.get('/admin/categories', { params }).then((r) => r.data),
  })

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useAddresses = () =>
  useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses').then((r) => r.data.data),
  })

export const useCreateAddress = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.post('/addresses', { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address saved!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to save address')
    },
  })
}

export const useUpdateAddress = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/addresses/${id}`, { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update address')
    },
  })
}

export const useDeleteAddress = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/addresses/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address removed')
    },
  })
}

export const useSetDefaultAddress = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      api.put(`/addresses/${id}/default`).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

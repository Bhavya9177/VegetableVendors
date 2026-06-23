import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useOrderIssues = (orderId) =>
  useQuery({
    queryKey: ['order-issues', orderId],
    queryFn: () => api.get(`/orders/${orderId}/issues`).then((r) => r.data.data),
    enabled: !!orderId,
  })

export const useReportIssue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, issue_type, description }) =>
      api.post(`/orders/${orderId}/issues`, { data: { issue_type, description } }).then((r) => r.data.data),
    onSuccess: (issue) => {
      qc.invalidateQueries({ queryKey: ['order-issues', String(issue.order_id)] })
      toast.success('Issue reported — we will review it shortly.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to report issue')
    },
  })
}

export const useAdminIssues = (params = {}) =>
  useQuery({
    queryKey: ['admin-issues', params],
    queryFn: () => api.get('/admin/issues', { params }).then((r) => r.data),
    refetchOnWindowFocus: true,
  })

export const useResolveIssue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resolution_type, resolution_notes }) =>
      api.put(`/admin/issues/${id}/resolve`, { data: { resolution_type, resolution_notes } }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-issues'] })
      toast.success('Issue resolved')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to resolve issue')
    },
  })
}

export const useUpdateIssueStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) =>
      api.put(`/admin/issues/${id}`, { data: { status } }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-issues'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update issue')
    },
  })
}

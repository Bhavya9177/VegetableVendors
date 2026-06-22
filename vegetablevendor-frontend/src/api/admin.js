import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useUploadImage = () =>
  useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return api
        .post('/admin/upload-image', formData, { headers: { 'Content-Type': undefined } })
        .then((r) => r.data.data.url)
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Image upload failed')
    },
  })

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data),
  })

export const useAdminUsers = (params = {}) =>
  useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => api.get('/admin/users', { params }).then((r) => r.data),
  })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.post('/admin/products', { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to create product')
    },
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/admin/products/${id}`, { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update product')
    },
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/admin/proaducts/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to delete product')
    },
  })
}

export const useCreateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.post('/admin/categories', { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to create category')
    },
  })
}

export const useUpdateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/admin/categories/${id}`, { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update category')
    },
  })
}

export const useDeleteCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/admin/categories/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to delete category')
    },
  })
}

export const useInventoryAnalysis = () =>
  useQuery({
    queryKey: ['inventory-analysis'],
    queryFn: () => api.get('/admin/inventory/analysis').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

export const useRunRefillCheck = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/admin/inventory/analysis').then((r) => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['inventory-analysis'] })
      qc.invalidateQueries({ queryKey: ['refill-logs'] })
      if (res.data?.whatsapp_error) {
        toast.error(res.data?.message || 'WhatsApp alert failed — check your access token in Meta Business Manager')
      } else {
        toast.success(res.data?.message || 'Refill check complete')
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Refill check failed')
    },
  })
}

export const useRefillProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, qty }) =>
      api.post(`/admin/inventory/refill/${id}`, { data: { qty } }).then((r) => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory-analysis'] })
      // res.message and res.whatsapp_error are top-level (not nested in res.data)
      if (res.whatsapp_error) {
        toast.success(res.message || 'Stock refilled!')
        toast.error('WhatsApp alert failed — check your access token in Meta Business Manager')
      } else {
        toast.success(res.message || 'Stock refilled and WhatsApp alert sent to admin!')
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to refill stock')
    },
  })
}

export const useRefillLogs = (params = {}) =>
  useQuery({
    queryKey: ['refill-logs', params],
    queryFn: () => api.get('/admin/inventory/refill-logs', { params }).then((r) => r.data),
    staleTime: 60 * 1000,
  })

export const useWhatsAppTokenStatus = () =>
  useQuery({
    queryKey: ['whatsapp-token-status'],
    queryFn: () => api.get('/admin/whatsapp/token-status').then((r) => r.data),
    staleTime: 30 * 1000,
  })

export const useRefreshWhatsAppToken = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/admin/whatsapp/refresh-token').then((r) => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['whatsapp-token-status'] })
      toast.success(res.message || 'WhatsApp token refreshed!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Token refresh failed')
    },
  })
}

export const useTestWhatsApp = () =>
  useMutation({
    mutationFn: () => api.post('/admin/whatsapp/test-send').then((r) => r.data),
    onSuccess: (res) => toast.success(res.message || 'Test message sent! Check your WhatsApp.'),
    onError:   (err) => toast.error(err.response?.data?.data || 'Test send failed'),
  })

// ── Coupons ──────────────────────────────────────────────────────────────────

export const useAdminCoupons = (params = {}) =>
  useQuery({
    queryKey: ['admin-coupons', params],
    queryFn: () => api.get('/admin/coupons', { params }).then((r) => r.data),
  })

export const useCreateCoupon = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.post('/admin/coupons', { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon created!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to create coupon')
    },
  })
}

export const useUpdateCoupon = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/admin/coupons/${id}`, { data }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update coupon')
    },
  })
}

export const useDeleteCoupon = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/admin/coupons/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to delete coupon')
    },
  })
}

// ── Settings ─────────────────────────────────────────────────────────────────

export const useSettings = () =>
  useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings').then((r) => r.data.data),
    staleTime: 60 * 1000,
  })

export const useUpdateSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.put('/admin/settings', { data }).then((r) => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success(res.message || 'Settings saved!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to save settings')
    },
  })
}

export const useContactMessages = (params = {}) =>
  useQuery({
    queryKey: ['contact-messages', params],
    queryFn: () => api.get('/admin/contact-messages', { params }).then((r) => r.data),
  })

export const useMarkContactMessageRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.put(`/admin/contact-messages/${id}`, {}).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact-messages'] }),
  })
}

export const useDeleteContactMessage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/contact-messages/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-messages'] })
      toast.success('Message deleted')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to delete message')
    },
  })
}

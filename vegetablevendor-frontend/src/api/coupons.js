import { useMutation } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useApplyCoupon = () =>
  useMutation({
    mutationFn: ({ coupon_code, subtotal }) =>
      api.post('/coupons/apply', { data: { coupon_code, subtotal } }).then((r) => r.data.data),
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Invalid coupon code')
    },
  })

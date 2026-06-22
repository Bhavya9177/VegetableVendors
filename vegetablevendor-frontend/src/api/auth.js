import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from './axios'
import { useAuthStore } from '../store/authStore'

export const loginUser = (data) =>
  api.post('/login', { data }).then((r) => r.data)

export const registerUser = (data) =>
  api.post('/register', { data }).then((r) => r.data)

export const getUserInfo = () =>
  api.get('/me/info').then((r) => r.data.data)

export const useUpdateProfile = () => {
  const login = useAuthStore((s) => s.login)
  const token = useAuthStore((s) => s.token)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      api.put('/me/profile', { data }).then((r) => r.data.data),
    onSuccess: (updatedUser) => {
      login(token, updatedUser)
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.data || 'Failed to update profile')
    },
  })
}

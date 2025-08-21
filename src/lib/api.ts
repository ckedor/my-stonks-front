import type { InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import Cookies from 'js-cookie'
import qs from 'qs'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('token')

  if (token) {
    config.headers.set?.('Authorization', `Bearer ${token}`)
  }

  return config
})

export const loginRequest = async (username: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await api.post('/auth/jwt/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return response.data
}

export default api

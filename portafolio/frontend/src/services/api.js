import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_CURRICULUM_API_URL || '/api',
  timeout: 15000,
})

export const getCV = () => api.get('/cv/').then(r => r.data)

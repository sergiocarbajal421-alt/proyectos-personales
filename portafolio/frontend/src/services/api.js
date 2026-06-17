import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_CURRICULUM_API_URL || '/api',
  timeout: 60000,
})

const delay = ms => new Promise(res => setTimeout(res, ms))

export const getCV = async (retries = 4, wait = 4000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await api.get('/cv/')
      return r.data
    } catch (err) {
      if (i < retries - 1) await delay(wait)
      else throw err
    }
  }
}

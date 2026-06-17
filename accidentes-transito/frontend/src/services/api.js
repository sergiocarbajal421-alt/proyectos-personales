import axios from 'axios'

const BASE = import.meta.env.VITE_ACCIDENTES_API_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 60000 })

const delay = ms => new Promise(res => setTimeout(res, ms))

const withRetry = (fn, retries = 4, wait = 4000) => async (...args) => {
  for (let i = 0; i < retries; i++) {
    try { return await fn(...args) }
    catch (err) { if (i < retries - 1) await delay(wait); else throw err }
  }
}

export const getAccidentes = withRetry((params = {}) =>
  api.get('/accidentes/', { params }).then(r => r.data))

export const getKPIs = withRetry((params = {}) =>
  api.get('/accidentes/kpis', { params }).then(r => r.data))

export const getFiltros = withRetry(() =>
  api.get('/accidentes/filtros').then(r => r.data))

export const getPorDepartamento = withRetry((params = {}) =>
  api.get('/accidentes/por-departamento', { params }).then(r => r.data))

export const getPorModalidad = withRetry((params = {}) =>
  api.get('/accidentes/por-modalidad', { params }).then(r => r.data))

export const getPorMes = withRetry((params = {}) =>
  api.get('/accidentes/por-mes', { params }).then(r => r.data))

export const getPorHora = withRetry((params = {}) =>
  api.get('/accidentes/por-hora', { params }).then(r => r.data))

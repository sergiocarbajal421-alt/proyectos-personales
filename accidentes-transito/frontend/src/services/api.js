import axios from 'axios'

const BASE = import.meta.env.VITE_ACCIDENTES_API_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 30000 })

export const getAccidentes = (params = {}) =>
  api.get('/accidentes/', { params }).then(r => r.data)

export const getKPIs = (params = {}) =>
  api.get('/accidentes/kpis', { params }).then(r => r.data)

export const getFiltros = () =>
  api.get('/accidentes/filtros').then(r => r.data)

export const getPorDepartamento = (params = {}) =>
  api.get('/accidentes/por-departamento', { params }).then(r => r.data)

export const getPorModalidad = (params = {}) =>
  api.get('/accidentes/por-modalidad', { params }).then(r => r.data)

export const getPorMes = (params = {}) =>
  api.get('/accidentes/por-mes', { params }).then(r => r.data)

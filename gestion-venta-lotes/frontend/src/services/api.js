import axios from 'axios'

const BASE = import.meta.env.VITE_GESTION_API_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 15000 })

// ── Lotes ─────────────────────────────────────────────────────────────────────
export const getLotes = (params = {}) =>
  api.get('/lotes/', { params }).then(r => r.data)

export const getResumen = () =>
  api.get('/lotes/resumen').then(r => r.data)

export const registrarVenta = (data) =>
  api.post('/lotes/venta', data).then(r => r.data)

// ── Letras ────────────────────────────────────────────────────────────────────
export const getLetras = (lote) =>
  api.get(`/letras/${lote}`).then(r => r.data)

export const actualizarLetra = (lote, numero, estado) =>
  api.patch(`/letras/${lote}/${numero}`, { estado }).then(r => r.data)

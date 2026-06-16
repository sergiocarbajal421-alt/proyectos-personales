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

export const actualizarLetra = (lote, numero, estado, fecha_pago_real = null) =>
  api.patch(`/letras/${lote}/${numero}`, { estado, ...(fecha_pago_real && { fecha_pago_real }) }).then(r => r.data)

// ── Extras (post-migración v2) ────────────────────────────────────────────────
export const getPagosAdicionales = (lote) =>
  api.get(`/pagos-adicionales/${lote}`).then(r => r.data)

export const getDocumentos = (lote) =>
  api.get(`/documentos/${lote}`).then(r => r.data)

export const getTodosDocumentos = (params = {}) =>
  api.get('/documentos', { params }).then(r => r.data)

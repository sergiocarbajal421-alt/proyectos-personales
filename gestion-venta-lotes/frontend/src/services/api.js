import axios from 'axios'

const BASE = import.meta.env.VITE_GESTION_API_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 60000 })

const delay = ms => new Promise(res => setTimeout(res, ms))

const withRetry = (fn, retries = 4, wait = 4000) => async (...args) => {
  for (let i = 0; i < retries; i++) {
    try { return await fn(...args) }
    catch (err) { if (i < retries - 1) await delay(wait); else throw err }
  }
}

// ── Lotes ─────────────────────────────────────────────────────────────────────
export const getLotes = withRetry((params = {}) =>
  api.get('/lotes/', { params }).then(r => r.data))

export const getResumen = withRetry(() =>
  api.get('/lotes/resumen').then(r => r.data))

export const registrarVenta = (data) =>
  api.post('/lotes/venta', data).then(r => r.data)

// ── Letras ────────────────────────────────────────────────────────────────────
export const getLetras = withRetry((lote) =>
  api.get(`/letras/${lote}`).then(r => r.data))

export const actualizarLetra = (lote, numero, estado, fecha_pago_real = null) =>
  api.patch(`/letras/${lote}/${numero}`, { estado, ...(fecha_pago_real && { fecha_pago_real }) }).then(r => r.data)

// ── Extras (post-migración v2) ────────────────────────────────────────────────
export const getPagosAdicionales = withRetry((lote) =>
  api.get(`/pagos-adicionales/${lote}`).then(r => r.data))

export const getDocumentos = withRetry((lote) =>
  api.get(`/documentos/${lote}`).then(r => r.data))

export const getTodosDocumentos = withRetry((params = {}) =>
  api.get('/documentos', { params }).then(r => r.data))

import { useEffect, useState } from 'react'
import { getLetras, actualizarLetra } from '../services/api'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n ?? 0)

export default function LetrasPanel({ loteSeleccionado, resumenLote }) {
  const [letras, setLetras]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loteSeleccionado) { setLetras([]); return }
    setLoading(true)
    getLetras(loteSeleccionado)
      .then(setLetras)
      .catch(() => toast.error('Error al cargar letras'))
      .finally(() => setLoading(false))
  }, [loteSeleccionado])

  const toggleEstado = async (letra) => {
    const nuevoEstado = letra.estado === 'Pagado' ? 'Pendiente' : 'Pagado'
    try {
      await actualizarLetra(loteSeleccionado, letra.numero_letra, nuevoEstado)
      setLetras(prev => prev.map(l =>
        l.numero_letra === letra.numero_letra ? { ...l, estado: nuevoEstado } : l
      ))
      toast.success(`Letra #${letra.numero_letra} → ${nuevoEstado}`)
    } catch {
      toast.error('Error al actualizar letra')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (!loteSeleccionado) {
    return (
      <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        <p>Selecciona un lote vendido para ver sus letras</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
        💰 Letras — Lote {loteSeleccionado}
      </h2>

      {resumenLote && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            ['Total', resumenLote.monto_letras, '#2563eb'],
            ['Pagado', resumenLote.monto_pagado, '#16a34a'],
            ['Pendiente', resumenLote.monto_pendiente, '#d97706'],
            ['Vencido', resumenLote.monto_atrasado, '#dc2626'],
          ].map(([k, v, c]) => (
            <div key={k} style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 12px', borderLeft: `3px solid ${c}` }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{k}</div>
              <div style={{ fontWeight: 700, color: c }}>{fmt(v)}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="letras-list">
          {letras.map(l => {
            const atrasado = l.estado === 'Pendiente' && l.fecha_pago < today
            return (
              <div key={l.numero_letra} className={`letra-item ${l.estado === 'Pagado' ? 'pagado' : atrasado ? 'atrasado' : ''}`}>
                <div>
                  <strong>#{l.numero_letra}</strong>
                  <span style={{ marginLeft: 8, color: '#64748b' }}>{l.fecha_pago}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600 }}>{fmt(l.monto)}</span>
                  <button
                    className={`btn btn-sm ${l.estado === 'Pagado' ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => toggleEstado(l)}
                  >
                    {l.estado === 'Pagado' ? '↩ Revertir' : '✓ Pagar'}
                  </button>
                </div>
              </div>
            )
          })}
          {letras.length === 0 && (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>Sin letras registradas</p>
          )}
        </div>
      )}
    </div>
  )
}

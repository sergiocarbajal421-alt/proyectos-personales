import { useEffect, useState } from 'react'
import { getLetras, actualizarLetra, getPagosAdicionales, getDocumentos } from '../services/api'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { ReceiptText, X, Check, RotateCcw, Calendar, FileText, PlusCircle, AlertCircle } from 'lucide-react'

const fmt = n =>
  new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(n ?? 0)

const fmtDate = d => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const M = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${parseInt(day)} ${M[parseInt(m)]} ${y}`
}

const DOC_COLORS = {
  Completado: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'En proceso': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Pendiente:  { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
}

export default function LetrasPanel({ loteSeleccionado, resumenLote, onClose, onRefresh }) {
  const [letras,   setLetras]   = useState([])
  const [docs,     setDocs]     = useState([])
  const [pagosAd,  setPagosAd]  = useState([])
  const [tab,      setTab]      = useState('cuotas')  // cuotas | docs | pagos
  const [loading,  setLoading]  = useState(false)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (!loteSeleccionado) { setLetras([]); setDocs([]); setPagosAd([]); return }
    setLoading(true)
    Promise.all([
      getLetras(loteSeleccionado),
      getDocumentos(loteSeleccionado).catch(() => []),
      getPagosAdicionales(loteSeleccionado).catch(() => []),
    ])
      .then(([l, d, p]) => { setLetras(l); setDocs(d); setPagosAd(p) })
      .catch(() => toast.error('Error al cargar cuotas'))
      .finally(() => setLoading(false))
  }, [loteSeleccionado])

  const toggle = async (letra) => {
    const nuevo = letra.estado === 'Pagado' ? 'Pendiente' : 'Pagado'
    setUpdating(letra.numero_letra)
    try {
      await actualizarLetra(loteSeleccionado, letra.numero_letra, nuevo)
      setLetras(prev => prev.map(l =>
        l.numero_letra === letra.numero_letra ? { ...l, estado: nuevo } : l
      ))
      if (nuevo === 'Pagado') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#16a34a', '#2563eb', '#7c3aed', '#f59e0b'],
          scalar: 0.9,
        })
        toast.success(`🎉 Cuota #${letra.numero_letra} marcada como pagada`, { duration: 2500 })
      } else {
        toast.success(`Cuota #${letra.numero_letra} revertida a pendiente`, { duration: 2000 })
      }
      onRefresh?.(true)
    } catch {
      toast.error('Error al actualizar cuota')
    } finally {
      setUpdating(null)
    }
  }

  const today    = new Date().toISOString().split('T')[0]
  const pagadas  = letras.filter(l => l.estado === 'Pagado').length
  const total    = letras.length
  const pct      = total > 0 ? (pagadas / total) * 100 : 0

  /* Empty */
  if (!loteSeleccionado) {
    return (
      <div className="card" style={{ display:'flex', flexDirection:'column' }}>
        <div className="card-header">
          <div className="card-title"><ReceiptText size={14} /> Cuotas</div>
        </div>
        <div className="panel-empty">
          <ReceiptText size={42} />
          <h3>Selecciona un lote</h3>
          <p>Haz clic en cualquier fila de la<br />tabla para ver sus cuotas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
      {/* Header */}
      <div className="card-header">
        <div>
          <div className="card-title">
            <ReceiptText size={14} />
            Lote {loteSeleccionado}
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:2, fontWeight:500 }}>
            {resumenLote?.cliente || '—'}
          </div>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={onClose} title="Cerrar">
          <X size={13} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display:'flex', gap:2, padding:'8px 12px 0',
        borderBottom:'1px solid var(--border)', background:'#fafafa',
      }}>
        {[
          { id:'cuotas', label:'Cuotas', Icon: ReceiptText },
          { id:'docs',   label:`Docs${docs.length ? ` (${docs.length})` : ''}`,  Icon: FileText },
          { id:'pagos',  label:`Extras${pagosAd.length ? ` (${pagosAd.length})` : ''}`, Icon: PlusCircle },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'5px 10px', border:'none', cursor:'pointer',
            background: tab===id ? 'white' : 'transparent',
            borderRadius:'6px 6px 0 0',
            borderBottom: tab===id ? '2px solid var(--primary)' : '2px solid transparent',
            color: tab===id ? 'var(--primary)' : 'var(--muted)',
            fontSize:11, fontWeight: tab===id ? 700 : 500,
            fontFamily:'inherit',
          }}>
            <Icon size={11}/> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="panel-empty"><div className="spinner" /></div>
      ) : (
        <>
          {/* Summary */}
          {resumenLote && tab === 'cuotas' && (
            <div className="letras-summary">
              {[
                { l:'Total letras',   v:fmt(resumenLote.monto_letras),    c:'sv-blue'  },
                { l:'Cobrado',        v:fmt(resumenLote.monto_pagado),    c:'sv-green' },
                { l:'Pendiente',      v:fmt(resumenLote.monto_pendiente), c:'sv-amber' },
                { l:'Vencido',        v:fmt(resumenLote.monto_atrasado),  c:'sv-red'   },
              ].map(({ l, v, c }) => (
                <div key={l} className="suma-box">
                  <div className="suma-label">{l}</div>
                  <div className={`suma-val ${c}`}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Progress — solo en tab cuotas */}
          {total > 0 && tab === 'cuotas' && (
            <div className="progress-section">
              <div className="progress-meta">
                <span>{pagadas} de {total} cuotas pagadas</span>
                <span style={{ color:'var(--success)', fontWeight:700 }}>{Math.round(pct)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width:`${pct}%` }} />
              </div>
            </div>
          )}

          {/* ── TAB: Cuotas ── */}
          {tab === 'cuotas' && (
            <div className="letras-list">
              {letras.map(l => {
                const vencida = l.estado === 'Pendiente' && l.fecha_pago < today
                const pagado  = l.estado === 'Pagado'
                const isUpd   = updating === l.numero_letra
                return (
                  <div key={l.numero_letra} className={`letra-row ${pagado ? 'l-pagado' : vencida ? 'l-vencida' : ''}`}>
                    <div className={`letra-num ${pagado ? 'n-pagado' : vencida ? 'n-vencida' : ''}`}>
                      {pagado ? <Check size={12} strokeWidth={3} /> : l.numero_letra}
                    </div>
                    <div className="letra-body">
                      <div className="letra-fecha">
                        <Calendar size={10} style={{ marginRight:3, verticalAlign:'middle' }} />
                        {fmtDate(l.fecha_pago)}
                        {pagado && l.fecha_pago_real && (
                          <span style={{ color:'var(--success)', marginLeft:6 }}>
                            · pagada {fmtDate(l.fecha_pago_real)}
                          </span>
                        )}
                      </div>
                      <div className="letra-monto">{fmt(l.monto)}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                      <span className={`pill ${pagado ? 'pagado' : vencida ? 'vencida' : 'pendiente'}`} style={{ fontSize:9 }}>
                        <span className="pill-dot" />
                        {pagado ? 'Pagado' : vencida ? 'Vencida' : 'Pendiente'}
                      </span>
                      <button className={`btn btn-xs ${pagado ? 'btn-ghost' : 'btn-success'}`}
                        onClick={() => toggle(l)} disabled={isUpd} style={{ minWidth:54, padding:'2px 7px', fontSize:10 }}>
                        {isUpd ? '...' : pagado
                          ? <><RotateCcw size={9}/> Revertir</>
                          : <><Check size={9}/> Pagar</>}
                      </button>
                    </div>
                  </div>
                )
              })}
              {letras.length === 0 && (
                <div className="panel-empty" style={{ padding:'32px 0' }}>
                  <p>Sin cuotas registradas</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Documentos ── */}
          {tab === 'docs' && (
            <div className="letras-list">
              {docs.length === 0 ? (
                <div className="panel-empty" style={{ padding:'32px 0' }}>
                  <FileText size={32} style={{ color:'#e2e8f0' }} />
                  <p style={{ marginTop:8 }}>Sin documentos registrados</p>
                  <p style={{ fontSize:11, color:'var(--dim)' }}>Ejecuta la migración v2 para activar</p>
                </div>
              ) : docs.map(d => {
                const s = DOC_COLORS[d.estado] || DOC_COLORS.Pendiente
                return (
                  <div key={d.id} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'10px 12px', borderRadius:8, border:`1px solid ${s.border}`,
                    background: s.bg, marginBottom:4,
                  }}>
                    <FileText size={14} style={{ color: s.color, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{d.tipo}</div>
                      {d.fecha_emision && (
                        <div style={{ fontSize:10, color:'var(--muted)', marginTop:1 }}>
                          {fmtDate(d.fecha_emision)}
                        </div>
                      )}
                      {d.observaciones && (
                        <div style={{ fontSize:10, color:'var(--muted)', marginTop:1 }}>{d.observaciones}</div>
                      )}
                    </div>
                    <span style={{
                      fontSize:10, fontWeight:700, padding:'2px 8px',
                      borderRadius:99, background: s.bg, color: s.color,
                      border:`1px solid ${s.border}`,
                    }}>{d.estado}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── TAB: Pagos adicionales ── */}
          {tab === 'pagos' && (
            <div className="letras-list">
              {pagosAd.length === 0 ? (
                <div className="panel-empty" style={{ padding:'32px 0' }}>
                  <PlusCircle size={32} style={{ color:'#e2e8f0' }} />
                  <p style={{ marginTop:8 }}>Sin pagos adicionales</p>
                  <p style={{ fontSize:11, color:'var(--dim)' }}>Ejecuta la migración v2 para activar</p>
                </div>
              ) : pagosAd.map(p => {
                const colorMap = {
                  'Abono capital':         { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
                  'Mora':                  { bg:'#fef2f2', color:'#dc2626', border:'#fecaca' },
                  'Gastos administrativos':{ bg:'#fafafa', color:'#64748b', border:'#e2e8f0' },
                }
                const s = colorMap[p.tipo] || colorMap['Gastos administrativos']
                return (
                  <div key={p.id} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'9px 12px', borderRadius:8,
                    border:`1px solid ${s.border}`, background:s.bg, marginBottom:4,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{p.concepto}</div>
                      <div style={{ fontSize:10, color:'var(--muted)', marginTop:1 }}>{fmtDate(p.fecha)}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:13, fontWeight:800, color: s.color }}>{fmt(p.monto)}</div>
                      <div style={{ fontSize:9, color:'var(--dim)', marginTop:1 }}>{p.tipo}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

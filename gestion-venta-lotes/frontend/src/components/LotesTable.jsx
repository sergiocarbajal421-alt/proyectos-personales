import { useState } from 'react'
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react'

const fmt = n =>
  new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(n ?? 0)

const PILL_LABELS = { Atrasado: 'Vendido · Atraso' }

function Pill({ estado }) {
  return (
    <span className={`pill ${estado.toLowerCase()}`}>
      <span className="pill-dot" />
      {PILL_LABELS[estado] ?? estado}
    </span>
  )
}

export default function LotesTable({ lotes, onSelectLote, onNuevaVenta, loteSeleccionado, fullWidth, fillHeight }) {
  const [filtroEstado,   setFiltroEstado]   = useState('')
  const [filtroManzana,  setFiltroManzana]  = useState('')
  const [filtroCliente,  setFiltroCliente]  = useState('')

  const manzanas = [...new Set(lotes.map(l => l.manzana).filter(Boolean))].sort()

  const filtered = lotes.filter(l => {
    const atrasado    = l.monto_atrasado > 0
    const estadoReal  = atrasado ? 'Atrasado' : l.estado
    if (filtroEstado  && estadoReal !== filtroEstado)  return false
    if (filtroManzana && l.manzana  !== filtroManzana) return false
    if (filtroCliente && !l.cliente?.toLowerCase().includes(filtroCliente.toLowerCase())) return false
    return true
  })

  const vendidos    = lotes.filter(l => l.estado === 'Vendido').length
  const disponibles = lotes.filter(l => l.estado === 'Disponible').length
  const atrasados   = lotes.filter(l => l.monto_atrasado > 0).length

  return (
    <div className={`card${fillHeight ? ' card-fill' : ''}`}>
      {/* Header */}
      <div className="card-header">
        <div>
          <div className="card-title">
            Cartera de Lotes
            <span className="card-badge">{lotes.length}</span>
          </div>
          <div className="card-subtitle">
            <span><strong style={{color:'var(--primary)'}}>{vendidos}</strong> vendidos</span>
            <span><strong style={{color:'var(--success)'}}>{disponibles}</strong> disponibles</span>
            {atrasados > 0 && (
              <span><strong style={{color:'var(--danger)'}}>{atrasados}</strong> con atraso</span>
            )}
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onNuevaVenta}>
          + Registrar Venta
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <SlidersHorizontal size={13} style={{ color:'var(--dim)', flexShrink:0 }} />
        <select className="f-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Vendido">Vendido</option>
          <option value="Atrasado">Vendido · Atraso</option>
        </select>
        <select className="f-select" value={filtroManzana} onChange={e => setFiltroManzana(e.target.value)}>
          <option value="">Todas las manzanas</option>
          {manzanas.map(m => <option key={m} value={m}>Manzana {m}</option>)}
        </select>
        <div className="search-wrap">
          <Search size={12} />
          <input
            className="f-input"
            placeholder="Buscar cliente..."
            value={filtroCliente}
            onChange={e => setFiltroCliente(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lote</th>
              <th>Estado</th>
              <th>Área</th>
              <th>Cliente</th>
              <th>Contrato</th>
              <th>Precio</th>
              <th>Pagado</th>
              <th>Pendiente</th>
              <th>Vencido</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const atrasado  = l.monto_atrasado > 0
              const estadoPill = atrasado ? 'Atrasado' : l.estado
              const selected  = loteSeleccionado === l.lote
              const rowCls    = atrasado ? 'row-late' : l.estado === 'Vendido' ? 'row-sold' : 'row-avail'
              const clickable = l.estado === 'Vendido'

              return (
                <tr
                  key={l.lote}
                  className={`${rowCls} ${selected ? 'row-selected' : ''} ${clickable ? 'row-clickable' : ''}`}
                  onClick={() => clickable && onSelectLote(l.lote)}
                >
                  <td>
                    <div className="lote-id">
                      {l.lote}
                      <span className="manzana-tag">{l.manzana}</span>
                    </div>
                    {l.tipo_lote && l.tipo_lote !== 'Intermedio' && (
                      <div style={{ fontSize:10, color:'var(--primary)', fontWeight:600, marginTop:2 }}>
                        {l.tipo_lote}
                      </div>
                    )}
                  </td>
                  <td><Pill estado={estadoPill} /></td>
                  <td>
                    <span style={{ color:'var(--muted)', fontWeight:500, whiteSpace:'nowrap' }}>
                      {l.area ? `${l.area} m²` : '—'}
                    </span>
                  </td>
                  <td>
                    {l.cliente
                      ? <span style={{ fontWeight:600, color:'var(--text)' }}>{l.cliente}</span>
                      : <span style={{ color:'var(--dim)' }}>—</span>
                    }
                  </td>
                  <td>
                    <span style={{ color:'var(--muted)', fontSize:12 }}>{l.fecha_contrato ?? '—'}</span>
                  </td>
                  <td>
                    <span className={`amt ${l.precio > 0 ? 'amt-blue' : 'amt-muted'}`}>
                      {l.precio > 0 ? fmt(l.precio) : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`amt ${l.monto_pagado > 0 ? 'amt-green' : 'amt-muted'}`}>
                      {fmt(l.monto_pagado)}
                    </span>
                  </td>
                  <td>
                    <span className={`amt ${l.monto_pendiente > 0 ? 'amt-amber' : 'amt-muted'}`}>
                      {fmt(l.monto_pendiente)}
                    </span>
                  </td>
                  <td>
                    <span className={`amt ${l.monto_atrasado > 0 ? 'amt-red' : 'amt-muted'}`}>
                      {l.monto_atrasado > 0 ? fmt(l.monto_atrasado) : '—'}
                    </span>
                  </td>
                  <td>
                    {clickable && (
                      <ChevronRight
                        size={15}
                        className={`chevron-icon ${selected ? 'active' : ''}`}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="table-empty">
                  Sin resultados para los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

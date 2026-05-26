import { useState } from 'react'

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n ?? 0)

function Badge({ estado }) {
  return <span className={`badge ${estado?.toLowerCase()}`}>{estado}</span>
}

export default function LotesTable({ lotes, onSelectLote, onNuevaVenta }) {
  const [filtroEstado,   setFiltroEstado]   = useState('')
  const [filtroManzana,  setFiltroManzana]  = useState('')
  const [filtroCliente,  setFiltroCliente]  = useState('')

  const manzanas = [...new Set(lotes.map(l => l.manzana).filter(Boolean))].sort()

  const filtered = lotes.filter(l => {
    if (filtroEstado  && l.estado   !== filtroEstado)                          return false
    if (filtroManzana && l.manzana  !== filtroManzana)                         return false
    if (filtroCliente && !l.cliente?.toLowerCase().includes(filtroCliente.toLowerCase())) return false
    return true
  })

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>🏡 Lotes</h2>
        <button className="btn btn-primary" onClick={onNuevaVenta}>
          ➕ Registrar Venta
        </button>
      </div>

      <div className="filters">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Vendido">Vendido</option>
        </select>
        <select value={filtroManzana} onChange={e => setFiltroManzana(e.target.value)}>
          <option value="">Todas las manzanas</option>
          {manzanas.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          placeholder="Buscar cliente..."
          value={filtroCliente}
          onChange={e => setFiltroCliente(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Lote</th>
              <th>Estado</th>
              <th>Área m²</th>
              <th>Cliente</th>
              <th>Fecha Contrato</th>
              <th>Precio</th>
              <th>Pagado</th>
              <th>Pendiente</th>
              <th>Atrasado</th>
              <th>Letras</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr
                key={l.lote}
                className={l.monto_atrasado > 0 ? 'atrasado' : l.estado === 'Vendido' ? 'vendido' : ''}
              >
                <td><strong>{l.lote}</strong></td>
                <td><Badge estado={l.estado} /></td>
                <td>{l.area ?? '—'}</td>
                <td>{l.cliente ?? '—'}</td>
                <td>{l.fecha_contrato ?? '—'}</td>
                <td>{l.precio > 0 ? fmt(l.precio) : '—'}</td>
                <td>{fmt(l.monto_pagado)}</td>
                <td>{fmt(l.monto_pendiente)}</td>
                <td style={{ color: l.monto_atrasado > 0 ? '#dc2626' : 'inherit', fontWeight: l.monto_atrasado > 0 ? 700 : 400 }}>
                  {fmt(l.monto_atrasado)}
                </td>
                <td>
                  {l.estado === 'Vendido' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectLote(l.lote)}
                    >
                      Ver
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

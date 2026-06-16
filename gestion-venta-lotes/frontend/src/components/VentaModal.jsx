import { useState } from 'react'
import { registrarVenta } from '../services/api'
import toast from 'react-hot-toast'
import { X, Building2, User, CreditCard, CheckCircle2 } from 'lucide-react'

const fmtCur = n =>
  new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(n ?? 0)

export default function VentaModal({ lotes, onClose, onSuccess }) {
  const disponibles = lotes
    .filter(l => l.estado === 'Disponible')
    .sort((a, b) => a.lote.localeCompare(b.lote, undefined, { numeric: true }))

  const [form, setForm] = useState({
    lote:            disponibles[0]?.lote || '',
    cliente:         '',
    fecha_contrato:  new Date().toISOString().split('T')[0],
    inicial:         0,
    cantidad_letras: 12,
    monto_mensual:   0,
    cuota_final:     0,
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const loteInfo = lotes.find(l => l.lote === form.lote)
  const n        = Number(form.cantidad_letras)
  const mensual  = Number(form.monto_mensual)
  const final_   = Number(form.cuota_final) || mensual
  const inicial_ = Number(form.inicial)
  const total    = ((n - 1) * mensual) + final_ + inicial_

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cliente.trim()) { toast.error('Ingresa el nombre del cliente'); return }
    if (mensual <= 0)         { toast.error('El monto mensual debe ser mayor a 0'); return }
    setLoading(true)
    try {
      await registrarVenta({
        lote:            form.lote,
        cliente:         form.cliente.trim(),
        fecha_contrato:  form.fecha_contrato,
        inicial:         inicial_,
        cantidad_letras: n,
        monto_mensual:   mensual,
        cuota_final:     final_,
      })
      toast.success(`Venta del lote ${form.lote} registrada`, { duration: 3000 })
      onSuccess(form.lote)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Error al registrar la venta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>Registrar Nueva Venta</h2>
            <p>Completa los datos del contrato</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="modal-body">
          {disponibles.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>
              <Building2 size={40} style={{ opacity:.2, margin:'0 auto 12px', display:'block' }} />
              <p style={{ fontWeight:700 }}>No hay lotes disponibles</p>
              <p style={{ fontSize:12, color:'var(--dim)', marginTop:4 }}>Todos los lotes han sido vendidos</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* Sección Lote */}
              <div className="form-section">
                <div className="form-section-label">
                  <Building2 size={10} /> Datos del Lote
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Lote disponible</label>
                    <select value={form.lote} onChange={e => set('lote', e.target.value)}>
                      {disponibles.map(l => (
                        <option key={l.lote} value={l.lote}>
                          {l.lote} · {l.area} m² · Manz. {l.manzana}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha de contrato</label>
                    <input type="date" value={form.fecha_contrato} onChange={e => set('fecha_contrato', e.target.value)} />
                  </div>
                </div>
                {loteInfo && (
                  <div className="lote-info-box">
                    <div>Área: <span>{loteInfo.area} m²</span></div>
                    <div>Manzana: <span>{loteInfo.manzana}</span></div>
                  </div>
                )}
              </div>

              {/* Sección Cliente */}
              <div className="form-section">
                <div className="form-section-label">
                  <User size={10} /> Datos del Cliente
                </div>
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Carlos Pérez"
                    value={form.cliente}
                    onChange={e => set('cliente', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Sección Financiamiento */}
              <div className="form-section">
                <div className="form-section-label">
                  <CreditCard size={10} /> Condiciones de Pago
                </div>
                <div className="form-group">
                  <label>Inicial (S/)</label>
                  <input type="number" min="0" step="1" placeholder="0"
                    value={form.inicial} onChange={e => set('inicial', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>N° de cuotas</label>
                    <input type="number" min="1" max="360" step="1"
                      value={form.cantidad_letras} onChange={e => set('cantidad_letras', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Cuota mensual (S/)</label>
                    <input type="number" min="0" step="1" placeholder="0"
                      value={form.monto_mensual} onChange={e => set('monto_mensual', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Cuota final (S/) — dejar en 0 si es igual a la mensual</label>
                  <input type="number" min="0" step="1" placeholder={form.monto_mensual || '0'}
                    value={form.cuota_final} onChange={e => set('cuota_final', e.target.value)} />
                </div>
              </div>

              {/* Price preview */}
              {total > 0 && (
                <div className="price-box">
                  <div className="pb-label">Precio Total del Contrato</div>
                  <div className="pb-value">{fmtCur(total)}</div>
                  <div className="pb-sub">
                    Inicial {fmtCur(inicial_)} · {n - 1} cuotas de {fmtCur(mensual)} · cuota final {fmtCur(final_)}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !form.cliente.trim() || mensual <= 0}
                >
                  {loading ? (
                    <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Registrando...</>
                  ) : (
                    <><CheckCircle2 size={14} /> Confirmar Venta</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

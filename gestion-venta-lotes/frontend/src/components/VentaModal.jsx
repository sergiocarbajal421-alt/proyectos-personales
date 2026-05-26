import { useState } from 'react'
import { registrarVenta } from '../services/api'
import toast from 'react-hot-toast'

export default function VentaModal({ lotes, onClose, onSuccess }) {
  const disponibles = lotes.filter(l => l.estado === 'Disponible')
  const [form, setForm]     = useState({
    lote:             disponibles[0]?.lote || '',
    cliente:          '',
    fecha_contrato:   new Date().toISOString().split('T')[0],
    inicial:          0,
    cantidad_letras:  12,
    monto_mensual:    0,
    cuota_final:      0,
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const precioTotal =
    ((form.cantidad_letras - 1) * Number(form.monto_mensual)) +
    Number(form.cuota_final) +
    Number(form.inicial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cliente.trim()) { toast.error('Ingresa el nombre del cliente'); return }
    setLoading(true)
    try {
      await registrarVenta({
        ...form,
        inicial:         Number(form.inicial),
        cantidad_letras: Number(form.cantidad_letras),
        monto_mensual:   Number(form.monto_mensual),
        cuota_final:     Number(form.cuota_final),
      })
      toast.success(`✅ Venta del lote ${form.lote} registrada`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al registrar venta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>📝 Registrar Nueva Venta</h2>

        {disponibles.length === 0 ? (
          <p style={{ color: '#dc2626' }}>⚠️ No hay lotes disponibles.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Lote disponible</label>
                <select value={form.lote} onChange={e => set('lote', e.target.value)}>
                  {disponibles.map(l => <option key={l.lote} value={l.lote}>{l.lote} ({l.area} m²)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de contrato</label>
                <input type="date" value={form.fecha_contrato} onChange={e => set('fecha_contrato', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Cliente</label>
              <input
                type="text"
                placeholder="Nombre completo"
                value={form.cliente}
                onChange={e => set('cliente', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Monto inicial (S/)</label>
              <input type="number" min="0" step="1" value={form.inicial} onChange={e => set('inicial', e.target.value)} />
            </div>

            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#64748b', textTransform: 'uppercase' }}>
              Letras de pago
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cantidad de letras</label>
                <input type="number" min="1" step="1" value={form.cantidad_letras} onChange={e => set('cantidad_letras', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Monto mensual (S/)</label>
                <input type="number" min="0" step="1" value={form.monto_mensual} onChange={e => set('monto_mensual', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Cuota final (S/)</label>
              <input type="number" min="0" step="1" value={form.cuota_final} onChange={e => set('cuota_final', e.target.value)} />
            </div>

            {precioTotal > 0 && (
              <div className="info-box">
                💰 Precio total estimado:{' '}
                <strong>
                  {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precioTotal)}
                </strong>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : '✅ Registrar Venta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(n)

export default function MetricCards({ resumen }) {
  if (!resumen) return null

  return (
    <div className="metrics-grid">
      <div className="metric-card vendidos">
        <div className="label">✅ Vendidos</div>
        <div className="value">{resumen.total_vendidos}</div>
      </div>
      <div className="metric-card disponible">
        <div className="label">📦 Disponibles</div>
        <div className="value">{resumen.total_disponibles}</div>
      </div>
      <div className="metric-card venta">
        <div className="label">💰 Venta Total</div>
        <div className="value">{fmt(resumen.total_venta)}</div>
      </div>
      <div className="metric-card recaudado">
        <div className="label">💰 Recaudado</div>
        <div className="value">{fmt(resumen.total_recaudado)}</div>
      </div>
      <div className="metric-card pendiente">
        <div className="label">🧾 Pendiente</div>
        <div className="value">{fmt(resumen.total_pendiente)}</div>
      </div>
      <div className="metric-card atrasado">
        <div className="label">⏰ Atrasado</div>
        <div className="value">{fmt(resumen.total_atrasado)}</div>
      </div>
    </div>
  )
}

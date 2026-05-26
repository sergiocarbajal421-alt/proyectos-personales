export default function KPICards({ kpis }) {
  if (!kpis) return null
  return (
    <div className="kpis">
      <div className="kpi-card">
        <div className="kpi-label">🚦 Total accidentes</div>
        <div className="kpi-value">{kpis.total_accidentes.toLocaleString('es-PE')}</div>
      </div>
      <div className="kpi-card danger">
        <div className="kpi-label">💀 Fallecidos</div>
        <div className="kpi-value">{kpis.total_fallecidos.toLocaleString('es-PE')}</div>
      </div>
      <div className="kpi-card warning">
        <div className="kpi-label">🤕 Heridos</div>
        <div className="kpi-value">{kpis.total_heridos.toLocaleString('es-PE')}</div>
      </div>
      <div className="kpi-card success">
        <div className="kpi-label">🗺️ Departamentos</div>
        <div className="kpi-value">{kpis.departamentos_afectados}</div>
      </div>
    </div>
  )
}

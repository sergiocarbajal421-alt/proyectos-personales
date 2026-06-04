import { useMemo } from 'react'

const ICONS = {
  danger:  { bg:'#fef2f2', border:'#fecaca', dot:'#dc2626', text:'#991b1b' },
  warning: { bg:'#fffbeb', border:'#fde68a', dot:'#d97706', text:'#92400e' },
  success: { bg:'#f0fdf4', border:'#bbf7d0', dot:'#059669', text:'#065f46' },
  purple:  { bg:'#f5f3ff', border:'#ddd6fe', dot:'#7c3aed', text:'#4c1d95' },
  blue:    { bg:'#eff6ff', border:'#bfdbfe', dot:'#2563eb', text:'#1e40af' },
  cyan:    { bg:'#ecfeff', border:'#a5f3fc', dot:'#0891b2', text:'#164e63' },
}

export default function InsightCards({ kpis, porDepto, porHora, porMes, porModal }) {
  const insights = useMemo(() => {
    if (!kpis || !porDepto?.length) return []
    const list = []

    // Departamento con más accidentes
    const top = porDepto[0]
    if (top) {
      const pct = ((top.accidentes / kpis.total_accidentes) * 100).toFixed(1)
      list.push({
        emoji: '📍', theme: 'danger',
        title: `${top.departamento} lidera con ${pct}% de accidentes`,
        sub: `${top.accidentes.toLocaleString('es-PE')} de ${kpis.total_accidentes.toLocaleString('es-PE')} registros`,
      })
    }

    // Hora pico
    const peak = porHora?.reduce((m, h) => h.accidentes > m.accidentes ? h : m, porHora[0])
    if (peak) {
      list.push({
        emoji: '🕐', theme: 'warning',
        title: `${peak.label} es la hora con más accidentes`,
        sub: `${peak.accidentes.toLocaleString('es-PE')} accidentes en esa franja horaria`,
      })
    }

    // Modalidad más letal
    const lethal = [...(porModal || [])]
      .filter(m => m.accidentes >= 5)
      .sort((a, b) => (b.fallecidos / b.accidentes) - (a.fallecidos / a.accidentes))[0]
    if (lethal) {
      const tasa = ((lethal.fallecidos / lethal.accidentes) * 100).toFixed(1)
      list.push({
        emoji: '🚨', theme: 'purple',
        title: `${lethal.modalidad} es la modalidad más letal`,
        sub: `${tasa}% de tasa de mortalidad por accidente`,
      })
    }

    // Tendencia 2020 vs 2021
    const a2020 = (porMes || []).filter(m => m.mes.startsWith('2020')).reduce((s, m) => s + m.accidentes, 0)
    const a2021 = (porMes || []).filter(m => m.mes.startsWith('2021')).reduce((s, m) => s + m.accidentes, 0)
    if (a2020 > 0 && a2021 > 0) {
      const delta = (((a2021 - a2020) / a2020) * 100).toFixed(1)
      const sube  = a2021 > a2020
      list.push({
        emoji: sube ? '📈' : '📉', theme: sube ? 'danger' : 'success',
        title: `Accidentes ${sube ? 'aumentaron' : 'bajaron'} ${Math.abs(delta)}% en 2021`,
        sub: `${a2020.toLocaleString('es-PE')} en 2020 vs ${a2021.toLocaleString('es-PE')} en 2021`,
      })
    }

    // Departamento con mayor mortalidad
    const mortDept = [...porDepto]
      .filter(d => d.accidentes >= 10)
      .sort((a, b) => (b.fallecidos / b.accidentes) - (a.fallecidos / a.accidentes))[0]
    if (mortDept) {
      const tasa = ((mortDept.fallecidos / mortDept.accidentes) * 100).toFixed(1)
      list.push({
        emoji: '⚠️', theme: 'warning',
        title: `${mortDept.departamento} tiene la mortalidad más alta`,
        sub: `${tasa}% de sus accidentes resultan en fallecidos`,
      })
    }

    // Tasa de mortalidad global
    if (kpis.total_accidentes > 0) {
      const tasa = ((kpis.total_fallecidos / kpis.total_accidentes) * 100).toFixed(1)
      list.push({
        emoji: '📊', theme: 'blue',
        title: `Tasa de mortalidad general: ${tasa}%`,
        sub: `${kpis.total_fallecidos.toLocaleString('es-PE')} fallecidos en ${kpis.total_accidentes.toLocaleString('es-PE')} accidentes`,
      })
    }

    return list
  }, [kpis, porDepto, porHora, porMes, porModal])

  if (!insights.length) return null

  return (
    <div style={{
      display: 'flex', gap: 6, flexShrink: 0,
    }}>
      {insights.map((ins, i) => {
        const t = ICONS[ins.theme]
        return (
          <div key={i} style={{
            flex: 1, minWidth: 140,
            background: t.bg, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: '5px 9px',
            display: 'flex', gap: 7, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{ins.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: t.text,
                lineHeight: 1.25, marginBottom: 1 }}>
                {ins.title}
              </div>
              <div style={{ fontSize: 9.5, color: t.dot, opacity: 0.85, lineHeight: 1.25 }}>
                {ins.sub}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

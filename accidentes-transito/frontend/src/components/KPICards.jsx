import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Users, Activity, MapPin, TrendingDown, Clock } from 'lucide-react'

function useCountUp(target, duration = 1000) {
  const [v, setV] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (typeof target !== 'number') return
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setV(Math.round(ease * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return v
}

function KPICard({ color, Icon, value, label, sub, delay = 0, isPercent, isPct }) {
  const animated = useCountUp(typeof value === 'number' ? value : null, 1100)
  const display = typeof value === 'number'
    ? (isPercent ? `${animated}%` : animated.toLocaleString('es-PE'))
    : value

  return (
    <div className={`kpi-card ${color}`}
      style={{ animation: `fadeUp .35s ease-out ${delay}ms both` }}>
      <div className="kpi-top">
        <div className="kpi-icon"><Icon size={13} /></div>
        <div className="kpi-value">{display}</div>
      </div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}

export default function KPICards({ kpis, porHora }) {
  if (!kpis) return null

  const tasaMortalidad = kpis.total_accidentes > 0
    ? Math.round((kpis.total_fallecidos / kpis.total_accidentes) * 100)
    : 0

  const horaPico = porHora?.length
    ? porHora.reduce((max, h) => h.accidentes > max.accidentes ? h : max, porHora[0])
    : null

  const cards = [
    { color: '',        Icon: Activity,     value: kpis.total_accidentes,  label: 'Accidentes',         sub: 'Total registrados',            delay: 0   },
    { color: 'danger',  Icon: AlertTriangle, value: kpis.total_fallecidos,  label: 'Fallecidos',         sub: 'Víctimas mortales',            delay: 60  },
    { color: 'warning', Icon: Users,         value: kpis.total_heridos,     label: 'Heridos',            sub: 'Afectados no fatales',         delay: 120 },
    { color: 'violet',  Icon: TrendingDown,  value: tasaMortalidad,         label: 'Tasa Mortalidad',    sub: 'Fallecidos / accidentes',      delay: 180, isPercent: true },
    { color: 'success', Icon: MapPin,        value: kpis.departamentos_afectados, label: 'Departamentos', sub: 'Con accidentes registrados',  delay: 240 },
    { color: 'cyan',    Icon: Clock,         value: horaPico ? `${horaPico.label}` : '—', label: 'Hora pico', sub: horaPico ? `${horaPico.accidentes.toLocaleString('es-PE')} accidentes` : 'Calculando...', delay: 300 },
  ]

  return (
    <div className="kpi-grid">
      {cards.map(c => (
        <KPICard key={c.label} {...c} />
      ))}
    </div>
  )
}

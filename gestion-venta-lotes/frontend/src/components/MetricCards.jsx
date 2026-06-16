import { useEffect, useRef, useState } from 'react'
import { MapPin, CheckCircle, TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react'

const fmtCur = n =>
  new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(n ?? 0)

const compact = n => {
  if (n >= 1_000_000) return `S/ ${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `S/ ${(n/1_000).toFixed(0)}K`
  return fmtCur(n)
}

/* Animated counter hook */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number') return
    const start = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.round(ease * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

/* Single animated card */
function MetricCard({ color, Icon, rawValue, unit, label, sub, delay = 0 }) {
  const animated = useCountUp(typeof rawValue === 'number' ? rawValue : null, 1000)
  const display  = typeof rawValue === 'number' ? compact(animated) : rawValue

  return (
    <div
      className={`metric-card ${color}`}
      style={{ animation: `viewFadeIn 0.35s ease-out ${delay}ms both` }}
    >
      <div className="metric-top">
        <div className="metric-icon"><Icon size={14} /></div>
        <div className="metric-main">
          <div className="metric-value">
            {display}
            {unit && <span className="metric-unit">{unit}</span>}
          </div>
          <div className="metric-label">{label}</div>
        </div>
      </div>
      <div className="metric-sub">{sub}</div>
    </div>
  )
}

export default function MetricCards({ resumen, lotes = [] }) {
  if (!resumen) return null

  const total      = resumen.total_vendidos + resumen.total_disponibles
  const pctVendido = total > 0 ? Math.round((resumen.total_vendidos / total) * 100) : 0
  const pctCobrado = resumen.total_venta > 0
    ? Math.round((resumen.total_recaudado / resumen.total_venta) * 100) : 0
  const conAtraso  = lotes.filter(l => l.monto_atrasado > 0).length

  const cards = [
    { color:'mc-blue',   Icon:MapPin,        rawValue:resumen.total_vendidos,    unit:'lotes', label:'Lotes Vendidos', sub:`${pctVendido}% del total · ${total} lotes` },
    { color:'mc-green',  Icon:CheckCircle,   rawValue:resumen.total_disponibles, unit:'lotes', label:'Disponibles',    sub:'Lotes libres para la venta' },
    { color:'mc-violet', Icon:TrendingUp,    rawValue:resumen.total_venta,       label:'Venta Total',   sub:'Valor total del portafolio' },
    { color:'mc-cyan',   Icon:DollarSign,    rawValue:resumen.total_recaudado,   label:'Recaudado',     sub:`${pctCobrado}% del total vendido` },
    { color:'mc-amber',  Icon:Clock,         rawValue:resumen.total_pendiente,   label:'Por Cobrar',    sub:'Letras pendientes de pago' },
    { color:'mc-red',    Icon:AlertTriangle, rawValue:resumen.total_atrasado,    label:'Vencido',       sub:`Incluido en "Por Cobrar" · ${conAtraso} lote${conAtraso !== 1 ? 's' : ''}` },
  ]

  return (
    <div className="metrics-grid">
      {cards.map(({ color, Icon, rawValue, unit, label, sub }, i) => (
        <MetricCard key={label} color={color} Icon={Icon}
          rawValue={rawValue} unit={unit} label={label} sub={sub}
          delay={i * 60}
        />
      ))}
    </div>
  )
}

import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadialBarChart, RadialBar, LabelList,
} from 'recharts'
import {
  TrendingUp, Target, AlertOctagon, Users, BarChart2, Award,
  ArrowUpRight, ArrowDownRight, X, Filter,
} from 'lucide-react'

/* ── formatters ── */
const fmt    = n => `S/ ${new Intl.NumberFormat('es-PE').format(Math.round(n ?? 0))}`
const fmtCur = n =>
  new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(n ?? 0)
/* compact: S/ 1.5M / S/ 145K — para KPIs con poco espacio */
const cmpct  = n => {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return `S/ ${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `S/ ${(n/1_000).toFixed(0)}K`
  return fmtCur(n)
}
const pct = (n, d) => d > 0 ? Math.round((n / d) * 100) : 0

/* ── Custom Tooltip ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:'#fff', border:'1px solid #e2e8f0', borderRadius:8,
      padding:'10px 14px', fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,.1)',
    }}>
      {label && <div style={{ color:'#64748b', fontWeight:600, marginBottom:4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#0f172a', fontWeight:700 }}>
          {p.name && <span style={{ color:'#94a3b8', marginRight:4 }}>{p.name}:</span>}
          {typeof p.value === 'number' && p.value > 100 ? fmt(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

/* ── Filter Chip ── */
function FilterChip({ label, color, onRemove }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:`${color}15`, border:`1px solid ${color}40`,
      borderRadius:99, padding:'3px 10px 3px 8px',
      fontSize:11, fontWeight:700, color,
      animation: 'viewFadeIn 0.2s ease-out both',
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:color }} />
      {label}
      <button onClick={onRemove} style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        width:14, height:14, borderRadius:'50%',
        background:`${color}30`, border:'none', cursor:'pointer', color, padding:0,
      }}>
        <X size={9} strokeWidth={3} />
      </button>
    </div>
  )
}

/* ── Insight Card (compact) ── */
function InsightCard({ color, Icon, value, label, sub, trend, highlight }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderLeft: `3px solid ${color}`, borderRadius: 8,
      padding: '7px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden', transition: 'box-shadow .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='0 3px 10px rgba(0,0,0,.08)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 2px rgba(0,0,0,.05)' }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
        <div style={{ width:22, height:22, borderRadius:6, background:`${color}18`,
          display:'flex', alignItems:'center', justifyContent:'center', color, flexShrink:0 }}>
          <Icon size={11} />
        </div>
        <div style={{ fontSize:14, fontWeight:800, color: highlight || '#0f172a',
          letterSpacing:'-0.3px', lineHeight:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {value}
        </div>
        {trend !== undefined && (
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:2,
            background: trend > 0 ? '#f0fdf4' : '#fef2f2',
            color: trend > 0 ? '#16a34a' : '#dc2626',
            borderRadius:99, padding:'1px 5px', fontSize:9, fontWeight:700, flexShrink:0 }}>
            {trend > 0 ? <ArrowUpRight size={9}/> : <ArrowDownRight size={9}/>}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize:9, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.5px', paddingLeft:29 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize:9, color:'#94a3b8', fontWeight:500, marginTop:2, paddingLeft:29, lineHeight:1.2 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

/* ── Chart Card ── */
function CC({ title, dot, children, span, active, onClear, hint }) {
  return (
    <div style={{
      background:'#fff',
      border: active ? `2px solid ${dot}` : '1px solid #e2e8f0',
      borderRadius:12, padding:14,
      boxShadow: active ? `0 0 0 3px ${dot}20, 0 1px 3px rgba(0,0,0,.06)` : '0 1px 3px rgba(0,0,0,.06)',
      gridColumn: span ? `1 / -1` : undefined,
      transition: 'border .2s, box-shadow .2s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:dot, flexShrink:0 }} />
        <span style={{ fontSize:13, fontWeight:700, color:'#334155' }}>{title}</span>
        {hint && !active && (
          <span style={{ marginLeft:'auto', fontSize:9, color:'#94a3b8', fontWeight:500, fontStyle:'italic' }}>
            clic para filtrar
          </span>
        )}
        {active && (
          <button onClick={onClear} style={{
            marginLeft:'auto', display:'flex', alignItems:'center', gap:4,
            background:`${dot}15`, border:`1px solid ${dot}40`,
            borderRadius:99, padding:'2px 8px', cursor:'pointer',
            fontSize:9, fontWeight:700, color:dot, fontFamily:'inherit',
          }}>
            <Filter size={8} /> FILTRADO · limpiar
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

/* ── helper: aplica solo los filtros relevantes a un conjunto ── */
const applyFilters = (arr, { manzana, estado, cliente }) =>
  arr.filter(l => {
    if (manzana && l.manzana !== manzana) return false
    if (estado === 'Vendido'    && l.estado !== 'Vendido')    return false
    if (estado === 'Disponible' && l.estado !== 'Disponible') return false
    if (estado === 'Atrasado'   && l.monto_atrasado <= 0)     return false
    if (cliente && l.cliente !== cliente) return false
    return true
  })

/* ─────────────────────────────────── MAIN ─────────────────────────────────── */
export default function AnalyticaView({ lotes, resumen }) {
  const [filters, setFilters] = useState({ manzana: null, estado: null, cliente: null })

  if (!resumen || !lotes.length) return null

  const toggle = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }))
  const clearAll = () => setFilters({ manzana: null, estado: null, cliente: null })
  const activeCount = Object.values(filters).filter(Boolean).length
  const allManzanas = [...new Set(lotes.map(l => l.manzana))].sort()
  const allClientes = [...new Set(lotes.filter(l=>l.cliente).map(l=>l.cliente))].sort()

  /*
   * ══════════════════════════════════════════════════
   *  REGLAS DE CROSS-FILTERING (análisis de sentido)
   * ══════════════════════════════════════════════════
   *
   * Distribución (donut)
   *   ✅ reacciona a: manzana
   *   ❌ NO reacciona a: estado (circular), cliente (trivial 1vs0)
   *   ❌ NO es fuente de filtro
   *
   * Gauge de Cobranza
   *   ✅ reacciona a: manzana + estado(sin Disponible) + cliente
   *   ❌ NO es fuente de filtro
   *
   * Recaudación por Cliente
   *   ✅ reacciona a: manzana + estado(sin Disponible)
   *   ❌ NO reacciona a: cliente (circular — muestra solo esa fila)
   *   ✅ ES fuente → setea filtro cliente al hacer clic
   *
   * Ventas por Manzana
   *   ✅ reacciona a: cliente + estado
   *   ❌ NO reacciona a: manzana (circular — muestra solo esa barra)
   *   ✅ ES fuente → setea filtro manzana al hacer clic
   *
   * Estado General
   *   ✅ reacciona a: TODOS los filtros
   *   ❌ NO es fuente de filtro
   * ══════════════════════════════════════════════════
   */

  // flDistrib: solo manzana
  const flDistrib  = applyFilters(lotes, { manzana: filters.manzana })

  // flGauge: manzana + estado(no Disponible, no tiene montos) + cliente
  const estadoGauge = filters.estado === 'Disponible' ? null : filters.estado
  const flGauge    = applyFilters(lotes, { manzana: filters.manzana, estado: estadoGauge, cliente: filters.cliente })

  // flClientes: manzana + estado(no Disponible) — sin cliente (circular)
  const estadoClientes = filters.estado === 'Disponible' ? null : filters.estado
  const flClientes = applyFilters(lotes, { manzana: filters.manzana, estado: estadoClientes })

  // flManzana: cliente + estado — sin manzana (circular)
  const flManzana  = applyFilters(lotes, { estado: filters.estado, cliente: filters.cliente })

  // flCartera (KPIs + Estado General): todos los filtros
  const fl         = applyFilters(lotes, filters)

  /* ── KPIs desde fl (todos los filtros) ── */
  const fVend  = fl.filter(l => l.estado === 'Vendido')
  const fDisp  = fl.filter(l => l.estado === 'Disponible')
  const fAtras = fl.filter(l => l.monto_atrasado > 0)
  const fVenta     = fVend.reduce((s,l) => s+(l.precio||0), 0)
  // monto_pagado solo suma letras cobradas; la inicial se paga al firmar y nunca
  // genera una letra, así que hay que sumarla aparte para no subestimar lo recaudado.
  const fRecaudado = fl.reduce((s,l) => s+(l.monto_pagado||0)+(l.inicial||0), 0)
  const fPendiente = fl.reduce((s,l) => s+(l.monto_pendiente||0), 0)
  const fAtrasado  = fl.reduce((s,l) => s+(l.monto_atrasado||0), 0)

  const ticketProm   = fVend.length ? fVenta / fVend.length : 0
  const tasaCobranza = pct(fRecaudado, fVenta)
  const riesgoConc   = pct(fAtrasado, fVenta)
  const tasaVentas   = pct(fVend.length, lotes.length)
  const pendPorLote  = fVend.length ? fPendiente / fVend.length : 0
  const clienteRiesgo = fVend.filter(l => l.monto_atrasado > 0).sort((a,b) => b.monto_atrasado - a.monto_atrasado)[0]

  /* ── Distribución: solo manzana ── */
  const dVend = flDistrib.filter(l => l.estado === 'Vendido').length
  const dDisp = flDistrib.filter(l => l.estado === 'Disponible').length
  const pieData = [
    { name:'Vendidos',    value: dVend, fill:'#2563eb' },
    { name:'Disponibles', value: dDisp, fill:'#16a34a' },
  ]

  /* ── Gauge: manzana + estado(sin Disponible) + cliente ── */
  const gVend       = flGauge.filter(l => l.estado === 'Vendido')
  const gVenta      = gVend.reduce((s,l) => s+(l.precio||0), 0)
  const gRecaudado  = flGauge.reduce((s,l) => s+(l.monto_pagado||0)+(l.inicial||0), 0)
  const gPendiente  = flGauge.reduce((s,l) => s+(l.monto_pendiente||0), 0)
  const gAtrasado   = flGauge.reduce((s,l) => s+(l.monto_atrasado||0), 0)
  const gCobranza   = pct(gRecaudado, gVenta)

  /* ── Clientes: manzana + estado(sin Disponible) ── */
  const cVend = flClientes.filter(l => l.estado === 'Vendido')
  const clienteMap = cVend.reduce((a, l) => {
    if (!a[l.cliente]) a[l.cliente] = { pagado:0, total:0 }
    a[l.cliente].pagado += (l.monto_pagado||0)
    a[l.cliente].total  += (l.precio||0)
    return a
  }, {})
  const barClientes = Object.entries(clienteMap)
    .map(([fullname, { pagado, total }]) => ({
      name: fullname.split(' ')[0], fullname,
      pagado, pendiente: total - pagado,
    }))
    .sort((a,b) => (b.pagado+b.pendiente)-(a.pagado+a.pendiente))
    .slice(0, 7)

  /* ── Manzana: cliente + estado ── */
  const manzData = allManzanas.map(m => ({
    name: `Manz. ${m}`, manzana: m,
    vendidos:    flManzana.filter(l => l.manzana===m && l.estado==='Vendido').length,
    disponibles: flManzana.filter(l => l.manzana===m && l.estado==='Disponible').length,
    atrasado:    flManzana.filter(l => l.manzana===m && l.monto_atrasado>0).length,
  }))

  /* ── Estado General: todos los filtros ── */
  const carteraData = [
    { name:'Total cartera', value: fVenta,     fill:'#2563eb' },
    { name:'Recaudado',     value: fRecaudado, fill:'#16a34a' },
    { name:'Pendiente',     value: fPendiente, fill:'#d97706' },
    { name:'Vencido',       value: fAtrasado,  fill:'#dc2626' },
  ]

  return (
    <div>
      {/* ── KPIs (6) ── */}
      <div className="av-kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:8, marginBottom:10 }}>
        <InsightCard color="#2563eb" Icon={BarChart2}
          value={`${tasaVentas}%`} label="Tasa de Ventas"
          sub={`${fVend.length} de ${lotes.length} lotes`} highlight="#2563eb" />
        <InsightCard color="#7c3aed" Icon={TrendingUp}
          value={fmtCur(ticketProm)} label="Ticket Promedio"
          sub="Precio medio por lote" highlight="#7c3aed" />
        <InsightCard color="#dc2626" Icon={AlertOctagon}
          value={`${riesgoConc}%`} label="Riesgo Cartera"
          sub={`${fAtras.length} lotes en mora`}
          highlight={riesgoConc > 5 ? '#dc2626' : '#16a34a'}
          trend={riesgoConc > 0 ? riesgoConc : undefined} />
        <InsightCard color="#0891b2" Icon={Users}
          value={fAtras.length} label="Clientes en Mora"
          sub={clienteRiesgo ? clienteRiesgo.cliente.split(' ')[0] : '—'} />
        <InsightCard color="#d97706" Icon={Award}
          value={fmtCur(pendPorLote)} label="Pdte. por Lote"
          sub="Promedio lotes vendidos" />
        <InsightCard color="#2563eb" Icon={BarChart2}
          value={cmpct(fPendiente)} label="Capital x Recuperar"
          sub="Letras pdte. + vencidas" />
      </div>

      {/* ── Filter bar — siempre visible ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:10, flexWrap:'wrap',
        padding:'8px 12px', marginBottom:10,
        background:'#fff', border:'1px solid #e2e8f0', borderRadius:10,
        boxShadow:'0 1px 3px rgba(0,0,0,.04)',
      }}>
        <Filter size={13} style={{ color: activeCount > 0 ? '#2563eb' : '#94a3b8', flexShrink:0 }} />
        <span style={{ fontSize:11, fontWeight:700, color:'#64748b', marginRight:4 }}>Filtrar por:</span>

        {/* Manzana */}
        <select value={filters.manzana || ''} onChange={e => setFilters(f => ({ ...f, manzana: e.target.value || null }))}
          style={{
            padding:'4px 28px 4px 10px', borderRadius:7, fontSize:11, fontFamily:'inherit',
            border: filters.manzana ? '1.5px solid #0891b2' : '1px solid #e2e8f0',
            background: filters.manzana ? '#ecfeff' : 'white', color: filters.manzana ? '#0891b2' : '#64748b',
            fontWeight: filters.manzana ? 700 : 500, cursor:'pointer', outline:'none',
            appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`,
            backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center',
          }}>
          <option value="">Manzana: Todas</option>
          {allManzanas.map(m => <option key={m} value={m}>Manzana {m}</option>)}
        </select>

        {/* Estado */}
        <select value={filters.estado || ''} onChange={e => setFilters(f => ({ ...f, estado: e.target.value || null }))}
          style={{
            padding:'4px 28px 4px 10px', borderRadius:7, fontSize:11, fontFamily:'inherit',
            border: filters.estado ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
            background: filters.estado ? '#eff6ff' : 'white', color: filters.estado ? '#2563eb' : '#64748b',
            fontWeight: filters.estado ? 700 : 500, cursor:'pointer', outline:'none',
            appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`,
            backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center',
          }}>
          <option value="">Estado: Todos</option>
          <option value="Vendido">Vendido</option>
          <option value="Disponible">Disponible</option>
          <option value="Atrasado">Vendido · Atraso</option>
        </select>

        {/* Cliente */}
        <select value={filters.cliente || ''} onChange={e => setFilters(f => ({ ...f, cliente: e.target.value || null }))}
          style={{
            padding:'4px 28px 4px 10px', borderRadius:7, fontSize:11, fontFamily:'inherit',
            border: filters.cliente ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
            background: filters.cliente ? '#f5f3ff' : 'white', color: filters.cliente ? '#7c3aed' : '#64748b',
            fontWeight: filters.cliente ? 700 : 500, cursor:'pointer', outline:'none',
            appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`,
            backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center',
          }}>
          <option value="">Cliente: Todos</option>
          {[...new Set(lotes.filter(l=>l.cliente).map(l=>l.cliente))].sort()
            .map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Chips de activos + contador */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', flex:1 }}>
          {activeCount > 0 && (
            <span style={{ fontSize:10, color:'#64748b', fontWeight:600, background:'#f1f5f9',
              padding:'2px 8px', borderRadius:99 }}>
              {fl.length} / {lotes.length} lotes
            </span>
          )}
        </div>

        {/* Limpiar */}
        {activeCount > 0 && (
          <button onClick={clearAll} style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'4px 11px', borderRadius:7,
            background:'#fef2f2', border:'1px solid #fecaca',
            fontSize:11, fontWeight:700, color:'#dc2626', cursor:'pointer', fontFamily:'inherit',
            animation:'viewFadeIn .15s ease-out both',
          }}>
            <X size={10} strokeWidth={3}/> Limpiar
          </button>
        )}
      </div>

      {/* ── Charts grid ── */}
      <div className="av-charts-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>

        {/* Donut — solo reacciona a filtro de manzana (no es fuente de filtro) */}
        <CC title="Distribución del Portafolio" dot="#2563eb">
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  dataKey="value" labelLine={false}
                  label={({ cx,cy,midAngle,innerRadius,outerRadius,percent }) => {
                    const R = Math.PI/180
                    const r = innerRadius+(outerRadius-innerRadius)*.5
                    return (
                      <text x={cx+r*Math.cos(-midAngle*R)} y={cy+r*Math.sin(-midAngle*R)}
                        fill="white" textAnchor="middle" dominantBaseline="central"
                        style={{ fontSize:13, fontWeight:700 }}>
                        {`${(percent*100).toFixed(0)}%`}
                      </text>
                    )
                  }}
                >
                  {pieData.map(e => (
                    <Cell key={e.name} fill={e.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1 }}>
              {pieData.map(e => (
                  <div key={e.name} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                      <span style={{ color:'#64748b', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:e.fill, display:'inline-block' }} />
                        {e.name}
                      </span>
                      <strong style={{ color:e.fill }}>{e.value} lotes</strong>
                    </div>
                    <div style={{ height:5, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:e.fill,
                        width:`${pct(e.value, flDistrib.length || 1)}%`, borderRadius:99 }} />
                    </div>
                  </div>
              ))}
              <div style={{ marginTop:8, padding:'10px 12px', background:'#eff6ff', borderRadius:8,
                fontSize:12, color:'#1d4ed8', fontWeight:600 }}>
                {pct(fVend.length, lotes.length)}% de ocupación del proyecto
              </div>
            </div>
          </div>
        </CC>

        {/* Gauge cobranza — no filtra, pero reacciona a filtros */}
        <CC title="Gauge de Cobranza" dot="#16a34a">
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ position:'relative', width:180, height:180, flexShrink:0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="55%" outerRadius="90%"
                  data={[{ name:'Cobranza', value:gCobranza,
                    fill: gCobranza > 50 ? '#16a34a' : '#d97706' }]}
                  startAngle={220} endAngle={-40}
                >
                  <RadialBar background={{ fill:'#f1f5f9' }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', marginTop:8 }}>
                <div style={{ fontSize:28, fontWeight:900, letterSpacing:'-1px',
                  color: gCobranza > 50 ? '#16a34a' : '#d97706' }}>
                  {gCobranza}%
                </div>
                <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px' }}>
                  Cobrado
                </div>
              </div>
            </div>
            <div style={{ flex:1 }}>
              {[
                { l:'Recaudado', v:gRecaudado, c:'#16a34a', p:gCobranza },
                { l:'Pendiente', v:gPendiente, c:'#d97706', p:pct(gPendiente, gVenta) },
                { l:'Vencido',   v:gAtrasado,  c:'#dc2626', p:pct(gAtrasado,  gVenta) },
              ].map(({ l,v,c,p }) => (
                <div key={l} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                    <span style={{ color:'#64748b', fontWeight:600 }}>{l}</span>
                    <span style={{ color:c, fontWeight:700 }}>{p}%</span>
                  </div>
                  <div style={{ height:5, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:c, width:`${p}%`, borderRadius:99, transition:'width .6s' }} />
                  </div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{fmtCur(v)}</div>
                </div>
              ))}
              <div style={{ fontSize:9, color:'#cbd5e1', fontStyle:'italic' }}>
                * Vencido ya forma parte de Pendiente
              </div>
            </div>
          </div>
        </CC>

        {/* Clientes — filtra por cliente */}
        <CC title="Recaudación por Cliente" dot="#7c3aed"
          active={!!filters.cliente} hint
          onClear={() => toggle('cliente', filters.cliente)}>
          {barClientes.length === 0
            ? <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8', fontSize:13 }}>Sin datos</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barClientes} layout="vertical" margin={{ left:5, right:70 }}
                  style={{ cursor:'pointer' }}
                  onClick={d => { if (d?.activePayload?.[0]?.payload) toggle('cliente', d.activePayload[0].payload.fullname) }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tickFormatter={v=>`S/${Math.round(v/1000)}k`}
                    tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={65}
                    tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Legend iconType="circle" iconSize={7}
                    formatter={v=><span style={{ color:'#64748b', fontSize:11 }}>{v}</span>} />
                  <Bar dataKey="pagado" name="Pagado" stackId="a" fill="#16a34a" fillOpacity={.85} radius={[0,0,0,0]}>
                    {barClientes.map(e => (
                      <Cell key={e.fullname}
                        fillOpacity={filters.cliente && filters.cliente !== e.fullname ? 0.15 : 0.85} />
                    ))}
                  </Bar>
                  <Bar dataKey="pendiente" name="Pendiente" stackId="a" fill="#d97706" fillOpacity={.7} radius={[0,4,4,0]}>
                    {barClientes.map(e => (
                      <Cell key={e.fullname}
                        fillOpacity={filters.cliente && filters.cliente !== e.fullname ? 0.15 : 0.7} />
                    ))}
                    <LabelList valueAccessor={e => e.pagado + e.pendiente} position="right"
                      formatter={v => `S/${Math.round(v/1000)}k`}
                      style={{ fontSize:9, fontWeight:700, fill:'#64748b' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </CC>

        {/* Manzana — filtra por manzana */}
        <CC title="Ventas por Manzana" dot="#0891b2"
          active={!!filters.manzana} hint
          onClear={() => toggle('manzana', filters.manzana)}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={manzData} margin={{ left:0, right:10 }}
              style={{ cursor:'pointer' }}
              onClick={d => { if (d?.activeLabel) toggle('manzana', d.activeLabel.replace('Manz. ','')) }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={7}
                formatter={v=><span style={{ color:'#64748b', fontSize:11 }}>{v}</span>} />
              <Bar dataKey="vendidos" name="Vendidos" fill="#2563eb" radius={[4,4,0,0]}>
                {manzData.map(e => <Cell key={e.manzana} fill="#2563eb"
                  fillOpacity={filters.manzana && filters.manzana !== e.manzana ? 0.15 : 0.85} />)}
                <LabelList dataKey="vendidos" position="top"
                  style={{ fontSize:10, fontWeight:700, fill:'#2563eb' }} />
              </Bar>
              <Bar dataKey="disponibles" name="Disponibles" fill="#16a34a" radius={[4,4,0,0]}>
                {manzData.map(e => <Cell key={e.manzana} fill="#16a34a"
                  fillOpacity={filters.manzana && filters.manzana !== e.manzana ? 0.15 : 0.7} />)}
                <LabelList dataKey="disponibles" position="top"
                  style={{ fontSize:10, fontWeight:700, fill:'#16a34a' }} />
              </Bar>
              <Bar dataKey="atrasado" name="Vendido · Atraso" fill="#dc2626" radius={[4,4,0,0]}>
                {manzData.map(e => <Cell key={e.manzana} fill="#dc2626"
                  fillOpacity={filters.manzana && filters.manzana !== e.manzana ? 0.15 : 0.7} />)}
                <LabelList dataKey="atrasado" position="top"
                  style={{ fontSize:10, fontWeight:700, fill:'#dc2626' }}
                  formatter={v => v > 0 ? v : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CC>

        {/* Estado general — reacciona a filtros */}
        <CC title="Estado General de la Cartera (S/)" dot="#0f172a" span>
          <div style={{ fontSize:10, color:'#94a3b8', marginTop:-6, marginBottom:8 }}>
            Vencido ya está incluido dentro de Pendiente, no es un monto adicional
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'center' }}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={carteraData} layout="vertical" margin={{ left:20, right:80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={v=>`S/${Math.round(v/1000)}k`}
                  tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={95}
                  tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" radius={[0,5,5,0]}>
                  {carteraData.map(e => <Cell key={e.name} fill={e.fill} fillOpacity={.85} />)}
                  <LabelList dataKey="value" position="right"
                    formatter={v => `S/${Math.round(v/1000)}k`}
                    style={{ fontSize:10, fontWeight:700, fill:'#334155' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div>
              {carteraData.map(({ name, value, fill }) => (
                <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'8px 12px', borderRadius:8, marginBottom:4, background:'#f8fafc' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:fill }} />
                    <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>{name}</span>
                  </div>
                  <div>
                    <span style={{ fontSize:13, fontWeight:800, color:fill }}>{fmtCur(value)}</span>
                    <span style={{ fontSize:10, color:'#94a3b8', marginLeft:6 }}>
                      {pct(value, fVenta || 1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CC>

      </div>
    </div>
  )
}

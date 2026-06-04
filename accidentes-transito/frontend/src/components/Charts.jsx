import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, LabelList,
  Treemap, RadialBarChart, RadialBar,
  ScatterChart, Scatter, ReferenceLine,
} from 'recharts'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:'#fff', border:'1px solid #e2e8f0', borderRadius:8,
      padding:'10px 14px', fontSize:12, boxShadow:'0 8px 24px rgba(0,0,0,.1)',
    }}>
      {label && <div style={{ color:'#64748b', fontWeight:700, marginBottom:4 }}>{label}</div>}
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, fontWeight:600 }}>
          {p.name}: <strong>{typeof p.value==='number' ? p.value.toLocaleString('es-PE') : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

const PALETTE = ['#2563eb','#dc2626','#d97706','#059669','#7c3aed','#0891b2','#be185d','#65a30d']

const YearToggle = ({ year, onChange, includeAll = true }) => (
  <div style={{ marginLeft:'auto', display:'flex', gap:2, background:'#f1f5f9', borderRadius:7, padding:2, flexShrink:0 }}>
    {(includeAll ? [{ label:'Todos', v:'all' }, { label:'2020', v:2020 }, { label:'2021', v:2021 }]
                 : [{ label:'2020', v:2020 }, { label:'2021', v:2021 }]).map(({ label, v }) => (
      <button key={v} onClick={() => onChange(v)} style={{
        padding:'2px 8px', borderRadius:5, border:'none', cursor:'pointer',
        background: year===v ? 'white' : 'transparent',
        color: year===v ? 'var(--primary)' : 'var(--muted)',
        fontWeight: year===v ? 700 : 500, fontSize:11, fontFamily:'inherit',
        boxShadow: year===v ? '0 1px 2px rgba(0,0,0,.1)' : 'none',
        transition:'all .15s',
      }}>{label}</button>
    ))}
  </div>
)

/* ── Evolución mensual ── */
export function ChartEvolucion({ data, fill }) {
  const [year, setYear] = useState('all')

  const filtered = useMemo(() => {
    if (year === 'all') return data
    return data.filter(d => d.mes?.startsWith(String(year)))
  }, [data, year])

  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#2563eb' }}/>
        <span className="card-title">Evolución Mensual</span>
        <YearToggle year={year} onChange={setYear} />
      </div>
      <div style={fill ? { flex:1, minHeight:0 } : { height:220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered} margin={{ left:-10, right:10, top:5, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="mes" tick={{ fill:'#94a3b8', fontSize:9 }} tickLine={false} axisLine={false}/>
            <YAxis tick={{ fill:'#94a3b8', fontSize:10 }} tickLine={false} axisLine={false}/>
            <Tooltip content={<Tip/>}/>
            <Legend iconType="circle" iconSize={7}
              formatter={v=><span style={{ color:'#64748b', fontSize:11 }}>{v}</span>}/>
            <Line type="monotone" dataKey="accidentes" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Accidentes"/>
            <Line type="monotone" dataKey="fallecidos" stroke="#dc2626" strokeWidth={2} dot={false} name="Fallecidos" strokeDasharray="5 3"/>
            <Line type="monotone" dataKey="heridos"    stroke="#d97706" strokeWidth={2} dot={false} name="Heridos" strokeDasharray="3 3"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Top departamentos ── */
export function ChartDepartamentos({ data, selectedDeps = [], fill }) {
  const isFiltered = selectedDeps.length > 0
  const top10 = data.slice(0,10).map(d => ({
    ...d,
    tasa: d.accidentes > 0 ? +((d.fallecidos/d.accidentes)*100).toFixed(1) : 0,
    depto: d.departamento?.length > 11 ? d.departamento.slice(0,10)+'.' : d.departamento,
  }))
  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#7c3aed' }}/>
        <span className="card-title">Top 10 Departamentos</span>
        <span className="card-badge">por accidentes</span>
      </div>
      <div style={fill ? { flex:1, minHeight:0 } : { height:260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10} layout="vertical" margin={{ left:6, right:60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
            <XAxis type="number" tick={{ fill:'#94a3b8', fontSize:10 }} tickLine={false} axisLine={false}/>
            <YAxis type="category" dataKey="depto" width={78} interval={0}
              tick={{ fill:'#64748b', fontSize:10 }} tickLine={false} axisLine={false}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="accidentes" name="Accidentes" radius={[0,4,4,0]}>
              {top10.map((d,i) => {
                const sel = !isFiltered || selectedDeps.includes(d.departamento)
                const color = d.tasa>20 ? '#dc2626' : d.tasa>12 ? '#d97706' : '#2563eb'
                return <Cell key={i} fill={color} fillOpacity={sel ? 0.85 : 0.2}
                  style={{ transition:'fill-opacity 0.3s ease' }}/>
              })}
              <LabelList dataKey="accidentes" position="right"
                formatter={v=>v.toLocaleString('es-PE')}
                style={{ fontSize:9, fontWeight:700, fill:'#64748b' }}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize:10, color:'#94a3b8', marginTop:4, flexShrink:0 }}>
        🔴 Mortalidad alta (&gt;20%) &nbsp; 🟠 Media (&gt;12%) &nbsp; 🔵 Baja
      </div>
    </div>
  )
}

/* ── Mortalidad por Modalidad ── */
export function ChartMortalidadModalidad({ data, selectedMods = [], fill }) {
  const isFiltered = selectedMods.length > 0
  const chartData = data
    .filter(d => d.accidentes > 0)
    .map(d => ({
      modalidad: d.modalidad,
      tasa: +((d.fallecidos / d.accidentes) * 100).toFixed(1),
    }))
    .sort((a, b) => b.tasa - a.tasa)

  const maxTasa = Math.max(...chartData.map(d => d.tasa), 1)

  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#be185d' }}/>
        <span className="card-title">Mortalidad por Modalidad</span>
        <span className="card-badge">% fallecidos / accidentes</span>
      </div>
      <div style={fill ? { flex:1, minHeight:0 } : { height:260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left:8, right:52 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
            <XAxis type="number" tick={{ fill:'#94a3b8', fontSize:10 }} tickLine={false} axisLine={false}
              tickFormatter={v => `${v}%`} domain={[0, Math.ceil(maxTasa * 1.1)]}/>
            <YAxis type="category" dataKey="modalidad" width={72}
              tick={{ fill:'#64748b', fontSize:10 }} tickLine={false} axisLine={false}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="tasa" name="Mortalidad %" radius={[0,4,4,0]}>
              {chartData.map((d, i) => {
                const sel = !isFiltered || selectedMods.includes(d.modalidad)
                const t = d.tasa / maxTasa
                const r = Math.round(252 - t * 125)
                const g = Math.round(165 - t * 136)
                const b = Math.round(165 - t * 136)
                return <Cell key={i} fill={`rgb(${r},${g},${b})`} fillOpacity={sel ? 0.9 : 0.2}
                  style={{ transition:'fill-opacity 0.3s ease' }}/>
              })}
              <LabelList dataKey="tasa" position="right"
                formatter={v => `${v}%`}
                style={{ fontSize:9, fontWeight:700, fill:'#64748b' }}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Modalidad ── */
export function ChartModalidad({ data, fill }) {
  const total = data.reduce((s,d) => s+d.accidentes, 0)
  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#059669' }}/>
        <span className="card-title">Por Modalidad</span>
        <span className="card-badge">{data.length} tipos</span>
      </div>
      <div style={fill ? { flex:1, minHeight:0 } : { height:200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="accidentes" nameKey="modalidad"
              cx="50%" cy="50%" innerRadius="35%" outerRadius="65%"
              labelLine={false}
              label={({ cx,cy,midAngle,innerRadius,outerRadius,percent }) => {
                if (percent < 0.06) return null
                const R = Math.PI/180
                const r = innerRadius+(outerRadius-innerRadius)*.55
                return (
                  <text x={cx+r*Math.cos(-midAngle*R)} y={cy+r*Math.sin(-midAngle*R)}
                    fill="white" textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize:11, fontWeight:700 }}>
                    {`${(percent*100).toFixed(0)}%`}
                  </text>
                )
              }}
            >
              {data.map((_,i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]} stroke="transparent"/>)}
            </Pie>
            <Tooltip formatter={(v,_,p) => [v.toLocaleString('es-PE'), p.payload.modalidad]}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:3, marginTop:6, flexShrink:0 }}>
        {data.slice(0,5).map((d,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:PALETTE[i%PALETTE.length], flexShrink:0 }}/>
            <span style={{ color:'#64748b', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.modalidad}</span>
            <strong style={{ color:'#334155', flexShrink:0 }}>{Math.round((d.accidentes/total)*100)}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Por hora ── */
export function ChartHoras({ data, accidentes, fill }) {
  const [year, setYear] = useState('all')

  const filteredData = useMemo(() => {
    if (year === 'all' || !accidentes?.length) return data
    const m = Object.fromEntries(
      Array.from({ length: 24 }, (_, h) => [h, {
        hora: h, label: `${String(h).padStart(2,'0')}:00`,
        accidentes: 0, fallecidos: 0, heridos: 0,
      }])
    )
    accidentes
      .filter(a => a.fecha?.startsWith(String(year)))
      .forEach(a => {
        if (!a.hora) return
        try {
          const h = parseInt(String(a.hora).split(':')[0])
          if (h >= 0 && h < 24) {
            m[h].accidentes++
            m[h].fallecidos += a.cant_fallecidos || 0
            m[h].heridos    += a.cant_heridos    || 0
          }
        } catch {}
      })
    return Array.from({ length: 24 }, (_, h) => m[h])
  }, [year, data, accidentes])

  if (!filteredData?.length) return null
  const maxVal = Math.max(...filteredData.map(d => d.accidentes), 1)
  const horaPico = filteredData.reduce((m,h) => h.accidentes > m.accidentes ? h : m, filteredData[0])

  const getColor = v => {
    const t = v/maxVal
    if (t > 0.85) return '#dc2626'
    if (t > 0.65) return '#d97706'
    if (t > 0.4)  return '#2563eb'
    return '#93c5fd'
  }

  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#0891b2' }}/>
        <span className="card-title">Accidentes por Hora</span>
        <span className="card-insight" style={{ flexShrink:0 }}>Pico: {horaPico?.label}</span>
        <YearToggle year={year} onChange={setYear} />
      </div>
      <div style={fill ? { flex:1, minHeight:0 } : { height:200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ left:-20, right:5, top:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
            <XAxis dataKey="label" tick={{ fill:'#94a3b8', fontSize:8 }}
              tickLine={false} axisLine={false} interval={2}/>
            <YAxis tick={{ fill:'#94a3b8', fontSize:9 }} tickLine={false} axisLine={false}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="accidentes" name="Accidentes" radius={[3,3,0,0]} maxBarSize={22}>
              {filteredData.map((d,i) => <Cell key={i} fill={getColor(d.accidentes)}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   GRÁFICOS INNOVADORES
   ───────────────────────────────────────────────────────────── */

/* ── Treemap: departamentos coloreados por cantidad de accidentes ── */
const TreeContent = ({ x, y, width, height, name, value, depth, maxValue = 1, isSelected = true }) => {
  if (depth === 0 || !width || !height || width < 10 || height < 10) return null
  const t = Math.min(value / maxValue, 1)
  const r = Math.round(254 - t * 127)
  const g = Math.round(202 - t * 173)
  const b = Math.round(202 - t * 173)
  const fill = `rgb(${r},${g},${b})`
  const opacity = isSelected ? 1 : 0.2
  return (
    <g style={{ opacity, transition: 'opacity 0.3s ease' }}>
      <rect x={x+1} y={y+1} width={width-2} height={height-2} rx={4}
        fill={fill} stroke="white" strokeWidth={1.5}/>
      {width > 50 && height > 28 && (
        <text x={x+width/2} y={y+height/2} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize={Math.min(12, width/7)} fontWeight={700} fontFamily="Inter,sans-serif">
          {name?.slice(0,9)}
        </text>
      )}
      {width > 50 && height > 44 && (
        <text x={x+width/2} y={y+height/2+14} textAnchor="middle"
          fill="rgba(255,255,255,.8)" fontSize={9} fontFamily="Inter,sans-serif">
          {value?.toLocaleString('es-PE')}
        </text>
      )}
    </g>
  )
}

export function ChartTreemap({ data, selectedDeps = [], fill }) {
  const isFiltered = selectedDeps.length > 0
  const treeData = data.map(d => ({
    name: d.departamento,
    size: d.accidentes,
    fallecidos: d.fallecidos || 0,
    heridos: d.heridos || 0,
    tasa: d.accidentes > 0 ? +((d.fallecidos / d.accidentes) * 100).toFixed(1) : 0,
    isSelected: !isFiltered || selectedDeps.includes(d.departamento),
  }))
  const maxVal = Math.max(...treeData.map(d => d.size), 1)

  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#7c3aed' }}/>
        <span className="card-title">Mapa de Calor — Depts.</span>
        <span className="card-badge">tamaño = accidentes</span>
      </div>
      <div style={fill ? { flex:1, minHeight:0 } : { height:300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={treeData} dataKey="size" nameKey="name"
            content={(props) => <TreeContent {...props} maxValue={maxVal} isSelected={!isFiltered || selectedDeps.includes(props.name)} />}
            isAnimationActive>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                if (!d || !d.name) return null
                return (
                  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8,
                    padding:'10px 14px', fontSize:12, boxShadow:'0 8px 24px rgba(0,0,0,.1)' }}>
                    <div style={{ fontWeight:700, color:'#0f172a', marginBottom:5 }}>{d.name}</div>
                    <div style={{ color:'#64748b' }}>Accidentes: <strong style={{ color:'#0f172a' }}>{d.size?.toLocaleString('es-PE')}</strong></div>
                    <div style={{ color:'#64748b' }}>Fallecidos: <strong style={{ color:'#dc2626' }}>{d.fallecidos?.toLocaleString('es-PE')}</strong></div>
                    <div style={{ color:'#64748b' }}>Heridos: <strong style={{ color:'#d97706' }}>{d.heridos?.toLocaleString('es-PE')}</strong></div>
                    <div style={{ color:'#64748b' }}>Mortalidad: <strong style={{ color:'#0f172a' }}>{d.tasa}%</strong></div>
                  </div>
                )
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize:10, color:'var(--muted)', marginTop:4, flexShrink:0 }}>
        Baja cantidad &nbsp;→&nbsp; Alta cantidad &nbsp;|&nbsp; Tamaño = accidentes
      </div>
    </div>
  )
}

/* ── Calendar Heatmap: accidentes por día (estilo GitHub) ── */
const CAL_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const CAL_DAYS   = ['D','L','M','X','J','V','S']
const DAY_LABEL_W = 24  // px reservados para la columna D/L/M/X/J/V/S
const NUM_WEEKS   = 53
const CELL_GAP    = 2

export function ChartCalendar({ accidentes, fill }) {
  const [year, setYear] = useState(2021)
  const [tooltip, setTooltip] = useState(null)
  const [cellSize, setCellSize] = useState(11)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const compute = () => {
      const available = el.clientWidth - DAY_LABEL_W
      const size = Math.floor((available - CELL_GAP * (NUM_WEEKS - 1)) / NUM_WEEKS)
      setCellSize(Math.max(4, Math.min(size, 11)))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { byDate, maxCount } = useMemo(() => {
    const map = {}
    accidentes.forEach(a => { if (a.fecha) map[a.fecha] = (map[a.fecha] || 0) + 1 })
    return { byDate: map, maxCount: Math.max(...Object.values(map), 1) }
  }, [accidentes])

  const weeks = useMemo(() => {
    const start = new Date(`${year}-01-01`)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(`${year}-12-31`)
    const result = [], d = new Date(start)
    while (d <= end) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const ds = d.toISOString().split('T')[0]
        week.push({ date: ds, count: byDate[ds] || 0, inYear: d.getFullYear() === year })
        d.setDate(d.getDate() + 1)
      }
      result.push(week)
    }
    return result
  }, [year, byDate])

  const monthLabels = useMemo(() => {
    const labels = {}
    weeks.forEach((week, wi) => {
      const cell = week.find(c => c.inYear)
      if (!cell) return
      const m = parseInt(cell.date.split('-')[1]) - 1
      const day = parseInt(cell.date.split('-')[2])
      if (day <= 7 && !(m in labels)) labels[m] = wi
    })
    return labels
  }, [weeks])

  const getColor = (count, inYear) => {
    if (!inYear) return 'transparent'
    if (!count)  return '#f1f5f9'
    const t = Math.min(count / (maxCount * 0.5), 1)
    if (t > 0.85) return '#dc2626'
    if (t > 0.65) return '#f97316'
    if (t > 0.45) return '#d97706'
    if (t > 0.25) return '#2563eb'
    return '#93c5fd'
  }

  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#059669' }}/>
        <span className="card-title">Actividad Diaria</span>
        <span className="card-badge">cada celda = 1 día</span>
        <YearToggle year={year} onChange={setYear} includeAll={false} />
      </div>

      <div ref={containerRef} style={fill ? { flex:1, minHeight:0, display:'flex', flexDirection:'column', justifyContent:'center' } : {}}>
        <div style={{ position:'relative' }}>
          {/* Mes labels */}
          <div style={{ display:'flex', marginLeft: DAY_LABEL_W, marginBottom:3, position:'relative', height:12 }}>
            {Object.entries(monthLabels).map(([m,wi]) => (
              <span key={m} style={{ position:'absolute', left: wi*(cellSize+CELL_GAP),
                fontSize:9, fontWeight:700, color:'#94a3b8' }}>
                {CAL_MONTHS[m]}
              </span>
            ))}
          </div>

          <div style={{ display:'flex', gap:0 }}>
            {/* Días label */}
            <div style={{ display:'flex', flexDirection:'column', gap:CELL_GAP, marginRight:4, width: DAY_LABEL_W - 4 }}>
              {CAL_DAYS.map((d,i) => (
                <div key={d} style={{ height:cellSize, fontSize: Math.max(6, cellSize - 3), color:'#94a3b8',
                  lineHeight:`${cellSize}px`, opacity: i%2===0 ? 1 : 0 }}>{d}</div>
              ))}
            </div>
            {/* Grid */}
            <div style={{ display:'flex', gap:CELL_GAP }}>
              {weeks.map((week,wi) => (
                <div key={wi} style={{ display:'flex', flexDirection:'column', gap:CELL_GAP }}>
                  {week.map((cell,di) => (
                    <div key={di}
                      onMouseEnter={e => cell.inYear && setTooltip({ x:e.clientX, y:e.clientY, ...cell })}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        width:cellSize, height:cellSize, borderRadius: cellSize > 7 ? 2 : 1,
                        background: getColor(cell.count, cell.inYear),
                        cursor: cell.count > 0 ? 'pointer' : 'default',
                      }}/>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
            <span style={{ fontSize:9, color:'#94a3b8' }}>Menos</span>
            {['#f1f5f9','#93c5fd','#2563eb','#d97706','#f97316','#dc2626'].map(c => (
              <div key={c} style={{ width:cellSize, height:cellSize, borderRadius: cellSize > 7 ? 2 : 1, background:c }}/>
            ))}
            <span style={{ fontSize:9, color:'#94a3b8' }}>Más accidentes</span>
          </div>
        </div>
      </div>

      {tooltip && tooltip.count > 0 && (
        <div style={{
          position:'fixed', left:tooltip.x+12, top:tooltip.y-32, zIndex:9999,
          background:'#0f172a', color:'white', borderRadius:6,
          padding:'5px 10px', fontSize:11, fontWeight:600, pointerEvents:'none',
          boxShadow:'0 4px 12px rgba(0,0,0,.3)',
        }}>
          {tooltip.date}: <strong>{tooltip.count}</strong> accidentes
        </div>
      )}
    </div>
  )
}

/* ── RadialBarChart: modalidades como arcos concéntricos ── */
export function ChartRadial({ data, selectedMods = [], fill }) {
  const isFiltered = selectedMods.length > 0
  const sorted  = [...data].sort((a,b) => a.accidentes - b.accidentes)
  const maxVal  = sorted[sorted.length-1]?.accidentes || 1
  const radialData = sorted.map((d,i) => {
    const sel = !isFiltered || selectedMods.includes(d.modalidad)
    return {
      name: d.modalidad, value: d.accidentes,
      pct: Math.round((d.accidentes/maxVal)*100),
      fill: PALETTE[i % PALETTE.length],
      opacity: sel ? 1 : 0.2,
    }
  })

  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#0891b2' }}/>
        <span className="card-title">Radar de Modalidades</span>
        <span className="card-badge">arcos por frecuencia</span>
      </div>
      <div style={fill ? { flex:1, minHeight:0, display:'flex', gap:14, alignItems:'center' } :
        { display:'flex', gap:14, height:250, alignItems:'center' }}>

        <div style={{ flex:'0 0 52%', height:'100%', minHeight:0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="12%" outerRadius="94%"
              data={radialData} startAngle={180} endAngle={-180}>
              <RadialBar minAngle={8} background={{ fill:'#f1f5f9' }}
                dataKey="value" cornerRadius={4}
                isAnimationActive animationBegin={0} animationDuration={1200}>
                {radialData.map((d, i) => (
                  <Cell key={i} fill={d.fill} fillOpacity={d.opacity}
                    style={{ transition: 'fill-opacity 0.3s ease' }}/>
                ))}
              </RadialBar>
              <Tooltip formatter={(v,_,p) => [v.toLocaleString('es-PE'), p.payload.name]}
                contentStyle={{ borderRadius:8, fontSize:12, border:'1px solid #e2e8f0' }}/>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6, justifyContent:'center' }}>
          {[...radialData].reverse().map(d => (
            <div key={d.name} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:d.fill, flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text)',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {d.name}
                </div>
                <div style={{ height:3, borderRadius:2, background:'#f1f5f9', marginTop:2 }}>
                  <div style={{ height:'100%', borderRadius:2, background:d.fill,
                    width:`${d.pct}%`, transition:'width .8s ease' }}/>
                </div>
              </div>
              <span style={{ fontSize:9, fontWeight:700, color:'var(--muted)', flexShrink:0 }}>
                {d.value.toLocaleString('es-PE')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Bandera de módulo: la animación solo se ejecuta una vez por sesión
let _riskAnimated = false

/* ── Matriz de Riesgo ── */
export function ChartRiskMatrix({ data, selectedDeps = [], fill }) {
  const processed = useMemo(() =>
    data.filter(d => d.accidentes > 0).map(d => ({
      name: d.departamento,
      x: d.accidentes,
      y: +((d.fallecidos / d.accidentes) * 100).toFixed(1),
      z: d.heridos + 1,
    })),
    [data]
  )

  const medX = useMemo(() => {
    const s = [...processed].sort((a, b) => a.x - b.x)
    return s[Math.floor(s.length / 2)]?.x || 0
  }, [processed])

  const medY = useMemo(() => {
    const s = [...processed].sort((a, b) => a.y - b.y)
    return s[Math.floor(s.length / 2)]?.y || 0
  }, [processed])

  const maxZ = useMemo(() => Math.max(...processed.map(d => d.z), 1), [processed])

  // Dominios dinámicos según los valores reales
  const xMax = useMemo(() => {
    const max = Math.max(...processed.map(d => d.x), 10)
    return Math.ceil(max * 1.12 / 50) * 50
  }, [processed])

  const yMin = useMemo(() => {
    const min = Math.min(...processed.map(d => d.y), 60)
    return Math.max(0, Math.floor(min / 5) * 5 - 5)
  }, [processed])

  const yMax = useMemo(() => {
    const max = Math.max(...processed.map(d => d.y), 0)
    return Math.ceil(max / 5) * 5 + 5
  }, [processed])

  const yTicks = useMemo(() => {
    const ticks = []
    for (let t = yMin; t <= yMax; t += 10) ticks.push(t)
    return ticks
  }, [yMin, yMax])

  // Animación de entrada: solo la primera vez que hay datos
  const [shouldAnimate, setShouldAnimate] = useState(false)
  useEffect(() => {
    if (processed.length > 0 && !_riskAnimated) {
      _riskAnimated = true
      setShouldAnimate(true)
      const t = setTimeout(() => setShouldAnimate(false), processed.length * 50 + 1200)
      return () => clearTimeout(t)
    }
  }, [processed.length])

  const isFiltered = selectedDeps.length > 0

  const getColor = useCallback((x, y) => {
    if (x >= medX && y >= medY) return '#dc2626'
    if (x >= medX && y < medY)  return '#d97706'
    if (x < medX  && y >= medY) return '#f97316'
    return '#059669'
  }, [medX, medY])

  const SIN_ETIQUETA = ['HUANCAVELICA','CALLAO','CAJAMARCA','HUANUCO','SAN MARTIN','AMAZONAS']

  const renderShape = useCallback((props) => {
    const { cx, cy, payload, index } = props
    if (!payload || cx == null || cy == null) return null
    const color = getColor(payload.x, payload.y)
    const r = Math.max(6, Math.min(22, 6 + (payload.z / maxZ) * 16))
    const isSelected = !isFiltered || selectedDeps.includes(payload.name)
    const isRight = payload.x > 450
    const lx = cx + (isRight ? -(r + 4) : (r + 4))
    const anchor = isRight ? 'end' : 'start'
    const delay = `${(index || 0) * 50}ms`
    return (
      <g style={{ opacity: isSelected ? 1 : 0.15, transition: 'opacity 0.35s ease' }}>
        {shouldAnimate && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
            style={{
              transformBox: 'fill-box', transformOrigin: 'center',
              animation: `rippleOut 0.9s ease-out ${delay} both`,
            }}/>
        )}
        <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.82}
          stroke="white" strokeWidth={isSelected ? 1.5 : 0.5}
          style={{
            transformBox: 'fill-box', transformOrigin: 'center',
            animation: shouldAnimate
              ? `bubbleIn 0.65s cubic-bezier(0.34,1.56,0.64,1) ${delay} both`
              : 'none',
          }}/>
        {!SIN_ETIQUETA.includes(payload.name?.toUpperCase()) && (
          <text x={lx} y={cy} textAnchor={anchor} dominantBaseline="middle"
            fill="#334155" fontSize={8} fontWeight={700} fontFamily="Inter,sans-serif"
            style={{
              paintOrder:'stroke', stroke:'white', strokeWidth:3, strokeLinejoin:'round',
              animation: shouldAnimate
                ? `bubbleIn 0.45s ease-out ${delay} both`
                : 'none',
            }}>
            {payload.name}
          </text>
        )}
      </g>
    )
  }, [maxZ, isFiltered, selectedDeps, shouldAnimate, getColor])

  return (
    <div className="card" style={fill ? { display:'flex', flexDirection:'column', flex:1, minHeight:0 } : {}}>
      <div className="card-head">
        <span className="card-dot" style={{ background:'#dc2626' }}/>
        <span className="card-title">Matriz de Riesgo</span>
        <span className="card-badge">accidentes × mortalidad</span>
      </div>
      <div style={fill ? { flex:1, minHeight:0 } : { height:260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left:4, right:16, top:8, bottom:22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="x" type="number" name="Accidentes" domain={[0, xMax]}
              tick={{ fill:'#94a3b8', fontSize:9 }} tickLine={false} axisLine={false}
              label={{ value:'Accidentes →', position:'insideBottom', offset:-10, fill:'#94a3b8', fontSize:9 }}/>
            <YAxis dataKey="y" type="number" name="Mortalidad"
              domain={[yMin, yMax]} ticks={yTicks}
              tick={{ fill:'#94a3b8', fontSize:9 }} tickLine={false} axisLine={false}
              tickFormatter={v => `${v}%`} width={34}/>
            <Tooltip
              cursor={{ strokeDasharray:'3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                if (!d) return null
                const color = getColor(d.x, d.y)
                const label = color === '#dc2626' ? 'Crítico' : color === '#d97706' ? 'Alto volumen' : color === '#f97316' ? 'Peligroso' : 'Seguro'
                return (
                  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8,
                    padding:'10px 14px', fontSize:12, boxShadow:'0 8px 24px rgba(0,0,0,.1)' }}>
                    <div style={{ fontWeight:700, color:'#0f172a', marginBottom:5 }}>{d.name}</div>
                    <div style={{ color:'#64748b' }}>Accidentes: <strong style={{ color:'#0f172a' }}>{d.x.toLocaleString('es-PE')}</strong></div>
                    <div style={{ color:'#64748b' }}>Mortalidad: <strong style={{ color:'#0f172a' }}>{d.y}%</strong></div>
                    <div style={{ color:'#64748b' }}>Heridos: <strong style={{ color:'#0f172a' }}>{(d.z - 1).toLocaleString('es-PE')}</strong></div>
                    <div style={{ marginTop:5, color, fontWeight:700, fontSize:11 }}>● {label}</div>
                  </div>
                )
              }}
            />
            <ReferenceLine x={medX} stroke="#e2e8f0" strokeDasharray="4 3" strokeWidth={1.5}/>
            <ReferenceLine y={medY} stroke="#e2e8f0" strokeDasharray="4 3" strokeWidth={1.5}/>
            <Scatter
              data={processed}
              isAnimationActive={false}
              shape={renderShape}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:'flex', gap:10, fontSize:9, color:'var(--muted)', marginTop:4, flexShrink:0 }}>
        <span style={{ color:'#059669', fontWeight:700 }}>● Seguro</span>
        <span style={{ color:'#d97706', fontWeight:700 }}>● Volumen</span>
        <span style={{ color:'#f97316', fontWeight:700 }}>● Peligroso</span>
        <span style={{ color:'#dc2626', fontWeight:700 }}>● Crítico</span>
        <span style={{ marginLeft:'auto' }}>Tamaño = heridos</span>
      </div>
    </div>
  )
}

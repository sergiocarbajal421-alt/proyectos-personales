import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const fmt = n => `S/ ${new Intl.NumberFormat('es-PE').format(Math.round(n ?? 0))}`

const PIE_COLORS = { Vendido: '#2563eb', Disponible: '#16a34a' }

const TIP = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 12,
    color: '#0f172a',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  cursor: { fill: 'rgba(37,99,235,0.04)' },
}

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <div style={{ color:'#64748b', fontWeight:600, marginBottom:4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color || '#0f172a', fontWeight:700 }}>
          {fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RAD = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  return (
    <text
      x={cx + r * Math.cos(-midAngle * RAD)}
      y={cy + r * Math.sin(-midAngle * RAD)}
      fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize:13, fontWeight:700 }}
    >
      {`${(percent*100).toFixed(0)}%`}
    </text>
  )
}

export default function Charts({ lotes, resumen }) {
  /* Pie */
  const pieData = Object.entries(
    lotes.reduce((a, l) => { a[l.estado] = (a[l.estado]||0)+1; return a }, {})
  ).map(([name, value]) => ({ name, value }))

  /* Bar: por cliente */
  const barData = Object.entries(
    lotes.filter(l => l.estado==='Vendido' && l.cliente)
      .reduce((a, l) => { a[l.cliente] = (a[l.cliente]||0) + (l.monto_pagado||0); return a }, {})
  )
    .map(([name, value]) => ({ name: name.split(' ')[0], value }))
    .sort((a,b) => b.value - a.value)
    .slice(0, 8)

  /* Bar: estado general */
  const generalData = resumen ? [
    { name:'Venta Total', value: resumen.total_venta,      fill:'#2563eb' },
    { name:'Recaudado',   value: resumen.total_recaudado,  fill:'#16a34a' },
    { name:'Pendiente',   value: resumen.total_pendiente,  fill:'#d97706' },
    { name:'Vencido',     value: resumen.total_atrasado,   fill:'#dc2626' },
  ] : []

  return (
    <div className="charts-grid">
      {/* Pie */}
      <div className="chart-card">
        <div className="chart-title">
          <span className="chart-dot" style={{ background:'#2563eb' }} />
          Distribución de Lotes
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={pieData} cx="50%" cy="50%"
              innerRadius={60} outerRadius={88}
              dataKey="value" labelLine={false} label={PieLabel}
            >
              {pieData.map(e => (
                <Cell key={e.name} fill={PIE_COLORS[e.name] || '#7c3aed'} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip {...TIP} formatter={(v,n) => [v, n]} />
            <Legend
              iconType="circle" iconSize={8}
              formatter={v => <span style={{ color:'#64748b', fontSize:12 }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar: clientes */}
      <div className="chart-card">
        <div className="chart-title">
          <span className="chart-dot" style={{ background:'#16a34a' }} />
          Pagos por Cliente
        </div>
        {barData.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--dim)', fontSize:13 }}>
            Sin datos disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={barData} layout="vertical" margin={{ left:10, right:20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tickFormatter={v=>`S/${Math.round(v/1000)}k`}
                tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={70}
                tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="value" fill="#2563eb" radius={[0,5,5,0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar: estado general */}
      <div className="chart-card" style={{ gridColumn:'1 / -1' }}>
        <div className="chart-title">
          <span className="chart-dot" style={{ background:'#7c3aed' }} />
          Estado General de la Cartera
        </div>
        <div style={{ fontSize:10, color:'#94a3b8', margin:'-4px 0 8px' }}>
          Vencido ya está incluido dentro de Pendiente, no es un monto adicional
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={generalData} layout="vertical" margin={{ left:20, right:40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tickFormatter={v=>`S/${Math.round(v/1000)}k`}
              tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={90}
              tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTip />} />
            <Bar dataKey="value" radius={[0,5,5,0]}>
              {generalData.map(e => (
                <Cell key={e.name} fill={e.fill} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

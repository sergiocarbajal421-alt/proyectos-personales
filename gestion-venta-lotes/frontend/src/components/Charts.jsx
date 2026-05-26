import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const COLORS = { Vendido: '#3b82f6', Disponible: '#22c55e' }
const fmt = (n) => `S/ ${new Intl.NumberFormat('es-PE').format(Math.round(n))}`

export default function Charts({ lotes }) {
  // Distribución de estados
  const estadoCounts = lotes.reduce((acc, l) => {
    acc[l.estado] = (acc[l.estado] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(estadoCounts).map(([name, value]) => ({ name, value }))

  // Recaudación por cliente (top 8)
  const clienteData = lotes
    .filter(l => l.estado === 'Vendido' && l.cliente)
    .reduce((acc, l) => {
      const c = l.cliente
      acc[c] = (acc[c] || 0) + (l.monto_pagado || 0)
      return acc
    }, {})
  const barData = Object.entries(clienteData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Estado de pagos
  const resumenPagos = [
    { name: 'Venta Total',  value: lotes.reduce((s, l) => s + (l.precio || 0), 0),          fill: '#3b82f6' },
    { name: 'Recaudado',   value: lotes.reduce((s, l) => s + (l.monto_pagado || 0), 0),    fill: '#22c55e' },
    { name: 'Pendiente',   value: lotes.reduce((s, l) => s + (l.monto_pendiente || 0), 0), fill: '#f59e0b' },
    { name: 'Atrasado',    value: lotes.reduce((s, l) => s + (l.monto_atrasado || 0), 0),  fill: '#ef4444' },
  ]

  return (
    <div className="charts-grid">
      {/* Pie: distribución de estados */}
      <div className="chart-card">
        <h3>Distribución de Lotes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar: recaudación por cliente */}
      <div className="chart-card">
        <h3>Recaudación por Cliente</h3>
        {barData.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Sin datos aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={v => `S/ ${Math.round(v / 1000)}k`} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [fmt(v), 'Pagado']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar: estado general de pagos */}
      <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
        <h3>Estado General de Pagos</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={resumenPagos} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={v => `S/ ${Math.round(v / 1000)}k`} />
            <YAxis type="category" dataKey="name" width={90} />
            <Tooltip formatter={(v) => [fmt(v), '']} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {resumenPagos.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

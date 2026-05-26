import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#1d4ed8','#dc2626','#d97706','#16a34a','#7c3aed','#0891b2','#be185d','#65a30d']

export function ChartDepartamentos({ data }) {
  const top10 = data.slice(0, 10)
  return (
    <div className="card">
      <h3>📊 Top 10 Departamentos por Accidentes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={top10} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="departamento" width={100} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="accidentes" fill="#1d4ed8" radius={[0, 4, 4, 0]} name="Accidentes" />
          <Bar dataKey="fallecidos" fill="#dc2626" radius={[0, 4, 4, 0]} name="Fallecidos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartModalidad({ data }) {
  return (
    <div className="card">
      <h3>🚗 Distribución por Modalidad</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="accidentes" nameKey="modalidad" cx="50%" cy="50%"
            outerRadius={100} label={({ modalidad, percent }) => `${modalidad} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n, p) => [v, p.payload.modalidad]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartEvolucion({ data }) {
  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h3>📈 Evolución Mensual de Accidentes</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="accidentes" stroke="#1d4ed8" strokeWidth={2} dot={false} name="Accidentes" />
          <Line type="monotone" dataKey="fallecidos" stroke="#dc2626" strokeWidth={2} dot={false} name="Fallecidos" />
          <Line type="monotone" dataKey="heridos"    stroke="#d97706" strokeWidth={2} dot={false} name="Heridos" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

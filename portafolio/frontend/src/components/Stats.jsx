import Reveal from './Reveal'

export default function Stats({ items }) {
  return (
    <div className="container stats">
      <Reveal>
        <div className="stats-grid">
          {items.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  )
}

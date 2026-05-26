export default function Sidebar({ filtros, opciones, onChange, onReset }) {
  const toggle = (key, val) => {
    const actual = filtros[key] || []
    const nuevo  = actual.includes(val)
      ? actual.filter(v => v !== val)
      : [...actual, val]
    onChange({ ...filtros, [key]: nuevo })
  }

  return (
    <aside className="sidebar">
      <h2>🎯 Filtros</h2>

      <div className="filter-group">
        <label>Fecha inicio</label>
        <input
          type="date"
          value={filtros.fecha_inicio || ''}
          min={opciones?.fecha_min || ''}
          max={opciones?.fecha_max || ''}
          onChange={e => onChange({ ...filtros, fecha_inicio: e.target.value || null })}
        />
      </div>

      <div className="filter-group">
        <label>Fecha fin</label>
        <input
          type="date"
          value={filtros.fecha_fin || ''}
          min={opciones?.fecha_min || ''}
          max={opciones?.fecha_max || ''}
          onChange={e => onChange({ ...filtros, fecha_fin: e.target.value || null })}
        />
      </div>

      <div className="filter-group">
        <label>Departamentos ({(filtros.departamentos || []).length || 'todos'})</label>
        <div className="multi-select">
          {(opciones?.departamentos || []).map(d => (
            <label key={d}>
              <input
                type="checkbox"
                checked={(filtros.departamentos || []).includes(d)}
                onChange={() => toggle('departamentos', d)}
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Modalidad ({(filtros.modalidades || []).length || 'todas'})</label>
        <div className="multi-select">
          {(opciones?.modalidades || []).map(m => (
            <label key={m}>
              <input
                type="checkbox"
                checked={(filtros.modalidades || []).includes(m)}
                onChange={() => toggle('modalidades', m)}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <button className="btn-reset" onClick={onReset}>↺ Limpiar filtros</button>
    </aside>
  )
}

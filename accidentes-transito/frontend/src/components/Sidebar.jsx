import { Calendar, MapPin, Car, RotateCcw, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'

const ClearBtn = ({ onClick }) => (
  <button onClick={onClick}
    style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:2,
      background:'transparent', border:'none', borderRadius:4,
      padding:'1px 5px', cursor:'pointer', fontSize:9, fontWeight:700,
      color:'var(--danger)', fontFamily:'inherit', opacity:0.8 }}>
    <X size={8}/> Limpiar
  </button>
)

export default function Sidebar({ filtros, opciones, onChange, onReset, collapsed, onToggle, mobileOpen, isMobile }) {
  const toggle = (key, val) => {
    const actual = filtros[key] || []
    const nuevo  = actual.includes(val)
      ? actual.filter(v => v !== val)
      : [...actual, val]
    onChange({ ...filtros, [key]: nuevo })
  }

  const activeCount =
    (filtros.departamentos?.length || 0) +
    (filtros.modalidades?.length  || 0) +
    (filtros.fecha_inicio ? 1 : 0) +
    (filtros.fecha_fin    ? 1 : 0)

  const hasFecha = filtros.fecha_inicio || filtros.fecha_fin
  const hasDept  = filtros.departamentos?.length > 0
  const hasModal = filtros.modalidades?.length > 0

  const sidebarClass = `sidebar${isMobile ? (mobileOpen ? ' mobile-open' : '') : (collapsed ? '' : '')}`

  if (!isMobile && collapsed) return (
    <aside className="sidebar" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 0', gap:12 }}>
      <button onClick={onToggle} title="Expandir filtros"
        style={{ width:28, height:28, borderRadius:8, border:'1px solid var(--border)',
          background:'var(--surface)', cursor:'pointer', display:'flex', alignItems:'center',
          justifyContent:'center', color:'var(--primary)' }}>
        <ChevronRight size={14}/>
      </button>
      <div style={{ position:'relative' }}>
        <Filter size={14} style={{ color:'var(--muted)' }}/>
        {activeCount > 0 && (
          <span style={{ position:'absolute', top:-5, right:-5, width:14, height:14,
            borderRadius:'50%', background:'var(--primary)', color:'white',
            fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {activeCount}
          </span>
        )}
      </div>
    </aside>
  )

  return (
    <aside className={sidebarClass}>
      <div className="sidebar-inner" style={{ padding: '12px 12px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10,
          paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
          <div style={{ width:26, height:26, borderRadius:7, background:'var(--primary-bg)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Filter size={12} style={{ color:'var(--primary)' }} />
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>Filtros</div>
            <div style={{ fontSize:10, color:'var(--dim)' }}>
              {activeCount > 0 ? `${activeCount} activo${activeCount > 1 ? 's' : ''}` : 'Sin filtros'}
            </div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5 }}>
            {activeCount > 0 && (
              <button onClick={onReset} title="Limpiar todo"
                style={{ display:'flex', alignItems:'center', gap:3,
                  background:'var(--danger-bg)', border:'1px solid #fca5a5', borderRadius:5,
                  padding:'3px 7px', cursor:'pointer', fontSize:10, fontWeight:700,
                  color:'var(--danger)', fontFamily:'inherit' }}>
                <RotateCcw size={8}/> Todo
              </button>
            )}
            <button onClick={onToggle} title="Colapsar"
              style={{ width:24, height:24, borderRadius:6, border:'1px solid var(--border)',
                background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center',
                justifyContent:'center', color:'var(--muted)', flexShrink:0 }}>
              <ChevronLeft size={12}/>
            </button>
          </div>
        </div>

        {/* Período */}
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.7px', textTransform:'uppercase',
          color:'var(--dim)', marginBottom:5, display:'flex', alignItems:'center', gap:3 }}>
          <Calendar size={9}/> Período
          {hasFecha && (
            <ClearBtn onClick={() => onChange({ ...filtros, fecha_inicio: null, fecha_fin: null })}/>
          )}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, marginBottom:8 }}>
          {['fecha_inicio','fecha_fin'].map((k, i) => (
            <div key={k}>
              <div style={{ fontSize:10, color:'var(--muted)', marginBottom:2 }}>{i===0?'Desde':'Hasta'}</div>
              <input className="filter-input" type="date"
                style={{ padding:'5px 7px', fontSize:11 }}
                value={filtros[k] ?? (i === 0 ? opciones?.fecha_min : opciones?.fecha_max) ?? ''}
                min={opciones?.fecha_min || ''}
                max={opciones?.fecha_max || ''}
                onChange={e => onChange({ ...filtros, [k]: e.target.value || null })}
              />
            </div>
          ))}
        </div>

        <div className="sidebar-divider" style={{ margin:'6px 0' }}/>

        {/* Departamentos */}
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.7px', textTransform:'uppercase',
          color:'var(--dim)', marginBottom:5, display:'flex', alignItems:'center', gap:3 }}>
          <MapPin size={9}/>
          Departamentos
          {hasDept && (
            <>
              <span style={{ background:'var(--primary-bg)', color:'var(--primary)', fontSize:9,
                fontWeight:700, padding:'1px 5px', borderRadius:99 }}>
                {filtros.departamentos.length}
              </span>
              <ClearBtn onClick={() => onChange({ ...filtros, departamentos: [] })}/>
            </>
          )}
        </div>
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:'1px', border:'1px solid var(--border)', borderRadius:6,
          padding:4, background:'var(--bg)', marginBottom:8,
        }}>
          {(opciones?.departamentos || []).map(d => {
            const checked = (filtros.departamentos || []).includes(d)
            return (
              <label key={d} style={{
                display:'flex', alignItems:'center', gap:5,
                fontSize:10, cursor:'pointer',
                padding:'3px 5px', borderRadius:4,
                background: checked ? 'var(--primary-bg)' : 'transparent',
                color: checked ? 'var(--primary)' : 'var(--text-soft)',
                fontWeight: checked ? 700 : 400,
                transition:'background .1s',
                userSelect:'none',
                overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
              }}>
                <input type="checkbox" checked={checked}
                  onChange={() => toggle('departamentos', d)}
                  style={{ accentColor:'var(--primary)', flexShrink:0, width:11, height:11 }}/>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {d.length > 10 ? d.slice(0,9)+'.' : d}
                </span>
              </label>
            )
          })}
        </div>

        <div className="sidebar-divider" style={{ margin:'6px 0' }}/>

        {/* Modalidades */}
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.7px', textTransform:'uppercase',
          color:'var(--dim)', marginBottom:5, display:'flex', alignItems:'center', gap:3 }}>
          <Car size={9}/>
          Modalidad
          {hasModal && (
            <>
              <span style={{ background:'var(--primary-bg)', color:'var(--primary)', fontSize:9,
                fontWeight:700, padding:'1px 5px', borderRadius:99 }}>
                {filtros.modalidades.length}
              </span>
              <ClearBtn onClick={() => onChange({ ...filtros, modalidades: [] })}/>
            </>
          )}
        </div>
        <div style={{
          display:'flex', flexDirection:'column', gap:1,
          border:'1px solid var(--border)', borderRadius:6,
          padding:4, background:'var(--bg)', marginBottom:8,
        }}>
          {(opciones?.modalidades || []).map(m => {
            const checked = (filtros.modalidades || []).includes(m)
            return (
              <label key={m} style={{
                display:'flex', alignItems:'center', gap:5,
                fontSize:10, cursor:'pointer',
                padding:'3px 5px', borderRadius:4,
                background: checked ? 'var(--primary-bg)' : 'transparent',
                color: checked ? 'var(--primary)' : 'var(--text-soft)',
                fontWeight: checked ? 700 : 400,
                transition:'background .1s', userSelect:'none',
              }}>
                <input type="checkbox" checked={checked}
                  onChange={() => toggle('modalidades', m)}
                  style={{ accentColor:'var(--primary)', flexShrink:0, width:11, height:11 }}/>
                {m}
              </label>
            )
          })}
        </div>

      </div>
    </aside>
  )
}

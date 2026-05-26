import { useEffect, useState } from 'react'
import { getCV } from './services/api'

const SECCIONES = ['experiencia', 'habilidades', 'proyectos', 'formacion']

function formatFecha(f) {
  if (!f) return 'Actualidad'
  const [y, m] = f.split('-')
  const meses = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${meses[parseInt(m)]} ${y}`
}

export default function App() {
  const [cv,       setCV]       = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [seccion,  setSeccion]  = useState('experiencia')
  const [catFiltro,setCatFiltro]= useState('Todos')

  useEffect(() => {
    getCV()
      .then(setCV)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />
  if (!cv)     return <p style={{textAlign:'center',padding:40}}>Error al cargar datos.</p>

  const { perfil, habilidades, experiencia, formacion, proyectos, redes } = cv

  const categorias = ['Todos', ...new Set(habilidades.map(h => h.categoria))]
  const skillsFiltrados = catFiltro === 'Todos'
    ? habilidades
    : habilidades.filter(h => h.categoria === catFiltro)

  const linkedIn = redes.find(r => r.red === 'LinkedIn')
  const github   = redes.find(r => r.red === 'GitHub')

  return (
    <>
      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-name">{perfil.nombre}</h1>
            <p className="hero-title">{perfil.titulo}</p>
            <p className="hero-desc">{perfil.descripcion}</p>
            <div className="hero-meta">
              {perfil.ubicacion && <span>📍 {perfil.ubicacion}</span>}
              {perfil.telefono  && <span>📞 {perfil.telefono}</span>}
              {perfil.email     && <span>✉️ {perfil.email}</span>}
            </div>
            <div className="hero-actions">
              {perfil.cv_url && (
                <a href={perfil.cv_url} target="_blank" rel="noreferrer" className="btn btn-white">
                  📄 Descargar CV
                </a>
              )}
              {linkedIn && (
                <a href={linkedIn.url} target="_blank" rel="noreferrer" className="btn btn-outline">
                  💼 LinkedIn
                </a>
              )}
              {github && (
                <a href={github.url} target="_blank" rel="noreferrer" className="btn btn-outline">
                  🐙 GitHub
                </a>
              )}
            </div>
          </div>
          {perfil.foto_url && (
            <img src={perfil.foto_url} alt={perfil.nombre} className="hero-avatar" />
          )}
        </div>
      </div>

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          {SECCIONES.map(s => (
            <button
              key={s}
              className={`nav-item ${seccion === s ? 'active' : ''}`}
              onClick={() => setSeccion(s)}
            >
              {{ experiencia:'💼 Experiencia', habilidades:'⚡ Habilidades', proyectos:'🚀 Proyectos', formacion:'🎓 Formación' }[s]}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENIDO */}
      <main>

        {/* ── Experiencia ── */}
        {seccion === 'experiencia' && (
          <section id="experiencia">
            <h2 className="section-title">💼 Experiencia Profesional</h2>
            {experiencia.map(exp => (
              <div key={exp.id} className="exp-item">
                <div className="exp-header">
                  <div>
                    <div className="exp-cargo">{exp.cargo}</div>
                    <div className="exp-empresa">{exp.empresa}</div>
                  </div>
                  <span className={`exp-fecha ${exp.tipo === 'freelance' ? 'exp-tipo-freelance' : ''}`}>
                    {formatFecha(exp.fecha_inicio)} — {formatFecha(exp.fecha_fin)}
                    {exp.tipo === 'freelance' && ' · Freelance'}
                  </span>
                </div>
                {exp.descripcion && <p className="exp-desc">{exp.descripcion}</p>}
                {exp.logros?.length > 0 && (
                  <div className="logros">
                    <div className="logros-title">⭐ Logros clave</div>
                    {exp.logros.map((l, i) => (
                      <div key={i} className="logro-item">{l}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── Habilidades ── */}
        {seccion === 'habilidades' && (
          <section id="habilidades">
            <h2 className="section-title">⚡ Habilidades Técnicas</h2>
            <div className="cat-filter">
              {categorias.map(c => (
                <button
                  key={c}
                  className={`cat-btn ${catFiltro === c ? 'active' : ''}`}
                  onClick={() => setCatFiltro(c)}
                >{c}</button>
              ))}
            </div>
            <div className="skills-grid">
              {skillsFiltrados.map(h => (
                <div key={h.id} className="skill-card">
                  <div className="skill-header">
                    <span className="skill-name">{h.nombre}</span>
                    <span className="skill-pct">{h.nivel}%</span>
                  </div>
                  <div className="skill-bar">
                    <div className="skill-fill" style={{ width: `${h.nivel}%` }} />
                  </div>
                  <span className="skill-cat">{h.categoria}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Proyectos ── */}
        {seccion === 'proyectos' && (
          <section id="proyectos">
            <h2 className="section-title">🚀 Proyectos Destacados</h2>
            <div className="projects-grid">
              {proyectos.map(p => (
                <div key={p.id} className="project-card">
                  <div className="project-icon">
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} width={40} />
                      : '💻'}
                  </div>
                  <div className="project-name">{p.nombre}</div>
                  <p className="project-desc">{p.descripcion}</p>
                  {p.tech_stack?.length > 0 && (
                    <div className="project-tech">
                      {p.tech_stack.map(t => <span key={t} className="tech-tag">{t}</span>)}
                    </div>
                  )}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="project-link">
                      🔗 Ver proyecto →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Formación ── */}
        {seccion === 'formacion' && (
          <section id="formacion">
            <h2 className="section-title">🎓 Formación Académica</h2>
            {formacion.map(f => (
              <div key={f.id} className="edu-card">
                <div className="edu-grado">{f.grado} · {f.fecha_fin}</div>
                <div className="edu-inst">{f.institucion}</div>
                {f.descripcion && <p className="edu-desc">{f.descripcion}</p>}
              </div>
            ))}
          </section>
        )}

      </main>

      <footer>
        <p>
          © 2026 <strong style={{color:'#fff'}}>{perfil.nombre}</strong> ·{' '}
          {redes.map((r, i) => (
            <span key={r.id}>
              {i > 0 && ' · '}
              <a href={r.url} target="_blank" rel="noreferrer">{r.red}</a>
            </span>
          ))}
        </p>
      </footer>
    </>
  )
}

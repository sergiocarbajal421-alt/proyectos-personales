import { ArrowUpRight, Code2 } from 'lucide-react'
import Reveal from './Reveal'

export default function Projects({ proyectos }) {
  return (
    <section className="section" id="proyectos">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-kicker">Portafolio</span>
            <h2 className="section-title">Proyectos <span className="text-gradient">Destacados</span></h2>
            <p className="section-sub">Aplicaciones full stack reales, con backend, base de datos y despliegue en producción — no solo notebooks.</p>
          </div>
        </Reveal>

        <div className="projects-grid">
          {proyectos.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <div className="project-card">
                <div className="project-top">
                  <div className="project-icon">
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} />
                      : <Code2 size={22} />}
                  </div>
                  {p.destacado && <span className="project-featured">Destacado</span>}
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
                    Ver proyecto en vivo <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

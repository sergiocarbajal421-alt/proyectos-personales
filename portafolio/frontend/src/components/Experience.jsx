import { CheckCircle2, FileText } from 'lucide-react'
import Reveal from './Reveal'

function formatFecha(f) {
  if (!f) return 'Actualidad'
  const [y, m] = f.split('-')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${meses[parseInt(m)]} ${y}`
}

export default function Experience({ experiencia }) {
  return (
    <section className="section" id="experiencia">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-kicker">Trayectoria</span>
            <h2 className="section-title">Experiencia <span className="text-gradient">Profesional</span></h2>
            <p className="section-sub">Del dato crudo al impacto en el negocio: pipelines, dashboards y arquitecturas que reemplazan procesos manuales por soluciones medibles.</p>
          </div>
        </Reveal>

        <div className="timeline">
          {experiencia.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.08}>
              <div className="timeline-item">
                <div className="timeline-dot">{exp.empresa.charAt(0)}</div>
                <div className="timeline-card">
                  <div className="timeline-head">
                    <div>
                      <div className="timeline-cargo">{exp.cargo}</div>
                      <div className="timeline-empresa">
                        {exp.empresa}
                        {exp.tipo === 'freelance' && <span className="badge-freelance">· Freelance</span>}
                      </div>
                    </div>
                    <span className="timeline-fecha">
                      {formatFecha(exp.fecha_inicio)} — {formatFecha(exp.fecha_fin)}
                    </span>
                  </div>

                  {exp.descripcion && <p className="timeline-desc">{exp.descripcion}</p>}

                  {exp.logros?.length > 0 && (
                    <div className="logros">
                      {exp.logros.map((l, j) => (
                        <div key={j} className="logro-item">
                          <CheckCircle2 size={15} />
                          <span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {exp.certificado_url && (
                    <a href={exp.certificado_url} target="_blank" rel="noreferrer" className="edu-cert-btn" style={{ marginTop: 10 }}>
                      <FileText size={13} /> Ver certificado
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

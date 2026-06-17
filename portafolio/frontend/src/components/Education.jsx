import { GraduationCap, Sparkle, FileText } from 'lucide-react'
import Reveal from './Reveal'

export default function Education({ formacion }) {
  return (
    <section className="section" id="formacion">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-kicker">Académico</span>
            <h2 className="section-title">Formación <span className="text-gradient">Académica</span></h2>
          </div>
        </Reveal>

        {formacion.map((f, i) => {
          const isDateRange = /^\d{4} - \d{4}$/.test(f.descripcion)
          const fechaDisplay = isDateRange ? f.descripcion : f.fecha_fin
          return (
            <Reveal key={f.id} delay={i * 0.08}>
              <div className="edu-card">
                <div className="edu-icon"><GraduationCap size={24} /></div>
                <div>
                  <div className="edu-grado">{f.grado}</div>
                  <div className="edu-meta">{f.institucion} · {fechaDisplay}</div>
                  {f.descripcion && !isDateRange && (
                    <ul className="edu-desc-list">
                      {f.descripcion.split('\n').filter(Boolean).map((linea, j) => (
                        <li key={j}><Sparkle size={12} /> {linea}</li>
                      ))}
                    </ul>
                  )}
                  {f.certificado_url && (
                    <a href={f.certificado_url} target="_blank" rel="noreferrer" className="edu-cert-btn">
                      <FileText size={13} /> Ver certificado
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

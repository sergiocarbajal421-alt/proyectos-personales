import { motion } from 'framer-motion'
import Reveal from './Reveal'

export default function Skills({ habilidades }) {
  const grupos = []
  habilidades.forEach(h => {
    let g = grupos.find(g => g.categoria === h.categoria)
    if (!g) { g = { categoria: h.categoria, items: [] }; grupos.push(g) }
    g.items.push(h)
  })

  return (
    <section className="section" id="habilidades">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-kicker">Stack técnico</span>
            <h2 className="section-title">Habilidades <span className="text-gradient">Técnicas</span></h2>
            <p className="section-sub">De la ingesta de datos al despliegue en producción: el stack completo para construir productos de datos end-to-end.</p>
          </div>
        </Reveal>

        <div className="skills-wrap">
          {grupos.map((g, i) => (
            <Reveal key={g.categoria} delay={i * 0.06}>
              <div className="skill-group">
                <div className="skill-group-title">{g.categoria}</div>
                {g.items.map(h => (
                  <div key={h.id} className="skill-row">
                    <div className="skill-row-head">
                      <strong>{h.nombre}</strong>
                      <span>{h.nivel}%</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div
                        className="skill-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${h.nivel}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

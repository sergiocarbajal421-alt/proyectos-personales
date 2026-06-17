import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Download, Linkedin, Github, ChevronDown, BadgeCheck } from 'lucide-react'
import MathBg from './MathBg'

const ICONS = { linkedin: Linkedin, github: Github }

export default function Hero({ perfil, redes }) {
  const [nombre, ...resto] = perfil.titulo.split(' & ')

  return (
    <section className="hero" id="inicio">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <MathBg />

      <div className="container hero-inner">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="hero-eyebrow">
              <span className="dot" />
              Disponible para nuevos proyectos
            </span>
          </motion.div>

          <motion.h1
            className="hero-name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05 }}
          >
            {perfil.nombre}
          </motion.h1>

          <motion.p
            className="hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            {nombre}{resto.length > 0 && <> & <span>{resto.join(' & ')}</span></>}
          </motion.p>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            {perfil.descripcion}
          </motion.p>

          <motion.div
            className="hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.26 }}
          >
            {perfil.ubicacion && <span className="hero-meta-item"><MapPin size={14} /> {perfil.ubicacion}</span>}
            {perfil.telefono && <span className="hero-meta-item"><Phone size={14} /> {perfil.telefono}</span>}
            {perfil.email && <span className="hero-meta-item"><Mail size={14} /> {perfil.email}</span>}
          </motion.div>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
          >
            {perfil.cv_url && (
              <a href={perfil.cv_url} target="_blank" rel="noreferrer" className="btn btn-primary">
                <Download size={16} /> Descargar CV
              </a>
            )}
            <a href="#contacto" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }) }}>
              Contactar
            </a>
            <div style={{ display: 'flex', gap: 10, marginLeft: 4 }}>
              {redes.map(r => {
                const Icon = ICONS[r.icono] || Mail
                return (
                  <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="icon-btn" aria-label={r.red}>
                    <Icon size={17} />
                  </a>
                )
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="hero-photo-wrap"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="hero-photo-glow" />
          <div className="hero-photo-ring">
            {perfil.foto_url
              ? <img src={perfil.foto_url} alt={perfil.nombre} />
              : <div style={{ width: '100%', height: '100%', borderRadius: 28, background: 'var(--bg-soft)' }} />}
          </div>
          <div className="hero-photo-badge">
            <BadgeCheck size={20} />
            <div className="hero-photo-badge-text">
              <strong>+3 años</strong>
              <span>en Analítica e Infraestructura</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#experiencia"
        className="scroll-cue"
        onClick={(e) => { e.preventDefault(); document.getElementById('experiencia')?.scrollIntoView({ behavior: 'smooth' }) }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        Scroll
        <ChevronDown size={16} />
      </motion.a>
    </section>
  )
}

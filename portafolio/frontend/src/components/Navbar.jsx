import { useEffect, useState } from 'react'
import { Menu, X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'formacion', label: 'Formación' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Navbar({ initials, cvUrl, theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = LINKS.map(l => document.getElementById(l.id)).filter(Boolean)
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const goTo = (id) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="#inicio" className="navbar-logo" onClick={(e) => { e.preventDefault(); goTo('inicio') }}>
            <span className="navbar-logo-mark">{initials}</span>
            Sergio Carbajal
          </a>

          <nav className="navbar-links">
            {LINKS.map(l => (
              <button
                key={l.id}
                className={`navbar-link ${active === l.id ? 'active' : ''}`}
                onClick={() => goTo(l.id)}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="navbar-cta">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            {cvUrl && (
              <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                <Download size={14} /> CV
              </a>
            )}
            <button className="navbar-burger" onClick={() => setOpen(true)} aria-label="Abrir menú">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="navbar-burger" style={{ position: 'absolute', top: 24, right: 24 }} onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <X size={18} />
            </button>
            {LINKS.map(l => (
              <a key={l.id} onClick={() => goTo(l.id)}>{l.label}</a>
            ))}
            <div style={{ marginTop: 18 }}>
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

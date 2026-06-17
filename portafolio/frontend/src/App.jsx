import { useEffect, useState } from 'react'
import { getCV } from './services/api'
import useTheme from './hooks/useTheme'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Education from './components/Education'
import ContactFooter from './components/ContactFooter'

function aniosExperiencia(experiencia) {
  if (!experiencia?.length) return '—'
  const inicios = experiencia.map(e => new Date(e.fecha_inicio).getTime())
  const desde = new Date(Math.min(...inicios))
  const anios = (Date.now() - desde.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return `+${Math.max(1, Math.floor(anios))}`
}

function getInitials(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [cv, setCV] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getCV()
      .then(data => { sessionStorage.removeItem('cv_reloads'); setCV(data) })
      .catch(() => {
        const n = parseInt(sessionStorage.getItem('cv_reloads') || '0')
        if (n < 3) { sessionStorage.setItem('cv_reloads', n + 1); setTimeout(() => window.location.reload(), 3000) }
        else setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.5 }}>Conectando al servidor…</p>
      </div>
    )
  }

  if (error || !cv) {
    return (
      <div className="error-screen">
        <p>No se pudo cargar la información. Intenta recargar la página.</p>
      </div>
    )
  }

  const { perfil, habilidades, experiencia, formacion, proyectos, redes } = cv

  const stats = [
    { value: aniosExperiencia(experiencia) + ' años', label: 'de experiencia en analítica & datos' },
    { value: '94%', label: 'menos tiempo procesando 10M+ registros' },
    { value: '30%', label: 'reducción de cartera morosa en 4 meses' },
    { value: '20+', label: 'tecnologías de un stack end-to-end' },
  ]

  return (
    <>
      <Navbar initials={getInitials(perfil.nombre)} cvUrl={perfil.cv_url} theme={theme} onToggleTheme={toggle} />
      <Hero perfil={perfil} redes={redes} />
      <Stats items={stats} />
      <Experience experiencia={experiencia} />
      <Projects proyectos={proyectos} />
      <Skills habilidades={habilidades} />
      <Education formacion={formacion} />
      <ContactFooter perfil={perfil} redes={redes} />
    </>
  )
}

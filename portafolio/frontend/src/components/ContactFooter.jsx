import { Mail, Download, Linkedin, Github, MessageCircle } from 'lucide-react'
import Reveal from './Reveal'

const ICONS = { linkedin: Linkedin, github: Github }

export default function ContactFooter({ perfil, redes }) {
  return (
    <>
      <section className="section" id="contacto" style={{ paddingBottom: 60 }}>
        <div className="container">
          <Reveal>
            <div className="contact">
              <h2 className="contact-title">¿Construimos algo <span className="text-gradient">juntos</span>?</h2>
              <p className="contact-sub">
                Especializado en transformar datos en soluciones reales: pipelines ETL, dashboards BI y aplicaciones web end-to-end.
                Si tienes un reto de datos o un proyecto en mente, hablemos.
              </p>
              <div className="contact-actions">
                {perfil.email && (
                  <a href={`mailto:${perfil.email}`} className="btn btn-primary">
                    <Mail size={16} /> {perfil.email}
                  </a>
                )}
                {perfil.telefono && (
                  <a
                    href={`https://wa.me/${perfil.telefono.replace(/[\s+]/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="btn btn-whatsapp"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
                {perfil.cv_url && (
                  <a href={perfil.cv_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                    <Download size={16} /> Descargar CV
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-socials">
            {redes.map(r => {
              const Icon = ICONS[r.icono] || Mail
              return (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="icon-btn" aria-label={r.red}>
                  <Icon size={16} />
                </a>
              )
            })}
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} <strong>{perfil.nombre}</strong> · Construido con React &amp; FastAPI
          </p>
        </div>
      </footer>
    </>
  )
}

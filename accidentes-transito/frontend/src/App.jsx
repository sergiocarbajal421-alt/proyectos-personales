import { useEffect, useState, useMemo } from 'react'
import { getFiltros, getAccidentes } from './services/api'
import KPICards       from './components/KPICards'
import InsightCards   from './components/InsightCards'
import Sidebar        from './components/Sidebar'
import MapaAccidentes from './components/MapaAccidentes'
import { ChartDepartamentos, ChartModalidad, ChartEvolucion, ChartHoras, ChartTreemap, ChartCalendar, ChartRadial, ChartRiskMatrix, ChartMortalidadModalidad } from './components/Charts'
import toast, { Toaster } from 'react-hot-toast'
import { Map, TrendingUp, PieChart, Linkedin, Menu, X } from 'lucide-react'

const PAGES = [
  { id: 'mapa',       Icon: Map,        label: 'Mapa Geográfico'   },
  { id: 'temporal',   Icon: TrendingUp, label: 'Análisis Temporal' },
  { id: 'categorias', Icon: PieChart,   label: 'Categorías'        },
]

const FILTROS_INIT = { fecha_inicio: null, fecha_fin: null, departamentos: [], modalidades: [] }

export default function App() {
  const [page,      setPage]      = useState('mapa')
  const [filtros,   setFiltros]   = useState(FILTROS_INIT)
  const [opciones,  setOpciones]  = useState(null)
  const [rawData,   setRawData]   = useState([])   // todos los registros, cargados una sola vez
  const [loading,     setLoading]     = useState(true)
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [isMobile,    setIsMobile]    = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Carga inicial — una sola llamada
  useEffect(() => {
    Promise.all([
      getFiltros(),
      getAccidentes({ limit: 5000 }),
    ])
      .then(([opts, acc]) => { setOpciones(opts); setRawData(acc) })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])


  // ── Filtrado client-side ──────────────────────────────────────────
  const accidentes = useMemo(() => rawData.filter(a => {
    if (filtros.fecha_inicio && a.fecha < filtros.fecha_inicio) return false
    if (filtros.fecha_fin    && a.fecha > filtros.fecha_fin)    return false
    if (filtros.departamentos?.length && !filtros.departamentos.includes(a.departamento)) return false
    if (filtros.modalidades?.length   && !filtros.modalidades.includes(a.modalidad))      return false
    return true
  }), [rawData, filtros])

  // ── Agregaciones client-side (instantáneas) ───────────────────────
  const kpis = useMemo(() => {
    if (!accidentes.length) return null
    return {
      total_accidentes:        accidentes.length,
      total_fallecidos:        accidentes.reduce((s, a) => s + (a.cant_fallecidos || 0), 0),
      total_heridos:           accidentes.reduce((s, a) => s + (a.cant_heridos    || 0), 0),
      departamentos_afectados: new Set(accidentes.map(a => a.departamento).filter(Boolean)).size,
    }
  }, [accidentes])

  const porDepto = useMemo(() => {
    const m = {}
    accidentes.forEach(a => {
      const d = a.departamento || 'Sin datos'
      if (!m[d]) m[d] = { departamento: d, accidentes: 0, fallecidos: 0, heridos: 0 }
      m[d].accidentes++
      m[d].fallecidos += a.cant_fallecidos || 0
      m[d].heridos    += a.cant_heridos    || 0
    })
    return Object.values(m).sort((a, b) => b.accidentes - a.accidentes)
  }, [accidentes])

  // Categorías — gráficos de departamento: filtran por fecha + modalidad, resaltan por dept
  const accidentesParaDepto = useMemo(() => rawData.filter(a => {
    if (filtros.fecha_inicio && a.fecha < filtros.fecha_inicio) return false
    if (filtros.fecha_fin    && a.fecha > filtros.fecha_fin)    return false
    if (filtros.modalidades?.length && !filtros.modalidades.includes(a.modalidad)) return false
    return true
  }), [rawData, filtros.fecha_inicio, filtros.fecha_fin, filtros.modalidades])

  const porDeptoCategoria = useMemo(() => {
    const m = {}
    accidentesParaDepto.forEach(a => {
      const d = a.departamento || 'Sin datos'
      if (!m[d]) m[d] = { departamento: d, accidentes: 0, fallecidos: 0, heridos: 0 }
      m[d].accidentes++
      m[d].fallecidos += a.cant_fallecidos || 0
      m[d].heridos    += a.cant_heridos    || 0
    })
    return Object.values(m).sort((a, b) => b.accidentes - a.accidentes)
  }, [accidentesParaDepto])

  // Categorías — gráficos de modalidad: filtran por fecha + departamento, resaltan por modal
  const accidentesParaModal = useMemo(() => rawData.filter(a => {
    if (filtros.fecha_inicio && a.fecha < filtros.fecha_inicio) return false
    if (filtros.fecha_fin    && a.fecha > filtros.fecha_fin)    return false
    if (filtros.departamentos?.length && !filtros.departamentos.includes(a.departamento)) return false
    return true
  }), [rawData, filtros.fecha_inicio, filtros.fecha_fin, filtros.departamentos])

  const porModalCategoria = useMemo(() => {
    const m = {}
    accidentesParaModal.forEach(a => {
      const k = a.modalidad || 'Sin datos'
      if (!m[k]) m[k] = { modalidad: k, accidentes: 0, fallecidos: 0 }
      m[k].accidentes++
      m[k].fallecidos += a.cant_fallecidos || 0
    })
    return Object.values(m).sort((a, b) => b.accidentes - a.accidentes)
  }, [accidentesParaModal])

  const porModal = useMemo(() => {
    const m = {}
    accidentes.forEach(a => {
      const k = a.modalidad || 'Sin datos'
      if (!m[k]) m[k] = { modalidad: k, accidentes: 0, fallecidos: 0 }
      m[k].accidentes++
      m[k].fallecidos += a.cant_fallecidos || 0
    })
    return Object.values(m).sort((a, b) => b.accidentes - a.accidentes)
  }, [accidentes])

  const porMes = useMemo(() => {
    const m = {}
    accidentes.forEach(a => {
      if (!a.fecha) return
      const mes = a.fecha.slice(0, 7)
      if (!m[mes]) m[mes] = { mes, accidentes: 0, fallecidos: 0, heridos: 0 }
      m[mes].accidentes++
      m[mes].fallecidos += a.cant_fallecidos || 0
      m[mes].heridos    += a.cant_heridos    || 0
    })
    return Object.values(m).sort((a, b) => a.mes.localeCompare(b.mes))
  }, [accidentes])

  const porHora = useMemo(() => {
    const m = Object.fromEntries(
      Array.from({ length: 24 }, (_, h) => [h, {
        hora: h, label: `${String(h).padStart(2,'0')}:00`,
        accidentes: 0, fallecidos: 0, heridos: 0,
      }])
    )
    accidentes.forEach(a => {
      if (!a.hora) return
      try {
        const h = parseInt(String(a.hora).split(':')[0])
        if (h >= 0 && h < 24) {
          m[h].accidentes++
          m[h].fallecidos += a.cant_fallecidos || 0
          m[h].heridos    += a.cant_heridos    || 0
        }
      } catch {}
    })
    return Array.from({ length: 24 }, (_, h) => m[h])
  }, [accidentes])

  const activeFilters = (filtros.departamentos?.length || 0) + (filtros.modalidades?.length || 0)
    + (filtros.fecha_inicio ? 1 : 0) + (filtros.fecha_fin ? 1 : 0)


  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0',
          borderRadius: '8px', fontSize: '13px', fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,.1)' },
        success: { iconTheme: { primary: '#059669', secondary: '#f0fdf4' } },
        error:   { iconTheme: { primary: '#dc2626', secondary: '#fef2f2' } },
      }} />

      <div className="app">
        <header className="header">
          {isMobile ? (
            <button onClick={() => setMobileOpen(o => !o)}
              style={{ background:'transparent', border:'none', cursor:'pointer',
                color:'white', padding:4, display:'flex', alignItems:'center', flexShrink:0 }}>
              {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          ) : (
            <div className="header-logo">🚦</div>
          )}

          {/* Izquierda: título + logo INEI */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
              Accidentes de Tránsito — Perú
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>
                Análisis 2020–2021 · {kpis ? kpis.total_accidentes.toLocaleString('es-PE') + ' registros' : '...'}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>· Fuente: INEI</span>
            </div>
          </div>

          {/* Centro: navegación */}
          <div style={{
            display: 'flex', gap: 2, flexShrink: 0,
            background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: 3,
          }}>
            {PAGES.map(({ id, Icon, label }) => (
              <button key={id} onClick={() => setPage(id)} style={{
                display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 6,
                padding: isMobile ? '5px 10px' : '5px 14px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: page === id ? 'rgba(255,255,255,.22)' : 'transparent',
                color: page === id ? 'white' : 'rgba(255,255,255,.6)',
                fontWeight: page === id ? 700 : 500,
                fontSize: isMobile ? 11 : 12,
                fontFamily: 'inherit', transition: 'all .15s',
              }}>
                <Icon size={13} />
                {!isMobile && <span>{label}</span>}
              </button>
            ))}
          </div>

{/* Derecha: créditos desarrollador */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '.2px', marginBottom: 2 }}>
                Desarrollado por
              </div>
              <a
                href="https://www.linkedin.com/in/sergiocarbajal/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: 'rgba(255,255,255,.85)', textDecoration: 'none',
                  fontSize: 11, fontWeight: 700,
                  transition: 'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.85)'}
              >
                <Linkedin size={13} style={{ color: '#60a5fa' }} />
                Sergio Carbajal
              </a>
            </div>
          </div>
        </header>

        <div className={`layout${!isMobile && collapsed ? ' collapsed' : ''}`}>

          {/* Overlay oscuro en móvil cuando sidebar está abierto */}
          {isMobile && mobileOpen && (
            <div onClick={() => setMobileOpen(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)',
                zIndex:299, backdropFilter:'blur(2px)' }}/>
          )}

          <Sidebar
            filtros={filtros}
            opciones={opciones}
            onChange={setFiltros}
            onReset={() => setFiltros(FILTROS_INIT)}
            collapsed={!isMobile && collapsed}
            onToggle={() => isMobile ? setMobileOpen(o => !o) : setCollapsed(c => !c)}
            mobileOpen={mobileOpen}
            isMobile={isMobile}
          />

          <main className="main-content" style={{ overflow: isMobile ? 'auto' : 'hidden' }}>
            {loading ? (
              <div className="loading-screen">
                <div className="spinner" />
                <span>Cargando datos de accidentes...</span>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', flex:1,
                minHeight: isMobile ? 'unset' : 0, gap:8 }}>

                <KPICards kpis={kpis} porHora={porHora} />
                <InsightCards kpis={kpis} porDepto={porDepto} porHora={porHora} porMes={porMes} porModal={porModal} />

                {page === 'mapa' && (
                  <div style={{ flex: isMobile ? 'unset' : 1, minHeight:0,
                    display:'grid', gap:12,
                    gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr' }}>
                    <MapaAccidentes datos={accidentes} fillHeight={!isMobile} />
                    <ChartRiskMatrix data={porDeptoCategoria} selectedDeps={filtros.departamentos} fill={!isMobile} />
                  </div>
                )}

                {page === 'temporal' && (
                  <div style={{ flex: isMobile ? 'unset' : 1, minHeight:0,
                    display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ flex: isMobile ? 'unset' : '0 0 48%', minHeight:0,
                      display:'flex', flexDirection:'column' }}>
                      <ChartEvolucion data={porMes} fill={!isMobile} />
                    </div>
                    <div style={{ flex: isMobile ? 'unset' : 1, minHeight:0,
                      display:'grid', gap:12,
                      gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr' }}>
                      <ChartCalendar accidentes={accidentes} fill={!isMobile} />
                      <ChartHoras    data={porHora} accidentes={accidentes} fill={!isMobile} />
                    </div>
                  </div>
                )}

                {page === 'categorias' && (
                  <div style={{ flex: isMobile ? 'unset' : 1, minHeight:0,
                    display:'grid', gap:12,
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gridTemplateRows:    isMobile ? 'auto' : '1fr 1fr' }}>
                    <ChartRadial              data={porModalCategoria} selectedMods={filtros.modalidades} fill={!isMobile} />
                    <ChartDepartamentos       data={porDeptoCategoria} selectedDeps={filtros.departamentos} fill={!isMobile} />
                    <ChartTreemap             data={porDeptoCategoria} selectedDeps={filtros.departamentos} fill={!isMobile} />
                    <ChartMortalidadModalidad data={porModalCategoria} selectedMods={filtros.modalidades} fill={!isMobile} />
                  </div>
                )}

              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

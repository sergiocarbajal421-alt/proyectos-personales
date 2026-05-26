import { useEffect, useState, useCallback } from 'react'
import { getAccidentes, getKPIs, getFiltros, getPorDepartamento, getPorModalidad, getPorMes } from './services/api'
import KPICards      from './components/KPICards'
import Sidebar       from './components/Sidebar'
import MapaAccidentes from './components/MapaAccidentes'
import { ChartDepartamentos, ChartModalidad, ChartEvolucion } from './components/Charts'
import toast from 'react-hot-toast'

const FILTROS_INIT = { fecha_inicio: null, fecha_fin: null, departamentos: [], modalidades: [] }

const toParams = (f) => {
  const p = {}
  if (f.fecha_inicio)           p.fecha_inicio   = f.fecha_inicio
  if (f.fecha_fin)              p.fecha_fin       = f.fecha_fin
  if (f.departamentos?.length)  p.departamentos   = f.departamentos.join(',')
  if (f.modalidades?.length)    p.modalidades     = f.modalidades.join(',')
  return p
}

export default function App() {
  const [tab,       setTab]       = useState('mapa')
  const [filtros,   setFiltros]   = useState(FILTROS_INIT)
  const [opciones,  setOpciones]  = useState(null)
  const [kpis,      setKpis]      = useState(null)
  const [accidentes,setAccidentes]= useState([])
  const [porDepto,  setPorDepto]  = useState([])
  const [porModal,  setPorModal]  = useState([])
  const [porMes,    setPorMes]    = useState([])
  const [loading,   setLoading]   = useState(true)

  // Cargar opciones de filtro una sola vez
  useEffect(() => {
    getFiltros()
      .then(setOpciones)
      .catch(() => toast.error('Error al cargar filtros'))
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const p = toParams(filtros)
    try {
      const [k, acc, dep, mod, mes] = await Promise.all([
        getKPIs(p),
        getAccidentes({ ...p, limit: 3000 }),
        getPorDepartamento(p),
        getPorModalidad(p),
        getPorMes(p),
      ])
      setKpis(k)
      setAccidentes(acc)
      setPorDepto(dep)
      setPorModal(mod)
      setPorMes(mes)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="app">
      <header className="header">
        <span style={{ fontSize: 28 }}>🚦</span>
        <div>
          <h1>Sistema Analítico de Accidentes de Tránsito</h1>
          <span className="sub">Perú 2020–2021 · Datos INEI</span>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 12, opacity: .7 }}>
          Desarrollado por Sergio Carbajal
        </span>
      </header>

      <div className="layout">
        <Sidebar
          filtros={filtros}
          opciones={opciones}
          onChange={setFiltros}
          onReset={() => setFiltros(FILTROS_INIT)}
        />

        <main className="main-content">
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : (
            <>
              <KPICards kpis={kpis} />

              <div className="tabs">
                {[
                  { id: 'mapa',       label: '🗺️ Mapa' },
                  { id: 'temporal',   label: '📈 Temporal' },
                  { id: 'categorias', label: '🎯 Categorías' },
                ].map(t => (
                  <button
                    key={t.id}
                    className={`tab ${tab === t.id ? 'active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >{t.label}</button>
                ))}
              </div>

              {tab === 'mapa' && (
                <MapaAccidentes datos={accidentes} />
              )}

              {tab === 'temporal' && (
                <div className="charts-row">
                  <ChartEvolucion data={porMes} />
                </div>
              )}

              {tab === 'categorias' && (
                <div className="charts-row">
                  <ChartDepartamentos data={porDepto} />
                  <ChartModalidad     data={porModal} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

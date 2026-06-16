import { useEffect, useState, useCallback } from 'react'
import { getLotes, getResumen } from './services/api'
import MetricCards   from './components/MetricCards'
import LotesTable    from './components/LotesTable'
import LetrasPanel   from './components/LetrasPanel'
import VentaModal    from './components/VentaModal'
import AnalyticaView      from './components/AnalyticaView'
import PlanoLotizacion   from './components/PlanoLotizacion'
import toast, { Toaster } from 'react-hot-toast'
import confetti from 'canvas-confetti'
import {
  Building2, ReceiptText,
  TrendingUp, Plus, RefreshCw, Layers, AlertTriangle, Map,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const fmt = n =>
  new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(n ?? 0)

const NAV = [
  { id: 'analitica', label: 'Analítica',  Icon: TrendingUp      },
  { id: 'plano',     label: 'Plano',      Icon: Map             },
  { id: 'lotes',     label: 'Lotes',      Icon: Building2       },
  { id: 'cuotas',    label: 'Cuotas',     Icon: ReceiptText     },
]

export default function App() {
  const [lotes,            setLotes]            = useState([])
  const [resumen,          setResumen]          = useState(null)
  const [loteSeleccionado, setLoteSeleccionado] = useState(null)
  const [showVentaModal,   setShowVentaModal]   = useState(false)
  const [loading,          setLoading]          = useState(true)
  const [refreshing,       setRefreshing]       = useState(false)
  const [view,             setView]             = useState('analitica')
  const [viewKey,          setViewKey]          = useState(0)
  const [sidebarOpen,      setSidebarOpen]      = useState(true)
  const [nuevoLoteVendido, setNuevoLoteVendido] = useState(null)

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else        setLoading(true)
    try {
      const [l, r] = await Promise.all([getLotes(), getResumen()])
      setLotes(l); setResumen(r)
      if (silent) toast.success('Datos actualizados', { duration: 1800 })
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* Auto-colapsa sidebar en pantallas angostas (split-screen, tablet) */
  useEffect(() => {
    const check = () => { if (window.innerWidth < 960) setSidebarOpen(false) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Auto-selecciona el primer lote vendido al entrar a Cuotas */
  useEffect(() => {
    if (view === 'cuotas' && !loteSeleccionado && lotes.length > 0) {
      const primero = lotes.find(l => l.estado === 'Vendido')
      if (primero) setLoteSeleccionado(primero.lote)
    }
  }, [view, lotes, loteSeleccionado])

  const lotesAtrasados = lotes.filter(l => l.monto_atrasado > 0)
  const montoVencido   = lotesAtrasados.reduce((s, l) => s + l.monto_atrasado, 0)

  /* navigate and reset panel */
  const goTo = (id) => {
    setView(id)
    setViewKey(k => k + 1)
    if (!['lotes', 'plano', 'cuotas'].includes(id)) setLoteSeleccionado(null)
  }

  const today = new Date().toLocaleDateString('es-PE', {
    weekday:'long', year:'numeric', month:'long', day:'numeric',
  })

  /* ─── View titles ─── */
  const viewMeta = {
    lotes:     { title: 'Cartera de Lotes',        sub: `${lotes.length} lotes en total · ${today}` },
    plano:     { title: 'Plano de Lotización',     sub: 'Manzanas D · E · F — interactivo' },
    cuotas:    { title: 'Gestión de Cuotas',       sub: 'Selecciona un lote para ver sus cuotas' },
    analitica: { title: 'Analítica e Informes',    sub: 'Visualización del estado de la cartera' },
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fef2f2' } },
        }}
      />

      <div className="app" style={{ gridTemplateColumns: `${sidebarOpen ? 240 : 60}px 1fr` }}>
        {/* ════ SIDEBAR ════ */}
        <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Layers size={19} color="white" />
            </div>
            <div className="logo-text">
              <h2>Terra Lotes</h2>
              <span>Gestión Inmobiliaria</span>
            </div>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
            >
              {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </button>
          </div>

          {/* Navigation */}
          <div className="sidebar-section">
            <div className="sidebar-label">Menú</div>
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`nav-item ${view === id ? 'active' : ''}`}
                onClick={() => goTo(id)}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon size={15} className="nav-icon" />
                <span className="nav-text">{label}</span>
                {id === 'lotes' && lotesAtrasados.length > 0 && (
                  <span className="nav-badge">{lotesAtrasados.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="sidebar-divider" />

          {/* Quick Stats — oculto cuando sidebar está contraído */}
          {sidebarOpen && resumen && (
            <div className="sidebar-section">
              <div className="sidebar-label">Resumen</div>
              <div className="sidebar-stats">
                {[
                  ['Vendidos',   `${resumen.total_vendidos} lotes`],
                  ['Disponibles',`${resumen.total_disponibles} lotes`],
                  ['Recaudado',  fmt(resumen.total_recaudado)],
                  ['Vencido',    fmt(resumen.total_atrasado)],
                ].map(([k, v]) => (
                  <div key={k} className="sidebar-stat">
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarOpen && <div className="sidebar-divider" />}

          {/* CTA */}
          <div className="sidebar-cta">
            <button className="btn btn-primary" onClick={() => setShowVentaModal(true)}
              title={!sidebarOpen ? 'Nueva Venta' : undefined}>
              <Plus size={14} />
              <span className="nav-text">Nueva Venta</span>
            </button>
          </div>

          {/* User */}
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">SC</div>
              <div className="user-info">
                <strong>Sergio Carbajal</strong>
                <span>Administrador</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main className="main">
          {loading ? (
            <div className="skeleton-screen">
              <div className="skeleton-kpis">
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton skeleton-kpi" />)}
              </div>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton skeleton-row" />)}
              <div className="skeleton-half">
                <div className="skeleton skeleton-chart" />
                <div className="skeleton skeleton-chart" />
              </div>
            </div>
          ) : (
            <div key={viewKey} className="view-fade">
              {/* Alert — oculto en Analítica para dar espacio a los gráficos */}
              {lotesAtrasados.length > 0 && view !== 'analitica' && (
                <div className="alert-banner">
                  <AlertTriangle size={15} />
                  <span>
                    <strong>{lotesAtrasados.length}</strong> lote{lotesAtrasados.length > 1 ? 's' : ''} con
                    pagos vencidos · Total: <strong>{fmt(montoVencido)}</strong>
                  </span>
                </div>
              )}

              {/* Page Header */}
              <div className="page-header">
                <div>
                  <h1>{viewMeta[view].title}</h1>
                  <p style={{ textTransform: 'capitalize' }}>{viewMeta[view].sub}</p>
                </div>
                <div className="header-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                  >
                    <RefreshCw size={12} style={{ animation: refreshing ? 'spin .7s linear infinite' : 'none' }} />
                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </div>

              {/* ── VIEW: Lotes — only table rows scroll ── */}
              {view === 'lotes' && (
                <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, gap:16 }}>
                  <MetricCards resumen={resumen} lotes={lotes} />
                  <LotesTable
                    lotes={lotes}
                    onSelectLote={id => { setLoteSeleccionado(id); setView('cuotas'); }}
                    onNuevaVenta={() => setShowVentaModal(true)}
                    loteSeleccionado={loteSeleccionado}
                    fullWidth
                    fillHeight
                  />
                </div>
              )}

              {/* ── VIEW: Plano de Lotización ── */}
              {view === 'plano' && (
                <PlanoLotizacion
                  lotes={lotes}
                  onSelectLote={id => { setLoteSeleccionado(id); setView('cuotas') }}
                  loteSeleccionado={loteSeleccionado}
                  nuevoLoteVendido={nuevoLoteVendido}
                />
              )}

              {/* ── VIEW: Cuotas — panels fill full height ── */}
              {view === 'cuotas' && (
                <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:16, flex:1, minHeight:0, overflow:'hidden' }}>
                  {/* Left: lotes vendidos list */}
                  <div className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
                    <div className="card-header">
                      <div className="card-title">
                        <Building2 size={14} /> Lotes vendidos
                        <span className="card-badge">{lotes.filter(l=>l.estado==='Vendido').length}</span>
                      </div>
                    </div>
                    <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
                      {lotes.filter(l => l.estado === 'Vendido').map(l => (
                        <button
                          key={l.lote}
                          onClick={() => setLoteSeleccionado(l.lote)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '10px 16px',
                            background: loteSeleccionado === l.lote ? '#eff6ff' : 'transparent',
                            border: 'none',
                            borderLeft: loteSeleccionado === l.lote ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all .12s',
                            textAlign: 'left',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight:700, fontSize:13, color: loteSeleccionado===l.lote ? 'var(--primary)' : 'var(--text)' }}>
                              {l.lote}
                            </div>
                            <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{l.cliente}</div>
                          </div>
                          {l.monto_atrasado > 0 && (
                            <span className="pill atrasado" style={{ fontSize:10 }}>
                              <span className="pill-dot" /> Vencido
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: letras detail */}
                  <LetrasPanel
                    loteSeleccionado={loteSeleccionado}
                    resumenLote={lotes.find(l => l.lote === loteSeleccionado)}
                    onClose={() => setLoteSeleccionado(null)}
                    onRefresh={fetchData}
                  />
                </div>
              )}

              {/* ── VIEW: Analítica ── */}
              {view === 'analitica' && (
                <div className="view-scroll">
                  <AnalyticaView lotes={lotes} resumen={resumen} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showVentaModal && (
        <VentaModal
          lotes={lotes}
          onClose={() => setShowVentaModal(false)}
          onSuccess={(loteId) => {
          fetchData()
          setShowVentaModal(false)
          setNuevoLoteVendido(loteId)
          goTo('plano')
          // Confetti tras la transición de vista
          setTimeout(() => confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.45 },
            scalar: 1.1,
            colors: ['#16a34a','#22c55e','#86efac','#2563eb','#7c3aed','#fbbf24','#fff'],
          }), 380)
          // Limpiar highlight tras 5.5 s
          setTimeout(() => setNuevoLoteVendido(null), 5500)
        }}
        />
      )}
    </>
  )
}

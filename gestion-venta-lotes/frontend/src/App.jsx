import { useEffect, useState, useCallback } from 'react'
import { getLotes, getResumen } from './services/api'
import MetricCards from './components/MetricCards'
import LotesTable  from './components/LotesTable'
import LetrasPanel from './components/LetrasPanel'
import VentaModal  from './components/VentaModal'
import Charts      from './components/Charts'
import toast from 'react-hot-toast'

export default function App() {
  const [lotes,            setLotes]            = useState([])
  const [resumen,          setResumen]          = useState(null)
  const [loteSeleccionado, setLoteSeleccionado] = useState(null)
  const [showVentaModal,   setShowVentaModal]   = useState(false)
  const [loading,          setLoading]          = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [lotesData, resumenData] = await Promise.all([getLotes(), getResumen()])
      setLotes(lotesData)
      setResumen(resumenData)
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const lotesAtrasados = lotes.filter(l => l.monto_atrasado > 0)
  const resumenLoteSeleccionado = lotes.find(l => l.lote === loteSeleccionado)

  return (
    <div className="app">
      <header className="header">
        <span style={{ fontSize: 24 }}>📋</span>
        <h1>Gestión de Venta de Lotes</h1>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
          Desarrollado por Sergio Carbajal
        </span>
      </header>

      <main className="main">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : (
          <>
            {/* Alerta de atrasados */}
            {lotesAtrasados.length > 0 && (
              <div className="alert warning">
                ⚠️ {lotesAtrasados.length} lote{lotesAtrasados.length > 1 ? 's' : ''} con pagos vencidos
              </div>
            )}

            {/* KPIs */}
            <MetricCards resumen={resumen} />

            {/* Grid: tabla + letras */}
            <div className="grid-layout">
              <LotesTable
                lotes={lotes}
                onSelectLote={setLoteSeleccionado}
                onNuevaVenta={() => setShowVentaModal(true)}
              />
              <LetrasPanel
                loteSeleccionado={loteSeleccionado}
                resumenLote={resumenLoteSeleccionado}
              />
            </div>

            {/* Charts */}
            <Charts lotes={lotes} />
          </>
        )}
      </main>

      {/* Modal nueva venta */}
      {showVentaModal && (
        <VentaModal
          lotes={lotes}
          onClose={() => setShowVentaModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}

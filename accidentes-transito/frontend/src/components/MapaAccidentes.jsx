import { useState, useMemo, useRef, useCallback } from 'react'
import DeckGL from '@deck.gl/react'
import { TileLayer } from '@deck.gl/geo-layers'
import { BitmapLayer, ScatterplotLayer } from '@deck.gl/layers'
import { HexagonLayer, HeatmapLayer } from '@deck.gl/aggregation-layers'

/* ── Tile styles ── */
const TILES = {
  voyager: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@1x.png',
  dark:    'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@1x.png',
  light:   'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@1x.png',
}

/* ── Modos de visualización ── */
const MODES = [
  { id: 'hex',     emoji: '⬡', label: 'Hex 3D'  },
  { id: 'heat',    emoji: '🔥', label: 'Calor'   },
  { id: 'scatter', emoji: '·',  label: 'Puntos'  },
]

/* ── Presets de cámara ── */
const CAMERA_PRESETS = [
  { id: 'top',      label: '⬆ Cenital',  pitch:  0, bearing:   0, zoom: 5.2 },
  { id: 'tilt',     label: '◤ 45°',      pitch: 45, bearing: -10, zoom: 5.2 },
  { id: 'side',     label: '◥ 60°',      pitch: 60, bearing: -20, zoom: 5.0 },
  { id: 'dramatic', label: '⬡ Dramático', pitch: 72, bearing: -35, zoom: 4.8 },
]

const BASE_COORD = { longitude: -76.5, latitude: -9.2 }

const COLOR_RANGE = [
  [29,  78, 216, 220],
  [37, 118, 187, 220],
  [101,163,  13, 220],
  [217,119,   6, 220],
  [220, 38,  38, 220],
  [255,  50,  50, 255],
]

const fmtDate = d => {
  if (!d) return '—'
  const [y,m,day] = d.split('-')
  const M = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${+day} ${M[+m]} ${y}`
}

export default function MapaAccidentes({ datos, fillHeight }) {
  const [modo,      setModo]      = useState('hex')
  const [camPreset, setCamPreset] = useState('tilt')
  const [tileStyle, setTileStyle] = useState('voyager')
  const [rotating,  setRotating]  = useState(false)
  const [hovered,   setHovered]   = useState(null)
  const [viewState, setViewState] = useState({
    ...BASE_COORD, zoom: 5.2, pitch: 45, bearing: -10,
  })
  const rotRef = useRef(null)

  const puntos = useMemo(() => datos.filter(d => d.latitud && d.longitud), [datos])

  /* ── Auto-rotación ── */
  const toggleRotate = useCallback(() => {
    if (rotating) {
      cancelAnimationFrame(rotRef.current)
      setRotating(false)
    } else {
      setRotating(true)
      const spin = () => {
        setViewState(v => ({ ...v, bearing: (v.bearing + 0.25) % 360 }))
        rotRef.current = requestAnimationFrame(spin)
      }
      rotRef.current = requestAnimationFrame(spin)
    }
  }, [rotating])

  /* ── Cambiar cámara ── */
  const applyCamera = (preset) => {
    setCamPreset(preset.id)
    setViewState(v => ({
      ...v,
      pitch:   preset.pitch,
      bearing: preset.bearing,
      zoom:    preset.zoom,
      transitionDuration: 800,
    }))
  }

  /* ── Tile layer ── */
  const tileLayer = new TileLayer({
    id: 'tiles',
    data: TILES[tileStyle],
    minZoom: 0, maxZoom: 19, tileSize: 256,
    renderSubLayers: props => {
      const { west, south, east, north } = props.tile.bbox
      return new BitmapLayer(props, {
        data: null, image: props.data,
        bounds: [west, south, east, north],
      })
    },
  })

  /* ── Capas de datos ── */
  const hexLayer = new HexagonLayer({
    id: 'hex',
    data: puntos,
    getPosition:         d => [d.longitud, d.latitud],
    getColorWeight:      d => d.cant_fallecidos > 0 ? 12 : d.cant_heridos > 0 ? 4 : 1,
    getElevationWeight:  d => d.cant_fallecidos > 0 ? 8  : d.cant_heridos > 0 ? 3 : 1,
    colorAggregation: 'SUM', elevationAggregation: 'SUM',
    radius: 18000, elevationScale: 60, extruded: true,
    pickable: true, opacity: 0.85,
    colorRange: COLOR_RANGE, coverage: 0.88,
    onHover: info => setHovered(info.object ? { ...info, type: 'hex' } : null),
  })

  const heatLayer = new HeatmapLayer({
    id: 'heat',
    data: puntos,
    getPosition: d => [d.longitud, d.latitud],
    getWeight:   d => d.cant_fallecidos > 0 ? 10 : d.cant_heridos > 0 ? 3 : 1,
    aggregation: 'SUM', radiusPixels: 35, intensity: 1.2, threshold: 0.03,
    colorRange: [[29,78,216],[37,118,187],[101,163,13],[217,119,6],[220,38,38],[255,50,50]],
  })

  const scatterLayer = new ScatterplotLayer({
    id: 'scatter',
    data: puntos,
    getPosition:  d => [d.longitud, d.latitud],
    getFillColor: d => d.cant_fallecidos > 0 ? [220,38,38,210]
                     : d.cant_heridos > 0    ? [217,119,6,180]
                     :                         [59,130,246,140],
    getRadius:   d => d.cant_fallecidos > 0 ? 4000 : 2800,
    radiusUnits: 'meters', pickable: true,
    onHover: info => setHovered(info.object ? { ...info, type: 'scatter' } : null),
  })

  const dataLayer = modo === 'hex' ? hexLayer : modo === 'heat' ? heatLayer : scatterLayer
  const layers = [tileLayer, dataLayer]

  /* ── Stats ── */
  const fallecidos  = puntos.filter(d => d.cant_fallecidos > 0).length
  const conHeridos  = puntos.filter(d => d.cant_heridos > 0 && d.cant_fallecidos === 0).length
  const sinVictimas = puntos.length - fallecidos - conHeridos

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:8,
      ...(fillHeight ? { flex:1, minHeight:0 } : {}) }}>

      {/* ── Header ── */}
      <div className="card-head" style={{ flexWrap:'wrap', gap:6 }}>
        <span className="card-dot" style={{ background:'#2563eb' }}/>
        <span className="card-title">Distribución Geográfica</span>
        <span className="card-badge">{puntos.length.toLocaleString('es-PE')} puntos</span>

        {/* Modos */}
        <div style={{ display:'flex', gap:2, background:'#f1f5f9', borderRadius:8, padding:2 }}>
          {MODES.map(({ id, emoji, label }) => (
            <button key={id} onClick={() => setModo(id)} style={{
              padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer',
              background: modo===id ? 'white' : 'transparent',
              color: modo===id ? 'var(--primary)' : 'var(--muted)',
              fontWeight: modo===id ? 700 : 500, fontSize:11, fontFamily:'inherit',
              boxShadow: modo===id ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
              transition:'all .15s',
            }}>{emoji} {label}</button>
          ))}
        </div>

        {/* Tile style */}
        <div style={{ display:'flex', gap:2, background:'#f1f5f9', borderRadius:8, padding:2 }}>
          {[
            { id:'voyager', label:'🗺 Normal' },
            { id:'dark',    label:'🌑 Oscuro' },
            { id:'light',   label:'⬜ Limpio'  },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setTileStyle(id)} style={{
              padding:'4px 9px', borderRadius:6, border:'none', cursor:'pointer',
              background: tileStyle===id ? 'white' : 'transparent',
              color: tileStyle===id ? 'var(--text)' : 'var(--muted)',
              fontWeight: tileStyle===id ? 700 : 400, fontSize:11, fontFamily:'inherit',
              boxShadow: tileStyle===id ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
              transition:'all .15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── Mapa deck.gl ── */}
      <div style={{ position:'relative', ...(fillHeight ? { flex:1, minHeight:0 } : { height:580 }), borderRadius:10,
        overflow:'hidden', border:'1px solid var(--border)' }}>

        <DeckGL
          viewState={viewState}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
          controller={true}
          layers={layers}
          style={{ borderRadius:10 }}
        />

        {/* ── Controles de cámara (overlay) ── */}
        <div style={{
          position:'absolute', top:10, right:10, zIndex:10,
          display:'flex', flexDirection:'column', gap:4,
        }}>
          {/* Presets de cámara */}
          <div style={{
            background:'rgba(255,255,255,.92)', backdropFilter:'blur(8px)',
            borderRadius:10, padding:4, boxShadow:'0 2px 12px rgba(0,0,0,.15)',
            display:'flex', flexDirection:'column', gap:2,
          }}>
            <div style={{ fontSize:8, fontWeight:700, color:'var(--dim)', textAlign:'center',
              textTransform:'uppercase', letterSpacing:'.5px', padding:'2px 4px' }}>
              Cámara
            </div>
            {CAMERA_PRESETS.map(preset => (
              <button key={preset.id} onClick={() => applyCamera(preset)} style={{
                padding:'5px 10px', borderRadius:7, border:'none', cursor:'pointer',
                background: camPreset===preset.id ? 'var(--primary)' : 'transparent',
                color: camPreset===preset.id ? 'white' : 'var(--text-soft)',
                fontSize:11, fontWeight: camPreset===preset.id ? 700 : 500,
                fontFamily:'inherit', whiteSpace:'nowrap', textAlign:'left',
                transition:'all .15s',
              }}>{preset.label}</button>
            ))}
          </div>

          {/* Auto-rotación */}
          <button onClick={toggleRotate} style={{
            background: rotating ? '#dc2626' : 'rgba(255,255,255,.92)',
            backdropFilter:'blur(8px)',
            color: rotating ? 'white' : 'var(--text-soft)',
            border:'none', borderRadius:10, padding:'7px 10px',
            fontSize:11, fontWeight:700, cursor:'pointer',
            boxShadow:'0 2px 12px rgba(0,0,0,.15)',
            fontFamily:'inherit', whiteSpace:'nowrap',
            transition:'all .2s',
          }}>
            {rotating ? '⏹ Detener' : '🔄 Rotar 360°'}
          </button>

          {/* Reset vista */}
          <button onClick={() => {
            setViewState({ ...BASE_COORD, zoom:5.2, pitch:45, bearing:-10, transitionDuration:600 })
            setCamPreset('tilt')
          }} style={{
            background:'rgba(255,255,255,.92)', backdropFilter:'blur(8px)',
            color:'var(--muted)', border:'none', borderRadius:10,
            padding:'6px 10px', fontSize:10, fontWeight:600,
            cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,.15)',
            fontFamily:'inherit', transition:'all .15s',
          }}>
            ⌂ Reset
          </button>
        </div>

        {/* Tooltip hover */}
        {hovered && (
          <div style={{
            position:'absolute',
            left: Math.min(hovered.x + 14, 560),
            top:  Math.min(hovered.y + 14, 360),
            background:'white', border:'1px solid #e2e8f0', borderRadius:10,
            padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,.15)',
            fontSize:12, fontFamily:'Inter,sans-serif',
            pointerEvents:'none', zIndex:20, minWidth:160,
          }}>
            {hovered.type === 'hex' ? (
              <>
                <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:6 }}>
                  {hovered.object.count} accidentes
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'3px 10px', fontSize:11 }}>
                  <span style={{ color:'#94a3b8' }}>💀 Fallecidos</span>
                  <span style={{ fontWeight:700, color:'#dc2626' }}>
                    {hovered.object.points?.filter(p => p.source.cant_fallecidos > 0).length || 0}
                  </span>
                  <span style={{ color:'#94a3b8' }}>🤕 Heridos</span>
                  <span style={{ fontWeight:600, color:'#d97706' }}>
                    {hovered.object.points?.reduce((s,p) => s+(p.source.cant_heridos||0), 0) || 0}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>
                  {hovered.object.distrito}, {hovered.object.provincia}
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:5 }}>{hovered.object.departamento}</div>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'2px 8px', fontSize:11 }}>
                  <span style={{ color:'#94a3b8' }}>Fecha</span><span>{fmtDate(hovered.object.fecha)}</span>
                  <span style={{ color:'#94a3b8' }}>Tipo</span><span>{hovered.object.modalidad || '—'}</span>
                  {hovered.object.cant_fallecidos > 0 && <>
                    <span style={{ color:'#dc2626', fontWeight:600 }}>Fallecidos</span>
                    <span style={{ color:'#dc2626', fontWeight:700 }}>{hovered.object.cant_fallecidos}</span>
                  </>}
                  {hovered.object.cant_heridos > 0 && <>
                    <span style={{ color:'#d97706', fontWeight:600 }}>Heridos</span>
                    <span style={{ color:'#d97706', fontWeight:700 }}>{hovered.object.cant_heridos}</span>
                  </>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Hint interacción */}
        <div style={{
          position:'absolute', bottom:10, left:10, zIndex:5,
          background:'rgba(0,0,0,.45)', color:'white',
          borderRadius:6, padding:'4px 10px', fontSize:10,
          pointerEvents:'none', backdropFilter:'blur(4px)',
        }}>
          🖱 Arrastra · Scroll zoom · Click derecho + drag = rotar
        </div>
      </div>

      {/* ── Leyenda ── */}
      {modo === 'hex' || modo === 'heat' ? (
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <div style={{ width:140, height:7, borderRadius:4,
            background:'linear-gradient(to right,#1d4ed8,#16a34a,#d97706,#dc2626,#ff3232)' }}/>
          <span style={{ fontSize:10, color:'var(--muted)' }}>Baja densidad</span>
          <span style={{ fontSize:10, color:'var(--muted)', marginLeft:'auto' }}>Alta densidad / Fatales</span>
        </div>
      ) : (
        <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
          {[
            { color:'#dc2626', label:`Con fallecidos (${fallecidos.toLocaleString('es-PE')})` },
            { color:'#d97706', label:`Solo heridos (${conHeridos.toLocaleString('es-PE')})` },
            { color:'#3b82f6', label:`Sin víctimas (${sinVictimas.toLocaleString('es-PE')})` },
          ].map(({ color, label }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:5,
              fontSize:11, color:'var(--muted)' }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:color }}/>
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useMemo, useRef } from 'react'

// ─── Escala y geometría ───────────────────────────────────────────────────────
const S   = 9      // px/metro
const GAP = 2      // gap entre lotes adyacentes

// Tipos de calle
const AV = { road: 7*S, verd: 2.2*S }     // Avenida principal
const CL = { road: 5*S, verd: 1.6*S }     // Calle/Av. sur
const JR = { road: 4*S, verd: 1.4*S }     // Jirón lateral (vertical en este layout)

const totalH = st => Math.round(st.road + 2*st.verd)
const AV_H   = totalH(AV)   // altura corredor avenida (horizontal)
const CL_H   = totalH(CL)
const JR_W   = totalH(JR)   // ancho corredor jirón   (vertical)

const PARK_W   = 16*S    // ancho parque = 16 m
const MEDIANERA = 5
const MARG      = 28

// ─── LAYOUT HORIZONTAL ────────────────────────────────────────────────────────
// Orden de columnas (izquierda → derecha):
// Jr.Pal | Manzana-D | Jr | Park1 | Jr | Manzana-E | Jr | Manzana-F | Jr | Park2 | Jr.Olivos
// Park1 entre D y E,  Park2 a la derecha de F → dispersión asimétrica

const COL_ORDER = [
  { type: 'jr',      id: 'pal',  label: 'JR. LAS PALMERAS' },
  { type: 'manzana', id: 'D' },
  { type: 'jr',      id: 'de' },
  { type: 'park',    id: 0 },
  { type: 'jr',      id: 'ep' },
  { type: 'manzana', id: 'E' },
  { type: 'jr',      id: 'ef' },
  { type: 'manzana', id: 'F' },
  { type: 'jr',      id: 'fp' },
  { type: 'park',    id: 1 },
  { type: 'jr',      id: 'olv', label: 'JR. LOS OLIVOS' },
]

const LAYOUT = [
  { manzana: 'D', rowN: ['D-1','D-2','D-3','D-4','D-5'],   rowS: ['D-10','D-9','D-8','D-7','D-6'] },
  { manzana: 'E', rowN: ['E-1','E-2','E-3','E-4','E-5'],   rowS: ['E-10','E-9','E-8','E-7','E-6'] },
  { manzana: 'F', rowN: ['F-1','F-2','F-3','F-4','F-5'],   rowS: ['F-10','F-9','F-8','F-7','F-6'] },
]

const PARK_NAMES = ['PARQUE\nMUNICIPAL', 'PARQUE\nINFANTIL']
const PARK_BG    = ['#bbf7d0', '#a7f3d0']
const PARK_BD    = ['#6ee7b7', '#10b981']

const COLORS = {
  Disponible: { fill:'#f0fdf4', stroke:'#16a34a', hover:'#dcfce7', text:'#15803d' },
  Vendido:    { fill:'#eff6ff', stroke:'#2563eb', hover:'#dbeafe', text:'#1d4ed8' },
  Atrasado:   { fill:'#fef2f2', stroke:'#dc2626', hover:'#fee2e2', text:'#b91c1c' },
}

const STATUS_LABELS = { Atrasado: 'Vendido · Atraso' }

const fmt = n =>
  n != null ? `S/. ${new Intl.NumberFormat('es-PE',{maximumFractionDigits:0}).format(n)}` : '—'
const fmtDate = d => {
  if (!d) return '—'
  const [y,m,day] = d.split('-')
  const M=['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${+day} ${M[+m]} ${y}`
}
const seeded = n => (Math.abs(Math.sin(n*127.1+311.7))*43758.5)%1

// ─── Micro-SVG ────────────────────────────────────────────────────────────────
const Pole = ({x,y}) => (
  <g>
    <rect x={x-5} y={y-2} width={10} height={3} rx={1.5} fill="#94a3b8"/>
    <line x1={x} y1={y+1} x2={x} y2={y+9} stroke="#9ca3af" strokeWidth={1.5}/>
    <circle cx={x-3.5} cy={y-3.5} r={2.3} fill="#fbbf24" opacity={0.9}/>
    <circle cx={x+3.5} cy={y-3.5} r={2.3} fill="#fbbf24" opacity={0.9}/>
  </g>
)

const Tree = ({x,y,r=7,seed=1}) => {
  const h = 130+Math.round(seeded(seed)*20)
  return (
    <g>
      <circle cx={x} cy={y} r={r}     fill={`hsl(${h},55%,33%)`} opacity={0.65}/>
      <circle cx={x} cy={y} r={r*0.6} fill={`hsl(${h},65%,44%)`} opacity={0.5}/>
    </g>
  )
}

const Zebra = ({x,y,w,sh,n=4}) => {
  const sw = Math.max(2, w/(n*2-1))
  return (
    <g opacity={0.5}>
      {Array.from({length:n}).map((_,i)=>(
        <rect key={i} x={x+i*sw*2} y={y} width={sw} height={sh} fill="white"/>
      ))}
    </g>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PlanoLotizacion({ lotes, onSelectLote, loteSeleccionado, nuevoLoteVendido }) {
  const [hoveredId,    setHoveredId]    = useState(null)
  const [tooltipXY,    setTooltipXY]    = useState({x:0,y:0})
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroMz,     setFiltroMz]     = useState('')
  const containerRef = useRef(null)

  const loteMap = useMemo(()=>{
    const m={}; lotes.forEach(l=>{m[l.lote]=l}); return m
  },[lotes])

  const getStatus = id => {
    const l = loteMap[id]; if(!l) return 'Disponible'
    return l.monto_atrasado>0?'Atrasado':l.estado
  }
  const isVisible = id => {
    if(filtroEstado && getStatus(id)!==filtroEstado) return false
    if(filtroMz && id.split('-')[0]!==filtroMz) return false
    return true
  }

  // ── Ancho de manzana (todas iguales: 54m) ─────────────────────────────────
  const manzanaW = useMemo(()=>
    LAYOUT[0].rowN.reduce((s,id)=>s+(loteMap[id]?.frente||10)*S+GAP,-GAP)
  ,[loteMap])

  // ── Calcular X de cada columna ────────────────────────────────────────────
  const colX = useMemo(()=>{
    const xs={}; let x=MARG
    COL_ORDER.forEach(col=>{
      xs[col.type==='manzana'?`mz-${col.id}`:col.type==='park'?`pk-${col.id}`:`jr-${col.id}`]=x
      if(col.type==='jr')      x+=JR_W
      else if(col.type==='park') x+=PARK_W
      else                     x+=manzanaW
    })
    xs['total']=x+MARG
    return xs
  },[manzanaW])

  // ── Y de cada manzana (layout horizontal: todos en el mismo bloque) ────────
  const Y0      = MARG+AV_H             // inicio del bloque de lotes
  const maxBlockH = useMemo(()=>{
    return LAYOUT.reduce((max,{rowN,rowS})=>{
      const nh=(loteMap[rowN[0]]?.fondo||10)*S
      const sh=(loteMap[rowS[0]]?.fondo||10)*S
      return Math.max(max, nh+MEDIANERA+sh)
    },0)
  },[loteMap])

  // ── Posiciones de lotes ───────────────────────────────────────────────────
  // Altura uniforme para TODOS los lotes: llena el bloque exactamente sin huecos.
  // (El tamaño visual no refleja la data — prioridad es plano limpio sin espacios vacíos)
  const lotH = useMemo(()=> Math.floor((maxBlockH - MEDIANERA) / 2), [maxBlockH])

  const svgLayout = useMemo(()=>{
    const pos={}
    const northY = Y0
    const southY = Y0 + lotH + MEDIANERA
    LAYOUT.forEach(({manzana,rowN,rowS})=>{
      const xStart = colX[`mz-${manzana}`]
      // ancho uniforme: divide manzanaW entre N lotes (sin gaps sobrantes)
      const nLotes = rowN.length
      const lotW   = Math.floor((manzanaW - (nLotes - 1) * GAP) / nLotes)
      let x = xStart
      rowN.forEach(id=>{
        pos[id] = { x, y: northY, w: lotW, h: lotH }
        x += lotW + GAP
      })
      x = xStart
      rowS.forEach(id=>{
        pos[id] = { x, y: southY, w: lotW, h: lotH }
        x += lotW + GAP
      })
    })
    return pos
  },[loteMap,colX,Y0,maxBlockH,lotH,manzanaW])

  const svgW = colX['total']||1800
  const svgH = MARG+AV_H+maxBlockH+CL_H+MARG

  // ── Stats manzanas ────────────────────────────────────────────────────────
  const mzStats = useMemo(()=>{
    const s={}
    lotes.forEach(l=>{
      const mz=l.lote.split('-')[0]
      if(!s[mz]) s[mz]={total:0,vendidos:0,disponibles:0,atrasados:0}
      s[mz].total++
      if(l.monto_atrasado>0) s[mz].atrasados++
      else if(l.estado==='Vendido') s[mz].vendidos++
      else s[mz].disponibles++
    })
    return s
  },[lotes])

  const hData     = hoveredId?loteMap[hoveredId]:null
  const TOOLTIP_W = 232
  const POLE_STEP = Math.round(18*S)

  const onMouseMove = e=>{
    const r=containerRef.current?.getBoundingClientRect()
    if(r) setTooltipXY({x:e.clientX-r.left,y:e.clientY-r.top})
  }

  return (
    <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',gap:10}}>

      {/* ── Mini-stats ── */}
      <div style={{display:'flex',gap:10,flexShrink:0}}>
        {LAYOUT.map(({manzana})=>{
          const s=mzStats[manzana]||{}
          const ocp=s.total>0?Math.round((s.vendidos+s.atrasados)/s.total*100):0
          const sel=filtroMz===manzana
          return(
            <div key={manzana} onClick={()=>setFiltroMz(sel?'':manzana)}
              style={{flex:1,padding:'10px 14px',borderRadius:10,cursor:'pointer',
                border:sel?'2px solid var(--primary)':'1px solid var(--border)',
                background:sel?'#eff6ff':'white',transition:'all .15s'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:13,fontWeight:800}}>Manzana {manzana}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--primary)'}}>{ocp}%</span>
              </div>
              <div style={{height:4,borderRadius:2,background:'#e2e8f0',marginBottom:6,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${ocp}%`,borderRadius:2,background:'var(--primary)'}}/>
              </div>
              <div style={{display:'flex',gap:8,fontSize:10,flexWrap:'wrap'}}>
                <span style={{color:'#2563eb',fontWeight:600}}>● {s.vendidos} vendidos</span>
                <span style={{color:'#16a34a',fontWeight:600}}>● {s.disponibles} libres</span>
                {s.atrasados>0&&<span style={{color:'#dc2626',fontWeight:600}}>⚠ {s.atrasados} mora</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Filtros + leyenda ── */}
      <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0,flexWrap:'wrap'}}>
        <select value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)}
          style={{padding:'4px 10px',borderRadius:6,border:'1px solid var(--border)',fontSize:12,fontFamily:'inherit',background:'white'}}>
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Vendido">Vendido</option>
          <option value="Atrasado">Vendido · Atraso</option>
        </select>
        {(filtroEstado||filtroMz)&&(
          <button onClick={()=>{setFiltroEstado('');setFiltroMz('')}}
            style={{padding:'4px 10px',borderRadius:6,border:'1px solid #fca5a5',
              background:'#fef2f2',color:'#dc2626',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            ✕ Limpiar
          </button>
        )}
        <div style={{display:'flex',gap:12,marginLeft:'auto',alignItems:'center',flexWrap:'wrap'}}>
          {Object.entries(COLORS).map(([st,c])=>(
            <div key={st} onClick={()=>setFiltroEstado(filtroEstado===st?'':st)}
              style={{display:'flex',alignItems:'center',gap:4,fontSize:11,cursor:'pointer',
                opacity:filtroEstado&&filtroEstado!==st?0.3:1}}>
              <div style={{width:12,height:12,borderRadius:3,background:c.fill,border:`2px solid ${c.stroke}`}}/>
              <span style={{color:'var(--muted)'}}>{STATUS_LABELS[st] ?? st}</span>
            </div>
          ))}
          <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11}}>
            <div style={{width:12,height:12,borderRadius:3,background:'#fffbeb',border:'2px solid #f59e0b'}}/>
            <span style={{color:'var(--muted)'}}>Esquina</span>
          </div>
        </div>
      </div>

      {/* ── SVG Plano — fill completo con margen uniforme ── */}
      <div ref={containerRef}
        style={{flex:1,minHeight:0,overflow:'hidden',borderRadius:12,
          background:'#e2e8f0',position:'relative',padding:14}}>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="none"
          style={{display:'block',width:'100%',height:'100%',fontFamily:'inherit',userSelect:'none'}}
          onMouseMove={onMouseMove}
        >
          {/* Fondo del mapa */}
          <rect width={svgW} height={svgH} fill="#f8fafc"/>

          {/* ── Avenida Norte (Av. Los Robles) ── */}
          <rect x={0} y={MARG} width={svgW} height={AV_H} fill="#dde1e7"/>
          <rect x={0} y={MARG} width={svgW} height={AV.verd} fill="#d1d5db"/>
          <rect x={0} y={MARG+AV_H-AV.verd} width={svgW} height={AV.verd} fill="#d1d5db"/>
          <line x1={0} y1={MARG+AV.verd} x2={svgW} y2={MARG+AV.verd} stroke="#c4cbd4" strokeWidth={0.6}/>
          <line x1={0} y1={MARG+AV_H-AV.verd} x2={svgW} y2={MARG+AV_H-AV.verd} stroke="#c4cbd4" strokeWidth={0.6}/>
          <line x1={0} y1={MARG+AV_H/2} x2={svgW} y2={MARG+AV_H/2}
            stroke="white" strokeWidth={1.5} strokeDasharray="14,8" opacity={0.7}/>
          <text x={svgW/2} y={MARG+AV_H/2+3.5} textAnchor="middle"
            fontSize={9} fill="#94a3b8" fontWeight={700} letterSpacing={2}>AV. LOS ROBLES</text>
          {/* señal 30 */}
          <g transform={`translate(${MARG+JR_W+14},${MARG+AV_H*0.3})`}>
            <circle cx={0} cy={0} r={9} fill="white" stroke="#ef4444" strokeWidth={2.5}/>
            <text x={0} y={3.5} textAnchor="middle" fontSize={7.5} fontWeight={900} fill="#ef4444">30</text>
          </g>
          {/* flechas de dirección avenida */}
          {[0.25,0.5,0.75].map((fx,i)=>(
            <g key={i}>
              <polygon points={`${svgW*fx},${MARG+AV_H*0.33} ${svgW*fx-5},${MARG+AV_H*0.45} ${svgW*fx+5},${MARG+AV_H*0.45}`}
                fill="white" opacity={0.35}/>
              <polygon points={`${svgW*fx},${MARG+AV_H*0.67} ${svgW*fx-5},${MARG+AV_H*0.55} ${svgW*fx+5},${MARG+AV_H*0.55}`}
                fill="white" opacity={0.35}/>
            </g>
          ))}

          {/* ── Avenida Sur ── */}
          {(()=>{
            const sy=Y0+maxBlockH
            return(
              <g>
                <rect x={0} y={sy} width={svgW} height={CL_H} fill="#e5e7eb"/>
                <rect x={0} y={sy} width={svgW} height={CL.verd} fill="#d1d5db"/>
                <rect x={0} y={sy+CL_H-CL.verd} width={svgW} height={CL.verd} fill="#d1d5db"/>
                <line x1={0} y1={sy+CL.verd} x2={svgW} y2={sy+CL.verd} stroke="#c4cbd4" strokeWidth={0.6}/>
                <line x1={0} y1={sy+CL_H-CL.verd} x2={svgW} y2={sy+CL_H-CL.verd} stroke="#c4cbd4" strokeWidth={0.6}/>
                <line x1={0} y1={sy+CL_H/2} x2={svgW} y2={sy+CL_H/2}
                  stroke="white" strokeWidth={1} strokeDasharray="9,6" opacity={0.7}/>
                <text x={svgW/2} y={sy+CL_H/2+3.5} textAnchor="middle"
                  fontSize={8} fill="#94a3b8" fontWeight={700} letterSpacing={2}>AV. SUR</text>
              </g>
            )
          })()}

          {/* ── Jirones verticales ── */}
          {COL_ORDER.filter(c=>c.type==='jr').map(col=>{
            const key=`jr-${col.id}`
            const x=colX[key]
            return(
              <g key={key}>
                <rect x={x} y={0} width={JR_W} height={svgH} fill="#e5e7eb"/>
                <rect x={x} y={0} width={JR.verd} height={svgH} fill="#d1d5db"/>
                <rect x={x+JR_W-JR.verd} y={0} width={JR.verd} height={svgH} fill="#d1d5db"/>
                <line x1={x+JR_W/2} y1={0} x2={x+JR_W/2} y2={svgH}
                  stroke="white" strokeWidth={1} strokeDasharray="8,6" opacity={0.45}/>
                {col.label&&(
                  <text x={x+JR_W/2} y={svgH/2} textAnchor="middle"
                    fontSize={7} fill="#9ca3af" fontWeight={700} letterSpacing={1.5}
                    transform={`rotate(-90,${x+JR_W/2},${svgH/2})`}>{col.label}</text>
                )}
                {/* Cruces peatonales en av. norte y sur */}
                <Zebra x={x} y={MARG+AV.verd+1} w={JR_W} sh={AV_H-AV.verd*2-2} n={3}/>
                <Zebra x={x} y={Y0+maxBlockH+CL.verd+1} w={JR_W} sh={CL_H-CL.verd*2-2} n={3}/>
              </g>
            )
          })}

          {/* ── Postes en veredas de ambas avenidas ── */}
          {Array.from({length:Math.ceil((svgW-2*MARG)/POLE_STEP)+1}).map((_,pi)=>{
            const px=MARG+pi*POLE_STEP
            if(px>svgW-MARG) return null
            return(
              <g key={pi}>
                <Pole x={px} y={MARG+AV.verd*0.5}/>
                <Pole x={px} y={MARG+AV_H-AV.verd*0.5}/>
                <Pole x={px} y={Y0+maxBlockH+CL.verd*0.5}/>
                <Pole x={px} y={Y0+maxBlockH+CL_H-CL.verd*0.5}/>
              </g>
            )
          })}

          {/* ── Parques ── */}
          {COL_ORDER.filter(c=>c.type==='park').map(col=>{
            const x=colX[`pk-${col.id}`]
            const y=Y0, h=maxBlockH
            const tg=[
              [0.15,0.15],[0.5,0.1],[0.85,0.15],
              [0.1,0.5],[0.9,0.5],
              [0.15,0.85],[0.5,0.9],[0.85,0.85],
              [0.33,0.33],[0.67,0.33],[0.33,0.67],[0.67,0.67],
            ]
            return(
              <g key={`park-${col.id}`}>
                <rect x={x} y={y} width={PARK_W} height={h} fill={PARK_BG[col.id]}/>
                <rect x={x} y={y} width={PARK_W} height={h} fill="none" stroke={PARK_BD[col.id]} strokeWidth={1.5}/>
                {/* camino en cruz */}
                <rect x={x+4} y={y+h/2-5} width={PARK_W-8} height={10} fill="#d1d5db" opacity={0.7} rx={4}/>
                <rect x={x+PARK_W/2-5} y={y+4} width={10} height={h-8} fill="#d1d5db" opacity={0.7} rx={4}/>
                {/* fuente */}
                <circle cx={x+PARK_W/2} cy={y+h/2} r={8} fill="#bae6fd" stroke="#7dd3fc" strokeWidth={1.5} opacity={0.85}/>
                <circle cx={x+PARK_W/2} cy={y+h/2} r={3.5} fill="#38bdf8" opacity={0.8}/>
                {/* árboles */}
                {tg.map(([rx,ry],ti)=>{
                  const onP=Math.abs(rx-0.5)<0.13||Math.abs(ry-0.5)<0.13
                  if(onP) return null
                  const r=[8,6,6,7,5,7,6,8,5,6,5,7][ti]||6
                  return<Tree key={ti} x={x+rx*PARK_W} y={y+ry*h} r={r} seed={col.id*100+ti}/>
                })}
                {/* bancas */}
                {[[0.7,0.25],[0.2,0.72]].map(([bx,by],bi)=>(
                  <g key={bi}>
                    <rect x={x+bx*PARK_W-8} y={y+by*h-2} width={16} height={5} rx={2} fill="#a78bfa" opacity={0.65}/>
                    <rect x={x+bx*PARK_W-8} y={y+by*h-5} width={16} height={3} rx={1} fill="#c4b5fd" opacity={0.5}/>
                  </g>
                ))}
                {/* letrero */}
                <rect x={x+4} y={y+5} width={PARK_W-8} height={17} rx={3} fill="white" opacity={0.65}/>
                {PARK_NAMES[col.id].split('\n').map((line,li)=>(
                  <text key={li} x={x+PARK_W/2} y={y+13+li*8}
                    textAnchor="middle" fontSize={7} fill="#065f46" fontWeight={800}>{line}</text>
                ))}
              </g>
            )
          })}

          {/* ── Árboles en las veredas de las manzanas (Norte y Sur) ── */}
          {LAYOUT.map(({manzana,rowN,rowS})=>{
            const x0=colX[`mz-${manzana}`]
            const count=Math.floor(manzanaW/(5*S))
            return Array.from({length:count}).map((_,ti)=>{
              const tx=x0+(ti+0.5)*(manzanaW/count)
              return(
                <g key={`vt-${manzana}-${ti}`}>
                  <Tree x={tx} y={MARG+AV_H-AV.verd*0.5} r={4} seed={ti+manzana.charCodeAt(0)}/>
                  <Tree x={tx} y={Y0+maxBlockH+CL.verd*0.5} r={4} seed={ti+manzana.charCodeAt(0)+50}/>
                </g>
              )
            })
          })}

          {/* ── Medianeras entre filas N/S de cada manzana ── */}
          {LAYOUT.map(({manzana})=>{
            const x0  = colX[`mz-${manzana}`]
            const medY = Y0 + lotH + MEDIANERA/2
            return(
              <g key={`med-${manzana}`}>
                <text x={x0-7} y={Y0+maxBlockH/2+4} textAnchor="end"
                  fontSize={10} fontWeight={800} fill="#94a3b8" letterSpacing={3}>{manzana}</text>
                <line x1={x0} y1={medY} x2={x0+manzanaW} y2={medY}
                  stroke="#d1d5db" strokeWidth={0.8} strokeDasharray="5,4"/>
              </g>
            )
          })}

          {/* ── Lotes ── */}
          {Object.entries(svgLayout).map(([id,{x,y,w,h:lh}])=>{
            const data=loteMap[id]; if(!data) return null
            const st=getStatus(id)
            const col=COLORS[st]||COLORS.Disponible
            const isHov=hoveredId===id, isSel=loteSeleccionado===id
            const isEsq=data.tipo_lote==='Esquina'
            const canClick=data.estado==='Vendido'
            const visible=isVisible(id)
            const isNew=id===nuevoLoteVendido
            const cx=x+w/2, cy=y+lh/2
            return(
              <g key={id} style={{cursor:canClick?'pointer':'default'}}
                onMouseEnter={()=>setHoveredId(id)}
                onMouseLeave={()=>setHoveredId(null)}
                onClick={()=>canClick&&onSelectLote(id)}>

                {/* ── Anillos pulsantes para lote recién vendido ── */}
                {isNew&&(
                  <>
                    <rect className="lot-sold-ring-3"
                      x={x-16} y={y-16} width={w+32} height={lh+32} rx={10}
                      fill="none" stroke="#16a34a" strokeWidth={1}
                      style={{transformOrigin:`${cx}px ${cy}px`,transformBox:'fill-box'}}/>
                    <rect className="lot-sold-ring-2"
                      x={x-9} y={y-9} width={w+18} height={lh+18} rx={7}
                      fill="none" stroke="#16a34a" strokeWidth={1.8}
                      style={{transformOrigin:`${cx}px ${cy}px`,transformBox:'fill-box'}}/>
                    <rect className="lot-sold-ring-1"
                      x={x-4} y={y-4} width={w+8} height={lh+8} rx={5}
                      fill="#dcfce7" stroke="#16a34a" strokeWidth={2.5}
                      style={{transformOrigin:`${cx}px ${cy}px`,transformBox:'fill-box'}}/>
                  </>
                )}

                {isEsq&&visible&&(
                  <rect x={x-2.5} y={y-2.5} width={w+5} height={lh+5} rx={5}
                    fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.6}/>
                )}
                <rect x={x} y={y} width={w} height={lh} rx={3}
                  fill={isNew?'#bbf7d0':(isHov?col.hover:col.fill)}
                  stroke={isNew?'#16a34a':(isSel?'#f59e0b':col.stroke)}
                  strokeWidth={isNew?3:(isSel?2.5:1.5)}
                  opacity={!visible?0.12:1}/>
                <text x={cx} y={cy-(lh>70?10:3)} textAnchor="middle"
                  fontSize={Math.min(11,w/4.5)} fontWeight={700}
                  fill={!visible?'#d1d5db':isNew?'#15803d':col.text}>{id}</text>
                {lh>64&&(
                  <text x={cx} y={cy+4} textAnchor="middle"
                    fontSize={7.5} fill={!visible?'#d1d5db':'#94a3b8'}>
                    {data.frente??10}×{data.fondo??10}m
                  </text>
                )}
                {lh>64&&(
                  <text x={cx} y={cy+15} textAnchor="middle"
                    fontSize={7} fontWeight={600}
                    fill={!visible?'#d1d5db':data.precio>0?col.text:'#94a3b8'}>
                    {data.precio>0?`S/.${(data.precio/1000).toFixed(0)}k`:'Libre'}
                  </text>
                )}
                {data.estado==='Vendido'&&visible&&!isNew&&(
                  <circle cx={x+w-5.5} cy={y+5.5} r={3.5} fill={col.stroke}/>
                )}

                {/* ── Badge "✓ VENDIDO" flotante ── */}
                {isNew&&(
                  <g className="lot-sold-badge"
                    style={{transformOrigin:`${cx}px ${y-18}px`,transformBox:'fill-box'}}>
                    <rect x={cx-28} y={y-30} width={56} height={17} rx={8.5}
                      fill="#16a34a"
                      style={{filter:'drop-shadow(0 3px 8px rgba(22,163,74,0.65))'}}/>
                    <text x={cx} y={y-18} textAnchor="middle"
                      fontSize={9} fontWeight={900} fill="white" letterSpacing={0.5}>
                      ✓ VENDIDO
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* ── Brújula ── */}
          <g transform={`translate(${svgW-38},38)`}>
            <circle cx={0} cy={0} r={20} fill="white" stroke="#e2e8f0" strokeWidth={1.5}
              style={{filter:'drop-shadow(0 2px 5px rgba(0,0,0,.1))'}}/>
            <polygon points="0,-14 4.5,2 0,-1 -4.5,2" fill="#ef4444"/>
            <polygon points="0,14 4.5,-2 0,1 -4.5,-2" fill="#94a3b8"/>
            <circle cx={0} cy={0} r={2.5} fill="#475569"/>
            <text x={0} y={-17} textAnchor="middle" fontSize={7.5} fontWeight={900} fill="#ef4444">N</text>
            <text x={0} y={24}  textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#94a3b8">S</text>
          </g>

          {/* ── Escala ── */}
          <g transform={`translate(${MARG+JR_W},${svgH-18})`}>
            {[0,1,2].map(i=>(
              <rect key={i} x={i*10*S} y={-4} width={10*S} height={8}
                fill={i%2===0?'#475569':'white'} stroke="#475569" strokeWidth={0.8}/>
            ))}
            {[0,10,20,30].map(m=>(
              <text key={m} x={m*S} y={-8} textAnchor="middle" fontSize={7} fill="#64748b">{m}m</text>
            ))}
          </g>

          {/* ── Cartel ── */}
          <g transform={`translate(${MARG+4},${MARG+4})`}>
            <rect x={0} y={0} width={90} height={30} rx={5} fill="#1d4ed8"/>
            <text x={45} y={12} textAnchor="middle" fontSize={7} fill="white" fontWeight={700} letterSpacing={1}>URBANIZACIÓN</text>
            <text x={45} y={24} textAnchor="middle" fontSize={10} fill="white" fontWeight={900}>TERRA LOTES</text>
          </g>

        </svg>

        {/* ── Tooltip ── */}
        {hoveredId&&hData&&(()=>{
          const cw=containerRef.current?.offsetWidth??600
          const ch=containerRef.current?.offsetHeight??500
          const flipX=tooltipXY.x+TOOLTIP_W+16>cw
          const flipY=tooltipXY.y+290>ch
          return(
            <div style={{
              position:'absolute',
              left:flipX?tooltipXY.x-TOOLTIP_W-14:tooltipXY.x+14,
              top:flipY?tooltipXY.y-290:tooltipXY.y+8,
              width:TOOLTIP_W, background:'white',
              border:'1px solid var(--border)', borderRadius:10,
              padding:'12px 14px',
              boxShadow:'0 8px 32px rgba(0,0,0,.14)',
              zIndex:400, pointerEvents:'none',
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                <span style={{fontSize:15,fontWeight:800}}>Lote {hoveredId}</span>
                {(()=>{const st=getStatus(hoveredId);const c=COLORS[st]||COLORS.Disponible;return(
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,
                    background:c.fill,color:c.text,border:`1px solid ${c.stroke}`}}>{STATUS_LABELS[st] ?? st}</span>
                )})()}
              </div>
              {hData.cliente&&(
                <div style={{fontSize:12,color:'var(--muted)',marginBottom:8,fontWeight:500}}>
                  👤 {hData.cliente}
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:'4px 10px',fontSize:11}}>
                <span style={{color:'var(--dim)'}}>Tipo</span>
                <span style={{fontWeight:600}}>{hData.tipo_lote||'Intermedio'}</span>
                <span style={{color:'var(--dim)'}}>Dimensiones</span>
                <span style={{fontWeight:600}}>{hData.frente??10} × {hData.fondo??10} m</span>
                <span style={{color:'var(--dim)'}}>Área</span>
                <span>{hData.area??((hData.frente||10)*(hData.fondo||10))} m²</span>
                {hData.orientacion&&<><span style={{color:'var(--dim)'}}>Orientación</span><span>{hData.orientacion}</span></>}
                {hData.precio>0&&<>
                  <span style={{color:'var(--dim)',marginTop:3}}>Precio</span>
                  <span style={{fontWeight:700,color:'var(--primary)',marginTop:3}}>{fmt(hData.precio)}</span>
                  <span style={{color:'var(--dim)'}}>Cobrado</span>
                  <span style={{fontWeight:600,color:'#16a34a'}}>{fmt(hData.monto_pagado)}</span>
                  <span style={{color:'var(--dim)'}}>Pendiente</span>
                  <span style={{fontWeight:600,color:'#d97706'}}>{fmt(hData.monto_pendiente)}</span>
                </>}
                {hData.monto_atrasado>0&&<>
                  <span style={{color:'var(--dim)'}}>⚠ Vencido</span>
                  <span style={{fontWeight:700,color:'#dc2626'}}>{fmt(hData.monto_atrasado)}</span>
                </>}
                {hData.fecha_contrato&&<><span style={{color:'var(--dim)'}}>Contrato</span><span>{fmtDate(hData.fecha_contrato)}</span></>}
                {hData.dni&&<><span style={{color:'var(--dim)'}}>DNI</span><span>{hData.dni}</span></>}
              </div>
              {hData.observaciones&&(
                <div style={{marginTop:8,padding:'6px 8px',borderRadius:6,
                  background:'#fffbeb',fontSize:10,color:'#92400e',fontStyle:'italic',lineHeight:1.5}}>
                  {hData.observaciones}
                </div>
              )}
              {hData.estado==='Vendido'&&(
                <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--border)',
                  fontSize:10,color:'var(--primary)',fontWeight:700}}>
                  Clic para ver cuotas y documentos →
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

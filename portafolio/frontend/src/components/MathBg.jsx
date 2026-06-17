const CHARTS = [
  // Línea de ventas con área rellena
  ({ s }) => (
    <svg width={s} height={s * 0.65} viewBox="0 0 120 78">
      <path d="M0,65 L15,58 L30,52 L45,42 L55,48 L70,32 L85,20 L100,14 L120,8 L120,70 L0,70Z"
        fill="currentColor" opacity="0.15"/>
      <path d="M0,65 L15,58 L30,52 L45,42 L55,48 L70,32 L85,20 L100,14 L120,8"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {[[0,65],[30,52],[55,48],[70,32],[100,14],[120,8]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="currentColor"/>
      ))}
      <line x1="0" y1="70" x2="120" y2="70" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <text x="0" y="77" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="sans-serif">Ene</text>
      <text x="95" y="77" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="sans-serif">Dic</text>
    </svg>
  ),

  // Barras mensuales comparativas
  ({ s }) => (
    <svg width={s} height={s * 0.75} viewBox="0 0 110 82">
      {[[8,55],[22,38],[36,62],[50,30],[64,70],[78,45],[92,58]].map(([x,h],i) => (
        <g key={i}>
          <rect x={x} y={72-h} width="10" height={h} fill="currentColor" rx="2" opacity={0.35 + i*0.06}/>
          <rect x={x+1} y={72-h*0.7} width="8" height={h*0.7} fill="currentColor" rx="1" opacity={0.5 + i*0.04}/>
        </g>
      ))}
      <line x1="4" y1="72" x2="106" y2="72" stroke="currentColor" strokeWidth="1.5" opacity="0.45"/>
      <line x1="4" y1="10" x2="4" y2="72" stroke="currentColor" strokeWidth="1.5" opacity="0.45"/>
      <text x="30" y="10" fontSize="7.5" fill="currentColor" opacity="0.7" fontFamily="sans-serif" fontWeight="600">Ventas Mensuales</text>
    </svg>
  ),

  // Donut chart (participación)
  ({ s }) => {
    const slices = [
      { pct: 0.38, op: 0.75 },
      { pct: 0.27, op: 0.55 },
      { pct: 0.20, op: 0.40 },
      { pct: 0.15, op: 0.25 },
    ]
    let angle = -Math.PI / 2
    const cx = 45, cy = 45, r = 38, inner = 22
    const paths = slices.map(({ pct, op }) => {
      const sweep = pct * 2 * Math.PI
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle)
      const x2 = cx + r * Math.cos(angle + sweep), y2 = cy + r * Math.sin(angle + sweep)
      const xi1 = cx + inner * Math.cos(angle), yi1 = cy + inner * Math.sin(angle)
      const xi2 = cx + inner * Math.cos(angle + sweep), yi2 = cy + inner * Math.sin(angle + sweep)
      const large = sweep > Math.PI ? 1 : 0
      const d = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large},0 ${xi1},${yi1}Z`
      angle += sweep
      return { d, op }
    })
    return (
      <svg width={s} height={s} viewBox="0 0 90 90">
        {paths.map(({ d, op }, i) => (
          <path key={i} d={d} fill="currentColor" opacity={op} stroke="white" strokeWidth="1.5"/>
        ))}
        <text x={cx} y={cy+2} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.8" fontFamily="sans-serif" fontWeight="600">38%</text>
        <text x={cx} y={cy+11} textAnchor="middle" fontSize="6.5" fill="currentColor" opacity="0.6" fontFamily="sans-serif">Share</text>
      </svg>
    )
  },

  // KPI card con flecha de tendencia
  ({ s }) => (
    <svg width={s} height={s * 0.6} viewBox="0 0 110 66">
      <rect x="0" y="0" width="110" height="66" rx="8" fill="currentColor" opacity="0.08"/>
      <text x="10" y="18" fontSize="7.5" fill="currentColor" opacity="0.65" fontFamily="sans-serif">Ingresos Totales</text>
      <text x="10" y="40" fontSize="20" fill="currentColor" opacity="0.85" fontFamily="sans-serif" fontWeight="700">S/ 84K</text>
      <path d="M80,45 L92,32 L96,36 L106,24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      <text x="72" y="58" fontSize="7.5" fill="currentColor" opacity="0.6" fontFamily="sans-serif">▲ +12.4%</text>
    </svg>
  ),

  // Gráfico de área apilada
  ({ s }) => (
    <svg width={s} height={s * 0.65} viewBox="0 0 120 78">
      <path d="M0,68 L20,58 L40,52 L60,45 L80,38 L100,28 L120,20 L120,68Z"
        fill="currentColor" opacity="0.30"/>
      <path d="M0,68 L20,63 L40,60 L60,55 L80,50 L100,42 L120,35 L120,68Z"
        fill="currentColor" opacity="0.18"/>
      <path d="M0,68 L20,65 L40,63 L60,60 L80,57 L100,52 L120,48 L120,68Z"
        fill="currentColor" opacity="0.10"/>
      <line x1="0" y1="68" x2="120" y2="68" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <text x="35" y="12" fontSize="7.5" fill="currentColor" opacity="0.7" fontFamily="sans-serif" fontWeight="600">Crecimiento por Canal</text>
    </svg>
  ),

  // Embudo de ventas (funnel)
  ({ s }) => (
    <svg width={s} height={s} viewBox="0 0 100 110">
      {[
        [5, 0, 90, 20, 'Leads', '1,200', 0.55],
        [15, 24, 70, 20, 'Propuestas', '480', 0.45],
        [25, 48, 50, 20, 'Negoc.', '210', 0.35],
        [35, 72, 30, 20, 'Cierre', '84', 0.25],
      ].map(([x, y, w, h, label, val, op]) => (
        <g key={label}>
          <rect x={x} y={y} width={w} height={h-2} fill="currentColor" rx="3" opacity={op}/>
          <text x={50} y={y+13} textAnchor="middle" fontSize="7.5" fill="currentColor" opacity="0.85" fontFamily="sans-serif">{label}: {val}</text>
        </g>
      ))}
    </svg>
  ),

  // Gauge / medidor de KPI
  ({ s }) => {
    const pct = 0.72
    const angle = Math.PI * (1 + pct)
    const r = 38, cx = 50, cy = 54
    const x = cx + r * Math.cos(Math.PI), y2 = cy + r * Math.sin(Math.PI)
    const x2 = cx + r * Math.cos(angle), y3 = cy + r * Math.sin(angle)
    return (
      <svg width={s} height={s * 0.75} viewBox="0 0 100 75">
        <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke="currentColor" strokeWidth="8" opacity="0.15" strokeLinecap="round"/>
        <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${x2},${y3}`} fill="none" stroke="currentColor" strokeWidth="8" opacity="0.65" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="5" fill="currentColor" opacity="0.7"/>
        <text x={cx} y={cy+18} textAnchor="middle" fontSize="14" fill="currentColor" opacity="0.85" fontFamily="sans-serif" fontWeight="700">72%</text>
        <text x={cx} y={cy+28} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="sans-serif">Eficiencia Operativa</text>
      </svg>
    )
  },

  // Tabla de datos / dashboard mini
  ({ s }) => (
    <svg width={s} height={s * 0.75} viewBox="0 0 120 90">
      <rect x="0" y="0" width="120" height="90" rx="6" fill="currentColor" opacity="0.07"/>
      <rect x="0" y="0" width="120" height="16" rx="6" fill="currentColor" opacity="0.2"/>
      <text x="8" y="11" fontSize="7.5" fill="currentColor" opacity="0.9" fontFamily="sans-serif" fontWeight="600">Reporte de Ventas</text>
      {[['Cliente A','S/12,400','▲ 8%'],['Cliente B','S/9,800','▲ 3%'],['Cliente C','S/7,200','▼ 2%'],['Cliente D','S/5,600','▲ 11%']].map(([c,v,t],i) => (
        <g key={i}>
          <rect x="0" y={18+i*16} width="120" height="15" fill="currentColor" opacity={i%2===0 ? 0.04 : 0}/>
          <text x="8" y={28+i*16} fontSize="7" fill="currentColor" opacity="0.75" fontFamily="sans-serif">{c}</text>
          <text x="62" y={28+i*16} fontSize="7" fill="currentColor" opacity="0.75" fontFamily="sans-serif">{v}</text>
          <text x="98" y={28+i*16} fontSize="7" fill="currentColor" opacity="0.75" fontFamily="sans-serif">{t}</text>
        </g>
      ))}
      <line x1="0" y1="82" x2="120" y2="82" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/>
    </svg>
  ),

  // Scatter plot de ventas vs margen
  ({ s }) => (
    <svg width={s} height={s} viewBox="0 0 100 100">
      {[[12,80],[22,68],[35,55],[28,72],[48,42],[55,38],[62,30],[50,48],[72,22],[82,15],[90,10]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={3+i%3} fill="currentColor" opacity={0.4+i%3*0.15}/>
      ))}
      <line x1="5" y1="88" x2="94" y2="6" stroke="currentColor" strokeWidth="1.8" strokeDasharray="5,3" opacity="0.5"/>
      <line x1="0" y1="92" x2="100" y2="92" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <line x1="4" y1="0" x2="4" y2="92" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <text x="20" y="10" fontSize="7.5" fill="currentColor" opacity="0.65" fontFamily="sans-serif">Ventas vs Margen</text>
    </svg>
  ),

  // Barras horizontales (ranking)
  ({ s }) => (
    <svg width={s} height={s * 0.75} viewBox="0 0 120 85">
      {[['Producto A',92],['Producto B',78],['Producto C',65],['Producto D',54],['Producto E',38]].map(([label,pct],i) => (
        <g key={i}>
          <text x="2" y={16+i*16} fontSize="7" fill="currentColor" opacity="0.7" fontFamily="sans-serif">{label}</text>
          <rect x="38" y={8+i*16} width={(pct/100)*78} height="9" fill="currentColor" rx="2" opacity={0.65-i*0.08}/>
          <text x={42+(pct/100)*78} y={16+i*16} fontSize="7" fill="currentColor" opacity="0.6" fontFamily="sans-serif"> {pct}%</text>
        </g>
      ))}
    </svg>
  ),
]

// Posiciones fijas en zonas vacías del hero (sin tapar texto ni foto)
// Hero: 1280×900 | Contenido: x=94-685, y=224-766 | Foto: x=808-1128, y=335-655
const POSITIONS = [
  // Franja superior (encima del eyebrow y=224)
  { id:0,  chart:0, x:2,   y:4,  size:110, opacity:0.22, rotate:-4,  duration:24, delay:-2  },
  { id:1,  chart:3, x:25,  y:5,  size:105, opacity:0.20, rotate:3,   duration:28, delay:-8  },
  { id:2,  chart:6, x:52,  y:4,  size:95,  opacity:0.22, rotate:-3,  duration:22, delay:-14 },
  { id:3,  chart:1, x:75,  y:3,  size:110, opacity:0.21, rotate:5,   duration:26, delay:-5  },
  // Franja izquierda — tamaño reducido para no pasar x=94px (7.3%)
  { id:4,  chart:4, x:0.2, y:28, size:60,  opacity:0.20, rotate:-6,  duration:30, delay:-10 },
  { id:5,  chart:8, x:0.3, y:55, size:60,  opacity:0.19, rotate:4,   duration:25, delay:-18 },
  // Franja derecha (x > 88%, fuera de la foto que termina en x=1128=88%)
  { id:6,  chart:2, x:89,  y:12, size:100, opacity:0.22, rotate:-5,  duration:27, delay:-6  },
  { id:7,  chart:9, x:90,  y:42, size:90,  opacity:0.20, rotate:3,   duration:23, delay:-15 },
  { id:8,  chart:5, x:89,  y:72, size:95,  opacity:0.21, rotate:-4,  duration:29, delay:-3  },
  // Gap entre contenido y foto (contenido termina x=685=53.5%, foto empieza x=808=63.1%)
  { id:9,  chart:7, x:56,  y:40, size:80,  opacity:0.18, rotate:2,   duration:26, delay:-12 },
  // Encima de la foto (x:63-88%, y<37%)
  { id:10, chart:4, x:65,  y:5,  size:100, opacity:0.21, rotate:-3,  duration:28, delay:-7  },
  // Debajo de la foto (x:63-88%, y>73%)
  { id:11, chart:1, x:64,  y:78, size:105, opacity:0.22, rotate:4,   duration:24, delay:-20 },
  // Franja inferior (y > 86%)
  { id:12, chart:6, x:20,  y:87, size:95,  opacity:0.20, rotate:-2,  duration:27, delay:-9  },
  { id:13, chart:3, x:42,  y:88, size:90,  opacity:0.19, rotate:5,   duration:25, delay:-16 },
]

export default function MathBg() {
  return (
    <div className="math-bg" aria-hidden="true">
      {POSITIONS.map(item => {
        const Chart = CHARTS[item.chart]
        return (
          <div
            key={item.id}
            className="math-bg-chart"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              opacity: item.opacity,
              '--rotate': `${item.rotate}deg`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              color: 'var(--accent)',
            }}
          >
            <Chart s={item.size} />
          </div>
        )
      })}
    </div>
  )
}

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

export default function MapaAccidentes({ datos }) {
  const sample = datos.length > 2000 ? datos.filter((_, i) => i % 2 === 0) : datos
  const puntos = sample.filter(d => d.latitud && d.longitud)

  const color = (d) => {
    if (d.cant_fallecidos > 0) return '#dc2626'
    if (d.cant_heridos > 2)    return '#d97706'
    return '#3b82f6'
  }

  return (
    <div className="card">
      <h3>🗺️ Distribución Geográfica ({puntos.length.toLocaleString('es-PE')} puntos)</h3>
      <div className="map-container">
        <MapContainer center={[-9.5, -75.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {puntos.map(d => (
            <CircleMarker
              key={d.id}
              center={[d.latitud, d.longitud]}
              radius={5}
              pathOptions={{ color: color(d), fillColor: color(d), fillOpacity: 0.7, weight: 1 }}
            >
              <Popup>
                <strong>{d.fecha}</strong><br />
                Modalidad: {d.modalidad}<br />
                Fallecidos: {d.cant_fallecidos}<br />
                Heridos: {d.cant_heridos}<br />
                {d.distrito}, {d.provincia}<br />
                <em>{d.departamento}</em>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
        🔴 Con fallecidos &nbsp; 🟠 3+ heridos &nbsp; 🔵 Sin víctimas
      </p>
    </div>
  )
}

import { MapContainer, TileLayer } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

type FishingMapProps = {
  center?: LatLngExpression
  zoom?: number
  height?: number | string
}

export default function FishingMap({
  center = [-8.75, 125.7],
  zoom = 8,
  height = 420,
}: FishingMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
    </MapContainer>
  )
}

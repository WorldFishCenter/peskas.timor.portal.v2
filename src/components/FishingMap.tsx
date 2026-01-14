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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}

import React, { useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { Map } from 'react-map-gl/maplibre'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import { useData } from '../hooks'
import { heatmapColors } from '../constants/colors'
import 'maplibre-gl/dist/maplibre-gl.css'

type HexagonMapProps = {
  height?: number | string
  year?: string
}

const INITIAL_VIEW_STATE = {
  longitude: 125.7,
  latitude: -8.75,
  zoom: 8,
  pitch: 0,
  bearing: 0,
}

function HexagonMap({ height = 420, year = 'all' }: HexagonMapProps) {
  const { data: tracks, loading } = useData('predicted_tracks')

  const filteredTracks = useMemo(() => {
    if (!tracks) return []
    if (year === 'all') return tracks
    return tracks.filter((track) => track.year.toString() === year)
  }, [tracks, year])

  const layers = useMemo(() => {
    if (!filteredTracks.length) return []

    return [
      new HexagonLayer({
        id: 'hexagon-layer',
        data: filteredTracks,
        getPosition: (d: any) => [d.lon, d.lat],
        radius: 5000,
        elevationScale: 0,
        extruded: false,
        coverage: 1,
        colorRange: heatmapColors,
      }),
    ]
  }, [filteredTracks])

  return (
    <div style={{ height, width: '100%' }}>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
        >
          <Map
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            mapLib={import('maplibre-gl')}
          />
        </DeckGL>
      )}
    </div>
  )
}

export default React.memo(HexagonMap)

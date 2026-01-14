import { useI18n } from '../i18n'
import { useState, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { Map } from 'react-map-gl/maplibre'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import { useData } from '../hooks'
import { heatmapColors } from '../constants/colors'
import YearFilter from '../components/YearFilter'
import 'maplibre-gl/dist/maplibre-gl.css'

const INITIAL_VIEW_STATE = {
  longitude: 125.7,
  latitude: -8.75,
  zoom: 8,
  pitch: 0,
  bearing: 0,
}

export default function Tracks() {
  const { t } = useI18n()
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const { data: tracks, loading } = useData('predicted_tracks')

  // Filter tracks by year
  const filteredTracks = useMemo(() => {
    if (!tracks) return []
    if (selectedYear === 'all') return tracks
    return tracks.filter((track) => track.year.toString() === selectedYear)
  }, [tracks, selectedYear])

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
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.tracks')}</h2>
            </div>
            <div className="col-auto ms-auto d-print-none">
              <div className="btn-list">
                <YearFilter value={selectedYear} onChange={setSelectedYear} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{t('tracks.map_title')}</h3>
                </div>
                <div className="card-body p-0">
                  <div style={{ height: 650, width: '100%' }}>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

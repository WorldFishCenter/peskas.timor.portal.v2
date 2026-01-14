import { useState, useMemo, useEffect } from 'react'
import DeckGL from '@deck.gl/react'
import { Map } from 'react-map-gl/maplibre'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import type { PickingInfo } from '@deck.gl/core'
import { useData } from '../hooks'
import { useTheme } from '../hooks/useTheme'
import { useI18n } from '../i18n'
import 'maplibre-gl/dist/maplibre-gl.css'

interface PredictedTrack {
  year: number
  lat: number
  lon: number
  Gear: string
}

interface GearCount {
  [gear: string]: number
}

type FishingActivityMapProps = {
  height?: number | string
}

const INITIAL_VIEW_STATE = {
  longitude: 125.7,
  latitude: -8.75,
  zoom: 8,
  pitch: 40.5,
  bearing: 0,
}

const COLOR_RANGE: [number, number, number][] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
]

export default function FishingActivityMap({ height = 650 }: FishingActivityMapProps) {
  const theme = useTheme()
  const { t } = useI18n()
  const { data: tracks, loading } = useData('predicted_tracks')

  // Get unique gear types and year range
  const { gearTypes, minYear, maxYear } = useMemo(() => {
    if (!tracks) return { gearTypes: [], minYear: 2018, maxYear: new Date().getFullYear() }

    const gears = [...new Set((tracks as PredictedTrack[]).map(t => t.Gear))].sort()
    const years = (tracks as PredictedTrack[]).map(t => t.year)
    return {
      gearTypes: gears,
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    }
  }, [tracks])

  const [selectedGears, setSelectedGears] = useState<string[]>([])
  const [yearRange, setYearRange] = useState<[number, number]>([2018, new Date().getFullYear()])
  const [radius, setRadius] = useState(500)
  const [hoverInfo, setHoverInfo] = useState<PickingInfo | null>(null)

  // Update selected gears when gear types are loaded
  useEffect(() => {
    if (gearTypes.length > 0 && selectedGears.length === 0) {
      setSelectedGears(gearTypes)
    }
  }, [gearTypes])

  // Update year range when data is loaded
  useEffect(() => {
    if (minYear && maxYear) {
      setYearRange([minYear, maxYear])
    }
  }, [minYear, maxYear])

  const filteredTracks = useMemo(() => {
    if (!tracks) return []
    return (tracks as PredictedTrack[]).filter(
      track =>
        selectedGears.includes(track.Gear) &&
        track.year >= yearRange[0] &&
        track.year <= yearRange[1]
    )
  }, [tracks, selectedGears, yearRange])

  const layers = useMemo(() => {
    if (!filteredTracks.length) return []

    return [
      new HexagonLayer<PredictedTrack>({
        id: 'hexagon-layer',
        data: filteredTracks,
        getPosition: (d: PredictedTrack) => [d.lon, d.lat],
        radius: radius,
        elevationRange: [0, 3000],
        elevationScale: 30,
        extruded: true,
        coverage: 0.4,
        colorRange: COLOR_RANGE,
        pickable: true,
        autoHighlight: true,
        onHover: (info: PickingInfo) => {
          setHoverInfo(info.object ? info : null)
          return true
        },
      }),
    ]
  }, [filteredTracks, radius])

  const handleGearToggle = (gear: string) => {
    setSelectedGears(prev =>
      prev.includes(gear)
        ? prev.filter(g => g !== gear)
        : [...prev, gear]
    )
  }

  const renderTooltip = () => {
    if (!hoverInfo || !hoverInfo.object) return null

    const { object, x, y } = hoverInfo
    const points = object.points as PredictedTrack[]

    // Count gear types
    const gearCounts: GearCount = points.reduce((acc: GearCount, point: PredictedTrack) => {
      acc[point.Gear] = (acc[point.Gear] || 0) + 1
      return acc
    }, {})

    const totalActivities = points.length
    const mainGear = Object.keys(gearCounts).reduce((a, b) =>
      gearCounts[a] > gearCounts[b] ? a : b
    )

    // Set background color based on main gear type
    let bgColor = 'rgba(255, 255, 255, 0.95)'
    let textColor = '#000'
    if (theme === 'dark') {
      if (mainGear.toLowerCase().includes('long line')) {
        bgColor = 'rgba(204, 51, 99, 0.95)'
        textColor = '#fff'
      } else if (mainGear.toLowerCase().includes('gill net')) {
        bgColor = 'rgba(51, 55, 69, 0.95)'
        textColor = '#fff'
      } else if (mainGear.toLowerCase().includes('hand line')) {
        bgColor = 'rgba(188, 175, 156, 0.95)'
        textColor = '#000'
      } else {
        bgColor = 'rgba(32, 33, 36, 0.95)'
        textColor = '#fff'
      }
    }

    const position = object.position as [number, number]

    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          background: bgColor,
          color: textColor,
          padding: '10px',
          borderRadius: '5px',
          pointerEvents: 'none',
          zIndex: 1000,
          fontSize: '12px',
          maxWidth: '300px',
        }}
      >
        <div>
          <strong>{t('home.map_tooltip_location', { defaultValue: 'Location' })}:</strong> {position[1].toFixed(4)}, {position[0].toFixed(4)}
        </div>
        <div>
          <strong>{t('home.map_tooltip_total_activities', { defaultValue: 'Total Activities' })}:</strong> {totalActivities}
        </div>
        <div style={{ marginTop: '5px' }}>
          <strong>{t('home.map_gear_types', { defaultValue: 'Gear Types' })}:</strong>
        </div>
        {Object.entries(gearCounts).map(([gear, count]) => (
          <div key={gear}>
            <strong>{gear}:</strong> {count} ({((count / totalActivities) * 100).toFixed(1)}%)
          </div>
        ))}
      </div>
    )
  }

  const isDark = theme === 'dark'
  const mapStyle = isDark
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers}
          >
            <Map mapStyle={mapStyle} mapLib={import('maplibre-gl')} />
          </DeckGL>

          {/* Control Panel */}
          <div
            className="card position-absolute"
            style={{
              top: '1rem',
              right: '1rem',
              maxWidth: '20rem',
              zIndex: 1000,
            }}
          >
            <div className="card-header">
              <h3 className="card-title">{t('home.map_title', { defaultValue: 'Fishing Activity Heatmap' })}</h3>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                {t('home.map_description', { defaultValue: 'Visualizing fishing vessel density in Timor-Leste waters' })}
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-link text-muted ms-1"
                  title={t('home.map_info', { defaultValue: 'This heatmap shows the fishing vessel density along the Timor-Leste coasts. The data is based on a sample of 440 vessels equipped with GPS trackers, representing a subset of the total fishery. The gear type was predicted using a machine learning model analyzing the vessels\' movement patterns.' })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <circle cx="12" cy="12" r="9"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                    <polyline points="11 12 12 12 12 16 13 16"/>
                  </svg>
                </button>
              </p>

              {/* Color Legend */}
              <div className="mb-4">
                <label className="form-label small fw-bold mb-2">{t('home.map_legend', { defaultValue: 'Density' })}</label>
                <div className="d-flex rounded overflow-hidden" style={{ height: '1.25rem' }}>
                  {COLOR_RANGE.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        backgroundColor: `rgb(${color.join(',')})`,
                      }}
                    />
                  ))}
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <span className="text-muted small">{t('home.map_low_density', { defaultValue: 'Low' })}</span>
                  <span className="text-muted small">{t('home.map_high_density', { defaultValue: 'High' })}</span>
                </div>
              </div>

              {/* Gear Type Selection */}
              <div className="mb-4">
                <label className="form-label small fw-bold mb-2">{t('home.map_gear_types', { defaultValue: 'Gear Types' })}</label>
                <div className="d-flex flex-wrap gap-2">
                  {gearTypes.map(gear => (
                    <label key={gear} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedGears.includes(gear)}
                        onChange={() => handleGearToggle(gear)}
                      />
                      <span className="form-check-label small">{gear}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Range Slider */}
              <div className="mb-4">
                <label className="form-label small fw-bold mb-2">
                  {t('home.map_time_range', { start: yearRange[0], end: yearRange[1], defaultValue: 'Time Range: {start} - {end}' })}
                </label>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="range"
                    className="form-range"
                    min={minYear}
                    max={maxYear}
                    value={yearRange[0]}
                    onChange={e => setYearRange([parseInt(e.target.value), yearRange[1]])}
                  />
                  <input
                    type="range"
                    className="form-range"
                    min={minYear}
                    max={maxYear}
                    value={yearRange[1]}
                    onChange={e => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  />
                </div>
              </div>

              {/* Radius Slider */}
              <div className="mb-3">
                <label className="form-label small fw-bold mb-2">
                  {t('home.map_radius', { value: radius, defaultValue: 'Radius: {value}m' })}
                </label>
                <input
                  type="range"
                  className="form-range"
                  min={500}
                  max={3000}
                  step={500}
                  value={radius}
                  onChange={e => setRadius(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <p className="text-muted small mb-0">
                {t('home.map_hover_hint', { defaultValue: 'Hover over a hexagon to view detailed fishing activity information.' })}
              </p>
            </div>
          </div>

          {/* Tooltip */}
          {renderTooltip()}
        </>
      )}
    </div>
  )
}

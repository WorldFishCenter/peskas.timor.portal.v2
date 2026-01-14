import { useState, useMemo, useEffect } from 'react'
import DeckGL from '@deck.gl/react'
import { Map } from 'react-map-gl/maplibre'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import type { PickingInfo } from '@deck.gl/core'
import { useData } from '../hooks'
import { useTheme } from '../hooks/useTheme'
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
          <strong>Location:</strong> {position[1].toFixed(4)}, {position[0].toFixed(4)}
        </div>
        <div>
          <strong>Total Activities:</strong> {totalActivities}
        </div>
        <div style={{ marginTop: '5px' }}>
          <strong>Gear Types:</strong>
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
            className="card"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              maxWidth: '320px',
              zIndex: 1000,
              opacity: 0.95,
            }}
          >
            <div className="card-body">
              <h3 className="card-title mb-2">Fishing Activity Heatmap</h3>
              <p className="text-muted small mb-3">
                Visualizing fishing vessel density in Timor-Leste waters
                <span
                  className="ms-1"
                  style={{ cursor: 'help' }}
                  title="This heatmap shows the fishing vessel density along the Timor-Leste coasts. The data is based on a sample of 440 vessels equipped with GPS trackers, representing a subset of the total fishery. The gear type was predicted using a machine learning model analyzing the vessels' movement patterns."
                >
                  ℹ️
                </span>
              </p>

              {/* Color Legend */}
              <div className="mb-3">
                <div className="d-flex" style={{ height: '20px', borderRadius: '3px', overflow: 'hidden' }}>
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
                <div className="d-flex justify-content-between small text-muted mt-1">
                  <span>Low Density</span>
                  <span>High Density</span>
                </div>
              </div>

              {/* Gear Type Selection */}
              <div className="mb-3">
                <label className="form-label fw-bold">Gear Types</label>
                <div>
                  {gearTypes.map(gear => (
                    <label key={gear} className="form-check form-check-inline">
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
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Time Range: {yearRange[0]} - {yearRange[1]}
                </label>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="range"
                    className="form-range"
                    min={minYear}
                    max={maxYear}
                    value={yearRange[0]}
                    onChange={e => setYearRange([parseInt(e.target.value), yearRange[1]])}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="range"
                    className="form-range"
                    min={minYear}
                    max={maxYear}
                    value={yearRange[1]}
                    onChange={e => setYearRange([yearRange[0], parseInt(e.target.value)])}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Radius Slider */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Radius: {radius}m
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

              <p className="small text-muted mb-0">
                Hover over a hexagon to view detailed fishing activity information.
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

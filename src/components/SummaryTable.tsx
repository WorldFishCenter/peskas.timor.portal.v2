import { useMemo } from 'react'
import { useData } from '../hooks'

interface RegionData {
  landing_revenues: number[]
  landing_weights: number[]
  landings_per_boat: number[]
  revenues: number[]
  catches: number[]
  price_kgs: number[]
}

interface MunicipalSummary {
  region: string
  landing_revenue: number
  landing_weight: number
  n_landings_per_boat: number
  revenue: number
  catch: number
  price_kg: number
}

export default function SummaryTable() {
  const { data, loading, error } = useData('municipal_aggregated')

  const summary = useMemo(() => {
    if (!data) return []

    // Group by region and calculate summaries (matching Shiny logic)
    const grouped = data.reduce<Record<string, RegionData>>(
      (acc, row) => {
        if (!acc[row.region]) {
          acc[row.region] = {
            landing_revenues: [],
            landing_weights: [],
            landings_per_boat: [],
            revenues: [],
            catches: [],
            price_kgs: [],
          }
        }
        acc[row.region].landing_revenues.push(row.landing_revenue)
        acc[row.region].landing_weights.push(row.landing_weight)
        acc[row.region].landings_per_boat.push(row.n_landings_per_boat)
        acc[row.region].revenues.push(row.revenue)
        acc[row.region].catches.push(row.catch)
        acc[row.region].price_kgs.push(row.price_kg)
        return acc
      },
      {}
    )

    // Calculate medians and sums per region
    const median = (arr: number[]) => {
      const sorted = [...arr].filter((x) => x != null).sort((a, b) => a - b)
      if (sorted.length === 0) return 0
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    }

    const sum = (arr: number[]) => arr.reduce((a, b) => a + (b ?? 0), 0)
    const mean = (arr: number[]) => {
      const valid = arr.filter((x) => x != null)
      return valid.length > 0 ? sum(valid) / valid.length : 0
    }

    const result: MunicipalSummary[] = Object.entries(grouped).map(([region, vals]) => ({
      region,
      landing_revenue: Math.round(median(vals.landing_revenues) * 100) / 100,
      landing_weight: Math.round(median(vals.landing_weights) * 100) / 100,
      n_landings_per_boat: Math.round(median(vals.landings_per_boat) * 100) / 100,
      revenue: Math.round((sum(vals.revenues) / 1000000) * 100) / 100,
      catch: Math.round((sum(vals.catches) / 1000) * 100) / 100,
      price_kg: Math.round(mean(vals.price_kgs) * 100) / 100,
    }))

    return result.sort((a, b) => a.region.localeCompare(b.region))
  }, [data])

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center text-danger">Failed to load data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-vcenter card-table">
        <thead>
          <tr>
            <th>Municipality</th>
            <th>Revenue per trip</th>
            <th>Landings per boat</th>
            <th>Catch per trip</th>
            <th>Total revenue</th>
            <th>Total catch</th>
            <th>Price per kg</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row) => (
            <tr key={row.region}>
              <td>{row.region}</td>
              <td>${row.landing_revenue}</td>
              <td>{row.n_landings_per_boat}</td>
              <td>{row.landing_weight} kg</td>
              <td>${row.revenue} M</td>
              <td>{row.catch} t</td>
              <td>${row.price_kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

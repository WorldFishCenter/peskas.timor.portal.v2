import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'

interface TaxaRecord {
  grouped_taxa: string
  catch: number
  [key: string]: any
}

interface TaxaBarChartProps {
  data: TaxaRecord[]
  taxaNameMap: Record<string, string>
  year?: string
  colors?: string[]
  height?: number
}

export default function TaxaBarChart({
  data,
  taxaNameMap,
  year = 'all',
  colors = [],
  height = 400
}: TaxaBarChartProps) {
  const chartData = useMemo(() => {
    // Filter by year if needed
    const filtered = year === 'all' ? data : data.filter(d => d.year === year)

    // Group by taxa and sum catch
    const grouped: Record<string, number> = {}
    filtered.forEach(row => {
      const taxa = row.grouped_taxa
      if (!grouped[taxa]) grouped[taxa] = 0
      grouped[taxa] += row.catch || 0
    })

    // Sort by catch descending and convert to tons
    const sorted = Object.entries(grouped)
      .map(([taxa, catchValue]) => ({
        taxa,
        displayName: taxaNameMap[taxa] || taxa,
        catch: Math.round(catchValue / 1000) // Convert to tons
      }))
      .sort((a, b) => b.catch - a.catch)

    return sorted
  }, [data, taxaNameMap, year])

  const series = [{
    name: 'Catch (tons)',
    data: chartData.map(d => d.catch)
  }]

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        distributed: true,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: chartData.map((_, i) => colors[i % colors.length] || '#206bc4'),
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.map(d => d.displayName),
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          fontSize: '11px'
        },
        trim: true,
        maxHeight: 120,
      }
    },
    yaxis: {
      title: { text: 'Catch (tons)' },
      labels: {
        formatter: (val: number) => val.toLocaleString()
      }
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} tons`
      }
    },
    grid: {
      strokeDashArray: 4,
      padding: {
        top: -20,
        right: 0,
        left: -4,
        bottom: 0,
      },
    },
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  )
}

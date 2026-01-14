import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { ConservationRecord } from '../../types/data'

interface StackedBarChartProps {
  data: ConservationRecord[]
  height?: number
  colors?: string[]
  yFormatter?: (val: number) => string
}

export default function StackedBarChart({
  data,
  height = 380,
  colors,
  yFormatter = (val: number) => `${val}%`,
}: StackedBarChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { series: [], categories: [] }

    // Get unique municipalities and catch_preservation types
    const municipalities = [...new Set(data.map((d) => d.municipality))].sort()
    const preservationTypes = [...new Set(data.map((d) => d.catch_preservation))].sort()

    // Build series data for stacked bar chart
    const series = preservationTypes.map((type) => ({
      name: type,
      data: municipalities.map((mun) => {
        const item = data.find(
          (d) => d.municipality === mun && d.catch_preservation === type
        )
        return item ? item.perc : 0
      }),
    }))

    return { series, categories: municipalities }
  }, [data])

  if (chartData.series.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: `${height}px` }}>
        <div className="text-muted small">No data available</div>
      </div>
    )
  }

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '90%',
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: { fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        formatter: yFormatter,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '16px',
    },
    colors: colors,
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: yFormatter,
      },
    },
  }), [chartData.categories, yFormatter, colors])

  const series = useMemo(() => chartData.series, [chartData.series])

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  )
}

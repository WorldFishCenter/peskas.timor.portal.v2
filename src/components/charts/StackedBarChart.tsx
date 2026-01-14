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
  height = 320,
  colors,
  yFormatter = (val: number) => `${val}%`,
}: StackedBarChartProps) {
  const chartData = useMemo(() => {
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

  const options: ApexOptions = {
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
  }

  return (
    <ReactApexChart
      options={options}
      series={chartData.series}
      type="bar"
      height={height}
    />
  )
}

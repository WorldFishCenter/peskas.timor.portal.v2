import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useTheme } from '../../hooks/useTheme'

interface SparklineDataPoint {
  date: string
  value: number
}

interface SparklineChartProps {
  data: SparklineDataPoint[]
  height?: number
  color?: string
}

export default function SparklineChart({
  data,
  height = 40,
  color = '#206bc4',
}: SparklineChartProps) {
  const theme = useTheme()

  const series = useMemo(() => [{
    data: data.map(d => ({
      x: d.date,
      y: d.value
    }))
  }], [data])

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      sparkline: {
        enabled: true,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      background: 'transparent',
      fontFamily: 'inherit',
    },
    theme: {
      mode: theme,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      lineCap: 'round',
    },
    fill: {
      opacity: 0.1,
      type: 'solid',
    },
    markers: {
      size: 0,
    },
    colors: [color],
    grid: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    tooltip: {
      enabled: true,
      theme: theme,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: () => '',
        },
        formatter: (val: number) => val.toLocaleString(),
      },
      marker: {
        show: false,
      },
    },
  }), [theme, color])

  if (!data || data.length === 0) {
    return null
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height={height}
      width="100%"
    />
  )
}

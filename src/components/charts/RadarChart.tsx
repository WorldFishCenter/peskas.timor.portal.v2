import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { spiderColors } from '../../constants/colors'

export interface RadarChartSeries {
  name: string
  data: number[]
}

interface RadarChartProps {
  series: RadarChartSeries[]
  categories: string[]
  height?: number
  colors?: string[]
  yFormatter?: (val: number) => string
}

export default function RadarChart({
  series,
  categories,
  height = 380,
  colors = spiderColors,
  yFormatter = (val) => `$${val.toFixed(2)}`,
}: RadarChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'radar',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: '#000000' },
      },
    },
    yaxis: {
      labels: {
        formatter: yFormatter,
        style: { colors: '#000000' },
      },
    },
    markers: { size: 4 },
    legend: {
      position: 'bottom',
      fontSize: '14px',
    },
    colors,
    grid: {
      strokeDashArray: 4,
      padding: { top: -20, right: -25, left: -25, bottom: -30 },
    },
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radar"
      height={height}
    />
  )
}

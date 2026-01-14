import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { donutBlue } from '../../constants/colors'

export interface DonutChartData {
  label: string
  value: number
}

interface DonutChartProps {
  data: DonutChartData[]
  title?: string
  colors?: string[]
  height?: string | number
}

export default function DonutChart({
  data,
  title,
  colors = donutBlue,
  height = '16rem',
}: DonutChartProps) {
  const series = data.map((d) => d.value)
  const labels = data.map((d) => d.label)

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      animations: { enabled: false },
    },
    labels,
    colors,
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    title: title
      ? {
          text: title,
          align: 'center',
          style: { fontSize: '14px', fontWeight: 500 },
        }
      : undefined,
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="donut"
      height={height}
    />
  )
}

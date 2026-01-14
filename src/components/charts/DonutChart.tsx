import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { donutBlue } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'

export interface DonutChartData {
  label: string
  value: number
}

interface DonutChartProps {
  data: DonutChartData[]
  title?: string
  colors?: string[]
  height?: number
}

export default function DonutChart({
  data,
  title,
  colors = donutBlue,
  height = 280,
}: DonutChartProps) {
  const theme = useTheme()

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}
      >
        No data available
      </div>
    )
  }

  const series = data.map((d) => d.value)
  const labels = data.map((d) => d.label)

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    theme: {
      mode: theme,
    },
    labels: labels,
    colors: colors,
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
      },
    },
  }

  if (title) {
    options.title = {
      text: title,
      align: 'center',
    }
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

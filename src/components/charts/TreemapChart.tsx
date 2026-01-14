import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { habitatPalette } from '../../constants/colors'

export interface TreemapDataItem {
  x: string
  y: number
}

interface TreemapChartProps {
  data: TreemapDataItem[]
  title?: string
  colors?: string[]
  height?: string | number
}

export default function TreemapChart({
  data,
  title,
  colors = habitatPalette,
  height = '20rem',
}: TreemapChartProps) {
  const series = [{ data }]

  const options: ApexOptions = {
    chart: {
      type: 'treemap',
      animations: { enabled: false },
    },
    colors,
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
      formatter: function (text: string, op: { value: number }) {
        return [text, op.value.toLocaleString()]
      },
    },
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.5,
        distributed: true,
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
      type="treemap"
      height={height}
    />
  )
}

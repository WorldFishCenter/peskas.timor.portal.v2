import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'

export interface TimeSeriesDataPoint {
  date: string
  value: number
}

export interface TimeSeriesSeries {
  name: string
  data: TimeSeriesDataPoint[]
}

interface TimeSeriesChartProps {
  series: TimeSeriesSeries[]
  title?: string
  colors?: string[]
  height?: string | number
  yAxisTitle?: string
  xAxisTitle?: string
  chartType?: 'line' | 'area'
}

const DEFAULT_COLORS = ['#206bc4', '#4299e1', '#79c0ff']

export default function TimeSeriesChart({
  series,
  title,
  colors = DEFAULT_COLORS,
  height = 320,
  yAxisTitle,
  xAxisTitle,
  chartType = 'area',
}: TimeSeriesChartProps) {
  const apexSeries = series.map((s) => ({
    name: s.name,
    data: s.data.map((d) => ({
      x: d.date,
      y: d.value,
    })),
  }))

  const options: ApexOptions = {
    chart: {
      type: chartType,
      animations: { enabled: false },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors,
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: chartType === 'area' ? 'gradient' : 'solid',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100],
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
        },
      },
      title: xAxisTitle ? { text: xAxisTitle } : undefined,
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
      title: yAxisTitle ? { text: yAxisTitle } : undefined,
    },
    tooltip: {
      x: { format: 'MMM yyyy' },
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    title: title
      ? {
          text: title,
          align: 'left',
          style: { fontSize: '14px', fontWeight: 500 },
        }
      : undefined,
  }

  return (
    <ReactApexChart
      options={options}
      series={apexSeries}
      type={chartType}
      height={height}
    />
  )
}

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

const DEFAULT_COLORS = ['#206bc4', '#aaaaaa']

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
      selection: { enabled: false },
    },
    colors,
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 1.5,
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
    grid: {
      strokeDashArray: 4,
      padding: {
        top: -20,
        right: 0,
        left: -4,
        bottom: -4,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        rotate: 0,
        datetimeUTC: false,
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
        },
      },
      axisBorder: { show: false },
      title: xAxisTitle ? { text: xAxisTitle } : undefined,
    },
    yaxis: {
      labels: {
        padding: 4,
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
      fontSize: '15px',
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
      },
    },
    responsive: [
      {
        breakpoint: 576,
        options: {
          yaxis: { show: false },
        },
      },
    ],
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

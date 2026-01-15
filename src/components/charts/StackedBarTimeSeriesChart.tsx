import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { timeSeriesColors } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../i18n'

export interface TimeSeriesDataPoint {
  date: string
  value: number
}

export interface TimeSeriesSeries {
  name: string
  data: TimeSeriesDataPoint[]
}

interface StackedBarTimeSeriesChartProps {
  series: TimeSeriesSeries[]
  title?: string
  colors?: string[]
  height?: number
  yAxisTitle?: string
}

export default function StackedBarTimeSeriesChart({
  series,
  title,
  colors = timeSeriesColors,
  height = 400,
  yAxisTitle,
}: StackedBarTimeSeriesChartProps) {
  const theme = useTheme()
  const { t, lang } = useI18n()
  const locale = lang === 'tet' ? 'tet' : lang === 'pt' ? 'pt-PT' : 'en-US'

  const monthYearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }),
    [locale]
  )

  const formatMonthYear = (value: string | number) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return monthYearFormatter.format(date)
  }

  // Normalize data: ApexCharts needs all series to have the same dates for stacking
  const normalizedSeries = useMemo(() => {
    if (!series.length) return []
    
    const allDates = new Set<string>()
    series.forEach(s => s.data.forEach(d => allDates.add(d.date)))
    const sortedDates = Array.from(allDates).sort()

    return series.map(s => {
      const dataMap = new Map(s.data.map(d => [d.date, d.value]))
      return {
        name: s.name,
        data: sortedDates.map(date => ({
          x: date,
          y: dataMap.get(date) || 0
        }))
      }
    })
  }, [series])

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    theme: {
      mode: theme,
    },
    colors: colors,
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: [theme === 'dark' ? '#1b2434' : '#fff']
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '80%',
        borderRadius: 2,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: {
          fontSize: '11px',
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
        },
        formatter: (value: string) => formatMonthYear(value),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: yAxisTitle ? {
        text: yAxisTitle,
        style: {
          fontSize: '11px',
          fontWeight: 500,
          color: theme === 'dark' ? '#6c7a91' : '#656d77',
        }
      } : undefined,
      labels: {
        style: {
          fontSize: '11px',
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
        },
        formatter: (val: number) => {
          return `${val.toLocaleString()}K`
        },
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    tooltip: {
      theme: theme,
      x: {
        show: true,
        formatter: (value: string | number) => formatMonthYear(value),
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString()}K`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
    },
  }

  return (
    <ReactApexChart
      options={options}
      series={normalizedSeries}
      type="bar"
      height={height}
    />
  )
}

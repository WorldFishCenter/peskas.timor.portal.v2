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

interface TimeSeriesChartProps {
  series: TimeSeriesSeries[]
  title?: string
  colors?: string[]
  height?: number
  yAxisTitle?: string
  xAxisTitle?: string
  chartType?: 'line' | 'area'
}

export default function TimeSeriesChart({
  series,
  title,
  colors = timeSeriesColors,
  height = 350,
  yAxisTitle,
  xAxisTitle,
  chartType = 'area',
}: TimeSeriesChartProps) {
  const theme = useTheme()
  const { t, lang } = useI18n()
  const locale = lang === 'tet' ? 'tet' : 'en-US'
  const monthYearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }),
    [locale]
  )
  const formatMonthYear = (value: string | number) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return monthYearFormatter.format(date)
  }

  const hasValidData =
    series &&
    series.length > 0 &&
    series.some((s) => s.data && s.data.length > 0)

  if (!hasValidData) {
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
        {t('common.no_data', { defaultValue: 'No data available' })}
      </div>
    )
  }

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
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    theme: {
      mode: theme,
    },
    colors: colors,
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
        datetimeUTC: false,
        formatter: (value: string, _timestamp?: number) => formatMonthYear(value),
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    tooltip: {
      x: {
        formatter: (value: string | number) => formatMonthYear(value),
      },
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    legend: {
      position: 'top',
    },
  }

  if (title) {
    options.title = {
      text: title,
      align: 'left',
    }
  }

  if (yAxisTitle && options.yaxis) {
    options.yaxis.title = { text: yAxisTitle }
  }

  if (xAxisTitle && options.xaxis) {
    options.xaxis.title = { text: xAxisTitle }
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

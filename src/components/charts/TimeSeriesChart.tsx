import React, { useMemo } from 'react'
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
  showMean?: boolean
  showMax?: boolean
}

function TimeSeriesChart({
  series,
  title,
  colors = timeSeriesColors,
  height = 350,
  yAxisTitle,
  xAxisTitle,
  chartType = 'area',
  showMean = false,
  showMax = false,
}: TimeSeriesChartProps) {
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

  const apexSeries = useMemo(() => series.map((s) => ({
    name: s.name,
    data: s.data.map((d) => ({
      x: d.date,
      y: d.value,
    })),
  })), [series])

  const annotations = useMemo(() => {
    const lines: any[] = []
    
    if ((showMean || showMax) && series.length > 0) {
      // Use the first series for reference metrics if multiple exist
      const data = series[0].data
      const values = data.map(d => d.value)
      
      if (showMean) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        lines.push({
          y: mean,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
          strokeDashArray: 4,
          label: {
            borderColor: 'transparent',
            style: {
              color: theme === 'dark' ? '#f5f7f9' : '#1d273b',
              background: theme === 'dark' ? '#2c333f' : '#f1f3f5',
              fontSize: '10px',
              padding: { left: 4, right: 4, top: 2, bottom: 2 }
            },
            text: `${t('common.mean', { defaultValue: 'Mean' })}: ${mean.toLocaleString(undefined, { maximumFractionDigits: 1 })}`,
            position: 'left',
            textAnchor: 'start',
            offsetX: 10
          }
        })
      }

      if (showMax) {
        const max = Math.max(...values)
        lines.push({
          y: max,
          borderColor: '#d63939', // Tabler red
          strokeDashArray: 2,
          opacity: 0.5,
          label: {
            borderColor: 'transparent',
            style: {
              color: '#fff',
              background: '#d63939',
              fontSize: '10px',
              padding: { left: 4, right: 4, top: 2, bottom: 2 }
            },
            text: `${t('common.max', { defaultValue: 'Max' })}: ${max.toLocaleString()}`,
            position: 'right',
            textAnchor: 'end',
            offsetX: -10
          }
        })
      }
    }
    
    return { yaxis: lines }
  }, [series, showMean, showMax, theme, t])

  const options: ApexOptions = {
    chart: {
      type: chartType,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      sparkline: {
        enabled: false,
      },
    },
    theme: {
      mode: theme,
    },
    annotations: annotations,
    colors: colors,
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2.5,
      lineCap: 'round',
    },
    fill: {
      type: chartType === 'area' ? 'gradient' : 'solid',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: theme === 'dark' ? 0.6 : 0.5,
        opacityTo: theme === 'dark' ? 0.1 : 0.1,
        stops: [0, 100],
      },
    },
    grid: {
      padding: {
        top: -20,
        right: 0,
        left: -4,
        bottom: 0,
      },
      strokeDashArray: 4,
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    markers: {
      size: 0,
      strokeColors: theme === 'dark' ? '#1b2434' : '#fff',
      strokeWidth: 2,
      hover: {
        size: 5,
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
        formatter: (value: string, _timestamp?: number) => formatMonthYear(value),
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
        },
        formatter: (val: number) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
          if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
          return val.toLocaleString()
        },
      },
    },
    tooltip: {
      theme: theme,
      x: {
        show: true,
        formatter: (value: string | number) => formatMonthYear(value),
      },
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
      style: {
        fontSize: '12px',
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontFamily: 'inherit',
      fontWeight: 400,
      labels: {
        colors: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
      markers: {
        size: 4,
        strokeWidth: 0,
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 0,
      },
    },
  }

  if (title) {
    options.title = {
      text: title,
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: 600,
        color: theme === 'dark' ? '#f5f7f9' : '#1d273b',
      },
    }
  }

  if (yAxisTitle && Array.isArray(options.yaxis)) {
    options.yaxis[0].title = {
      text: yAxisTitle,
      style: {
        fontSize: '11px',
        fontWeight: 500,
        color: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
    }
  } else if (yAxisTitle && options.yaxis && !Array.isArray(options.yaxis)) {
    options.yaxis.title = {
      text: yAxisTitle,
      style: {
        fontSize: '11px',
        fontWeight: 500,
        color: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
    }
  }

  if (xAxisTitle && options.xaxis) {
    options.xaxis.title = {
      text: xAxisTitle,
      style: {
        fontSize: '11px',
        fontWeight: 500,
        color: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
    }
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

export default React.memo(TimeSeriesChart)

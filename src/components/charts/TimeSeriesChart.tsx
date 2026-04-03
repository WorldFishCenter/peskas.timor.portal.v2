import React, { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'

/** Y-axis line annotations (ApexCharts uses this shape; `YAxisAnnotations` is not exported). */
type ApexYAxisLineAnnotation = NonNullable<NonNullable<ApexOptions['annotations']>['yaxis']>[number]
import { timeSeriesColors, timeSeriesImputedColor } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../i18n'

export interface TimeSeriesDataPoint {
  date: string
  value: number
  /** When set (monthly municipal rows), chart splits recorded vs imputed styling */
  isImputed?: boolean
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

  const gradientFill = useMemo(
    () => ({
      shade: 'light' as const,
      shadeIntensity: 0.5,
      inverseColors: false,
      opacityFrom: theme === 'dark' ? 0.6 : 0.5,
      opacityTo: theme === 'dark' ? 0.1 : 0.1,
      stops: [0, 100],
    }),
    [theme]
  )

  const chartModel = useMemo(() => {
    if (!series?.length || !series[0]?.data?.length) {
      return {
        apexSeries: [] as { name: string; data: { x: string; y: number | null }[] }[],
        palette: colors,
        strokeDashArray: 0 as number | number[],
        strokeWidth: 2.5 as number | number[],
        valuesForStats: [] as number[],
        markerSizes: 0 as number | number[],
        fill:
          chartType === 'area'
            ? { type: 'gradient' as const, gradient: gradientFill }
            : { type: 'solid' as const, opacity: 0 },
      }
    }

    const primary = series[0]
    const hasImputationMeta = primary.data.some((d) => typeof d.isImputed === 'boolean')

    if (!hasImputationMeta || series.length > 1) {
      return {
        apexSeries: series.map((s) => ({
          name: s.name,
          data: s.data.map((d) => ({ x: d.date, y: d.value })),
        })),
        palette: colors,
        strokeDashArray: 0,
        strokeWidth: 2.5,
        valuesForStats: primary.data.map((d) => d.value),
        markerSizes: 0,
        fill:
          chartType === 'area'
            ? { type: 'gradient' as const, gradient: gradientFill }
            : { type: 'solid' as const, opacity: 0 },
      }
    }

    const nImputed = primary.data.filter((d) => d.isImputed === true).length
    const nRecorded = primary.data.length - nImputed

    if (nImputed === 0) {
      return {
        apexSeries: [
          {
            name: primary.name,
            data: primary.data.map((d) => ({ x: d.date, y: d.value })),
          },
        ],
        palette: colors,
        strokeDashArray: 0,
        strokeWidth: 2.5,
        valuesForStats: primary.data.map((d) => d.value),
        markerSizes: 0,
        fill:
          chartType === 'area'
            ? { type: 'gradient' as const, gradient: gradientFill }
            : { type: 'solid' as const, opacity: 0 },
      }
    }

    if (nRecorded === 0) {
      return {
        apexSeries: [
          {
            name: primary.name,
            data: primary.data.map((d) => ({ x: d.date, y: d.value })),
          },
        ],
        palette: [timeSeriesImputedColor],
        strokeDashArray: [6],
        strokeWidth: 2.5,
        valuesForStats: primary.data.map((d) => d.value),
        markerSizes: 3.5,
        fill:
          chartType === 'area'
            ? { type: 'gradient' as const, gradient: gradientFill }
            : { type: 'solid' as const, opacity: 0 },
      }
    }

    const recName = t('common.timeseries_non_imputed', { defaultValue: 'Direct' })
    const impName = t('common.timeseries_imputed', { defaultValue: 'Estimated' })

    return {
      apexSeries: [
        {
          name: recName,
          data: primary.data.map((d) => ({
            x: d.date,
            y: d.isImputed === true ? null : d.value,
          })),
        },
        {
          name: impName,
          data: primary.data.map((d) => ({
            x: d.date,
            y: d.isImputed === true ? d.value : null,
          })),
        },
      ],
      palette: [colors[0] ?? timeSeriesColors[0], timeSeriesImputedColor],
      strokeDashArray: [0, 6],
      strokeWidth: [2.5, 2.5],
      valuesForStats: primary.data.map((d) => d.value),
      markerSizes: [3.5, 4],
      fill:
        chartType === 'area'
          ? {
              type: ['gradient', 'solid'] as unknown as 'gradient',
              gradient: gradientFill,
              opacity: [1, 0],
            }
          : { type: 'solid' as const, opacity: [0, 0] },
    }
  }, [series, colors, chartType, gradientFill, t])

  const annotations = useMemo(() => {
    const lines: ApexYAxisLineAnnotation[] = []
    const values = chartModel.valuesForStats

    if ((showMean || showMax) && values.length > 0) {
      
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
  }, [chartModel.valuesForStats, showMean, showMax, theme, t])

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
    colors: chartModel.palette,
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: chartModel.strokeWidth,
      lineCap: 'round',
      dashArray: chartModel.strokeDashArray,
    },
    fill: chartModel.fill as ApexOptions['fill'],
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
      size: chartModel.markerSizes,
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
      // With split recorded/imputed series, one series is always null per x; shared + safe y formatter avoids broken tooltips
      shared: chartModel.apexSeries.length > 1,
      intersect: false,
      x: {
        show: true,
        formatter: (value: string | number) => formatMonthYear(value),
      },
      y: {
        formatter: (val: number | null | undefined) => {
          if (val == null || Number.isNaN(Number(val))) return ''
          return Number(val).toLocaleString()
        },
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
      series={chartModel.apexSeries}
      type={chartType}
      height={height}
    />
  )
}

export default React.memo(TimeSeriesChart)

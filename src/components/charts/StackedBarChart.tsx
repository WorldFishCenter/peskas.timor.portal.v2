import React, { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { ConservationRecord } from '../../types/data'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../i18n'

interface StackedBarChartProps {
  data: ConservationRecord[]
  height?: number
  colors?: string[]
  yFormatter?: (val: number) => string
}

function StackedBarChart({
  data,
  height = 380,
  colors,
  yFormatter = (val: number) => `${val}%`,
}: StackedBarChartProps) {
  const theme = useTheme()
  const { t } = useI18n()

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { series: [], categories: [] }

    // Get unique municipalities and catch_preservation types, filtering out null/undefined values
    const municipalities = [...new Set(data.map((d) => d.municipality).filter(Boolean))].sort()
    const preservationTypes = [...new Set(data.map((d) => d.catch_preservation).filter(Boolean))].sort()

    // Build series data for stacked bar chart
    const series = preservationTypes.map((type) => ({
      name: type,
      data: municipalities.map((mun) => {
        const item = data.find(
          (d) => d.municipality === mun && d.catch_preservation === type && d.municipality != null && d.catch_preservation != null
        )
        return item ? item.perc : 0
      }),
    }))

    return { series, categories: municipalities }
  }, [data])

  if (chartData.series.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: `${height}px` }}>
        <div className="text-muted small">{t('common.no_data', { defaultValue: 'No data available' })}</div>
      </div>
    )
  }

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: true,
      background: 'transparent',
      fontFamily: 'inherit',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    theme: {
      mode: theme,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '90%',
      },
    },
    stroke: {
      show: false,
      width: 0,
      curve: 'smooth',
      lineCap: 'round',
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
          fontSize: '12px',
          fontFamily: 'inherit',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: yFormatter,
        style: {
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
          fontSize: '11px',
          fontFamily: 'inherit',
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '16px',
      fontFamily: 'inherit',
      labels: {
        colors: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
    },
    colors: colors,
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: theme,
      y: {
        formatter: yFormatter,
      },
    },
  }), [chartData.categories, yFormatter, colors, theme])

  const series = useMemo(() => chartData.series, [chartData.series])

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  )
}

export default React.memo(StackedBarChart)

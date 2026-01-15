import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useI18n } from '../../i18n'
import { useTheme } from '../../hooks/useTheme'

interface MunicipalTaxaRecord {
  region: string
  grouped_taxa: string
  catch: number
  year: string
  [key: string]: any
}

interface RegionCompositionChartProps {
  data: MunicipalTaxaRecord[]
  taxaNameMap: Record<string, string>
  year?: string
  colors?: string[]
  height?: number
}

export default function RegionCompositionChart({
  data,
  taxaNameMap,
  year = 'all',
  colors = [],
  height = 450
}: RegionCompositionChartProps) {
  const { t } = useI18n()
  const theme = useTheme()
  const chartData = useMemo(() => {
    // Filter by year
    const filtered = year === 'all'
      ? data
      : data.filter(row => row.year === year)

    if (filtered.length === 0) {
      return { series: [], categories: [] }
    }

    // Group by region and taxa
    const grouped: Record<string, Record<string, number>> = {}
    filtered.forEach(row => {
      if (!grouped[row.region]) grouped[row.region] = {}
      if (!grouped[row.region][row.grouped_taxa]) grouped[row.region][row.grouped_taxa] = 0
      grouped[row.region][row.grouped_taxa] += row.catch || 0
    })

    // Get all unique taxa and regions
    const allTaxa = [...new Set(filtered.map(r => r.grouped_taxa))].sort()
    const regions = Object.keys(grouped).sort()

    // Calculate percentages for each region
    const series = allTaxa.map(taxa => {
      const displayName = taxaNameMap[taxa] || taxa
      return {
        name: displayName,
        data: regions.map(region => {
          const total = Object.values(grouped[region]).reduce((sum, val) => sum + val, 0)
          const catchValue = grouped[region][taxa] || 0
          return total > 0 ? Math.round((catchValue / total) * 1000) / 10 : 0 // percentage with 1 decimal
        })
      }
    })

    // Sort series by total catch (descending) to have most important taxa first
    const sortedSeries = series
      .map(s => ({
        ...s,
        total: s.data.reduce((sum, val) => sum + val, 0)
      }))
      .sort((a, b) => b.total - a.total)
      .map(({ total, ...rest }) => rest)

    return { series: sortedSeries, categories: regions }
  }, [data, taxaNameMap, year])

  if (chartData.series.length === 0) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: `${height}px`, color: '#999' }}
      >
        {t('common.no_data', { defaultValue: 'No data available' })}
      </div>
    )
  }

  const options: ApexOptions = {
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
        horizontal: true,
        barHeight: '70%',
        borderRadius: 0,
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        formatter: (val: string | number) => {
          const numVal = typeof val === 'string' ? parseFloat(val) : val
          return `${numVal.toFixed(1)}%`
        },
        style: {
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
          fontSize: '11px',
          fontFamily: 'inherit',
        }
      },
      max: 100,
      title: {
        text: t('units.percentage_label', { defaultValue: 'Percentage (%)' }),
        style: {
          color: theme === 'dark' ? '#6c7a91' : '#656d77',
          fontSize: '12px',
          fontFamily: 'inherit',
        }
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
          fontSize: '12px',
          fontFamily: 'inherit',
        }
      },
    },
    legend: {
      position: 'top',
      fontSize: '12px',
      fontFamily: 'inherit',
      horizontalAlign: 'center',
      labels: {
        colors: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
      markers: {
        size: 6,
        offsetX: 0,
        offsetY: 0,
      },
    },
    colors: colors.length > 0 ? colors : undefined,
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: theme,
      y: {
        formatter: (val: number) => `${val.toFixed(1)}%`
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      padding: {
        top: -20,
        right: 0,
        left: -4,
        bottom: -4,
      },
    },
  }

  return (
    <ReactApexChart
      options={options}
      series={chartData.series}
      type="bar"
      height={height}
    />
  )
}

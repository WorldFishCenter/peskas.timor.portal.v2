import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useI18n } from '../../i18n'
import { useTheme } from '../../hooks/useTheme'

interface TaxaRecord {
  grouped_taxa: string
  catch: number
  region?: string
  date_bin_start?: string
  year?: string
  [key: string]: any
}

interface TaxaBarChartProps {
  data: TaxaRecord[]
  taxaNameMap: Record<string, string>
  year?: string
  municipality?: string
  colors?: string[]
  height?: number
}

export default function TaxaBarChart({
  data,
  taxaNameMap,
  year,
  municipality,
  colors = [],
  height = 400
}: TaxaBarChartProps) {
  const { t } = useI18n()
  const theme = useTheme()
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Filter by year and municipality
    let filtered = data

    // Filter by year - match dates within the year
    if (year) {
      filtered = filtered.filter(row => {
        if (row.date_bin_start) {
          const rowYear = new Date(row.date_bin_start).getFullYear().toString()
          return rowYear === year
        }
        if (row.year) {
          return row.year === year
        }
        return false // If no date info, exclude it
      })
    }

    // Filter by municipality (if provided)
    if (municipality) {
      filtered = filtered.filter(row => row.region === municipality)
    }

    // Get all valid taxa from taxaNameMap
    const allTaxa = Object.keys(taxaNameMap)

    // Group by taxa and sum catch - only for taxa in taxaNameMap
    const grouped: Record<string, number> = {}
    filtered.forEach(row => {
      const taxa = row.grouped_taxa
      if (allTaxa.includes(taxa)) {
        if (!grouped[taxa]) grouped[taxa] = 0
        grouped[taxa] += row.catch || 0
      }
    })

    // Add missing taxa with 0 values
    allTaxa.forEach(taxa => {
      if (!grouped[taxa]) {
        grouped[taxa] = 0
      }
    })

    return Object.entries(grouped)
      .map(([taxa, catchValue]) => ({
        taxa,
        displayName: taxaNameMap[taxa] || taxa,
        catch: catchValue / 1000 // Convert to tons (keep decimals for better precision)
      }))
      .sort((a, b) => b.catch - a.catch)
  }, [data, taxaNameMap, year, municipality])

  if (chartData.length === 0) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: `${height}px`, color: '#999' }}
      >
        {t('common.no_data', { defaultValue: 'No data available' })}
      </div>
    )
  }

  const catchLabel = t('catch.catch_t', { defaultValue: 'Catch (tons)' })
  const tonsLabel = t('units.tons', { defaultValue: 'tons' })

  // Calculate dynamic height based on number of taxa (minimum 40px per bar, add padding for legend/labels)
  // Ensure minimum height but allow growth based on data
  const dynamicHeight = Math.max(height, chartData.length * 45 + 100)

  const series = [{
    name: catchLabel,
    data: chartData.map(d => ({
      x: d.displayName,
      y: d.catch
    }))
  }]

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
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
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        barHeight: '70%',
      }
    },
    colors: chartData.map((_, i) => colors[i % colors.length] || '#206bc4'),
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
      width: 0,
      curve: 'smooth',
      lineCap: 'round',
    },
    xaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
        },
        formatter: (val: string | number) => {
          const numVal = typeof val === 'string' ? parseFloat(val) : val
          return numVal.toLocaleString()
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
        }
      }
    },
    legend: { show: false },
    tooltip: {
      theme: theme,
      y: {
        formatter: (val: number) => `${val.toLocaleString()} ${tonsLabel}`
      }
    },
    grid: {
      strokeDashArray: 4,
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      padding: {
        top: -20,
        right: 0,
        left: -4,
        bottom: 0,
      },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={dynamicHeight}
    />
  )
}

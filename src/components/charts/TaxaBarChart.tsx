import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useI18n } from '../../i18n'
import { useTheme } from '../../hooks/useTheme'

interface TaxaRecord {
  grouped_taxa: string
  catch: number
  [key: string]: any
}

interface TaxaBarChartProps {
  data: TaxaRecord[]
  taxaNameMap: Record<string, string>
  year?: string
  colors?: string[]
  height?: number
}

export default function TaxaBarChart({
  data,
  taxaNameMap,
  year = 'all',
  colors = [],
  height = 400
}: TaxaBarChartProps) {
  const { t } = useI18n()
  const theme = useTheme()
  const chartData = useMemo(() => {
    // ... filtering and grouping logic ...
    const filtered = year === 'all' ? data : data.filter(d => d.year === year)
    const grouped: Record<string, number> = {}
    filtered.forEach(row => {
      const taxa = row.grouped_taxa
      if (!grouped[taxa]) grouped[taxa] = 0
      grouped[taxa] += row.catch || 0
    })
    return Object.entries(grouped)
      .map(([taxa, catchValue]) => ({
        taxa,
        displayName: taxaNameMap[taxa] || taxa,
        catch: Math.round(catchValue / 1000)
      }))
      .sort((a, b) => b.catch - a.catch)
  }, [data, taxaNameMap, year])

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

  const series = [{
    name: catchLabel,
    data: chartData.map(d => d.catch)
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
        horizontal: false,
        distributed: true,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: chartData.map((_, i) => colors[i % colors.length] || '#206bc4'),
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.map(d => d.displayName),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -45,
        rotateAlways: chartData.length > 5,
        style: {
          fontSize: '11px',
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
        },
        trim: true,
        maxHeight: 120,
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          colors: theme === 'dark' ? '#6c7a91' : '#656d77',
        },
        formatter: (val: number) => val.toLocaleString()
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
      height={height}
    />
  )
}

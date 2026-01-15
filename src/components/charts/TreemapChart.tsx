import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { habitatPalette } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../i18n'

export interface TreemapDataItem {
  x: string
  y: number
}

export interface HierarchicalTreemapData {
  name: string
  data: TreemapDataItem[]
}

interface TreemapChartProps {
  data: TreemapDataItem[] | HierarchicalTreemapData[]
  title?: string
  colors?: string[]
  height?: number
  unit?: string
}

export default function TreemapChart({
  data,
  title,
  colors = habitatPalette,
  height = 450,
  unit,
}: TreemapChartProps) {
  const theme = useTheme()
  const { t } = useI18n()
  const displayUnit = unit ?? t('units.kg', { defaultValue: 'kg' })

  if (!data || data.length === 0) {
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

  // Check if data is hierarchical (has 'name' property) or flat
  const isHierarchical = 'name' in data[0]

  // For hierarchical data, ApexCharts expects series array with each habitat as a series
  const series = isHierarchical
    ? (data as HierarchicalTreemapData[]).map(habitat => ({
        name: habitat.name,
        data: habitat.data
      }))
    : [{ data: data as TreemapDataItem[] }]

  const options: ApexOptions = {
    chart: {
      type: 'treemap',
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      toolbar: {
        show: false,
      },
    },
    theme: {
      mode: theme,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '15px',
      fontFamily: 'inherit',
      labels: {
        colors: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
      markers: {
        size: 4,
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 0,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'inherit',
      },
      formatter: function (text: string, op: any) {
        return `${text}: ${op.value.toLocaleString()} ${displayUnit}`
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: [theme === 'dark' ? '#1b2434' : '#fff'],
    },
    plotOptions: {
      treemap: {
        distributed: !isHierarchical,
        enableShades: isHierarchical,
        shadeIntensity: 0.5,
      },
    },
    colors: colors,
    tooltip: {
      theme: theme,
      y: {
        formatter: (val: number) => `${val.toLocaleString()} ${displayUnit}`,
      },
    },
  }

  if (title) {
    options.title = {
      text: title,
      align: 'center',
    }
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="treemap"
      height={height}
    />
  )
}

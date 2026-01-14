import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { habitatPalette } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'

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
}

export default function TreemapChart({
  data,
  title,
  colors = habitatPalette,
  height = 450,
}: TreemapChartProps) {
  const theme = useTheme()

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
        No data available
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
    },
    theme: {
      mode: theme,
    },
    legend: {
      show: true,
      position: 'top',
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
      formatter: function (text: string, op: any) {
        return [text, op.value.toFixed(2) + ' Kg']
      },
    },
    plotOptions: {
      treemap: {
        distributed: !isHierarchical,
        enableShades: isHierarchical,
        shadeIntensity: 0.5,
      },
    },
    colors: colors,
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

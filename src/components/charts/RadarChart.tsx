import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { spiderColors } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../i18n'

export interface RadarChartSeries {
  name: string
  data: number[]
}

interface RadarChartProps {
  series: RadarChartSeries[]
  categories: string[]
  height?: number
  colors?: string[]
  yFormatter?: (val: number) => string
}

export default function RadarChart({
  series,
  categories,
  height = 380,
  colors = spiderColors,
  yFormatter = (val) => `$${val.toFixed(2)}`,
}: RadarChartProps) {
  const theme = useTheme()
  const { t } = useI18n()

  if (!series || series.length === 0 || !categories || categories.length === 0) {
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
      type: 'radar',
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
    xaxis: {
      categories,
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
    markers: { size: 4 },
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontFamily: 'inherit',
      labels: {
        colors: theme === 'dark' ? '#6c7a91' : '#656d77',
      },
    },
    colors,
    grid: {
      strokeDashArray: 4,
      padding: { top: -20, right: -25, left: -25, bottom: -30 },
    },
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radar"
      height={height}
    />
  )
}

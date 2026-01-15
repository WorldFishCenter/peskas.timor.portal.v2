import React from 'react'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { donutBlue } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../i18n'

export interface DonutChartData {
  label: string
  value: number
}

interface DonutChartProps {
  data: DonutChartData[]
  title?: string
  colors?: string[]
  height?: number
}

function DonutChart({
  data,
  title,
  colors = donutBlue,
  height = 280,
}: DonutChartProps) {
  const theme = useTheme()
  const { t } = useI18n()

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

  const series = data.map((d) => d.value)
  const labels = data.map((d) => d.label)

  const options: ApexOptions = {
    chart: {
      type: 'donut',
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
    labels: labels,
    colors: colors,
    stroke: {
      show: true,
      width: 2,
      colors: [theme === 'dark' ? '#1b2434' : '#fff'],
      curve: 'smooth',
      lineCap: 'round',
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '11px',
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
        vertical: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '12px',
              fontWeight: 400,
              color: theme === 'dark' ? '#6c7a91' : '#656d77',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: theme === 'dark' ? '#f5f7f9' : '#1d273b',
              offsetY: 10,
              formatter: (val: string) => parseInt(val).toLocaleString(),
            },
            total: {
              show: true,
              label: t('common.total', { defaultValue: 'Total' }),
              fontSize: '12px',
              fontWeight: 400,
              color: theme === 'dark' ? '#6c7a91' : '#656d77',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                return total.toLocaleString()
              },
            },
          },
        },
      },
    },
    tooltip: {
      theme: theme,
      y: {
        formatter: (val: number) => val.toLocaleString(),
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
      type="donut"
      height={height}
    />
  )
}

export default React.memo(DonutChart)

/**
 * Shared chart configuration utilities
 * Common patterns and configurations for ApexCharts
 */

import type { ApexOptions } from 'apexcharts'

export type Theme = 'light' | 'dark'

/**
 * Base chart configuration shared across all charts
 */
export function getBaseChartConfig(theme: Theme): Partial<ApexOptions> {
  return {
    chart: {
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
  }
}

/**
 * Common label styling based on theme
 */
export function getLabelStyle(theme: Theme, fontSize: string = '12px') {
  return {
    colors: theme === 'dark' ? '#6c7a91' : '#656d77',
    fontSize,
    fontFamily: 'inherit',
  }
}

/**
 * Common axis label styling
 */
export function getAxisLabelStyle(theme: Theme, fontSize: string = '11px') {
  return {
    style: getLabelStyle(theme, fontSize),
  }
}

/**
 * Common legend configuration
 */
export function getLegendConfig(theme: Theme, position: 'top' | 'bottom' = 'bottom', fontSize: string = '14px'): Partial<ApexOptions['legend']> {
  return {
    position,
    fontSize,
    fontFamily: 'inherit',
    labels: {
      colors: theme === 'dark' ? '#6c7a91' : '#656d77',
    },
  }
}

/**
 * Common grid configuration
 */
export function getGridConfig(theme: Theme, padding?: { top?: number; right?: number; left?: number; bottom?: number }): Partial<ApexOptions['grid']> {
  return {
    strokeDashArray: 4,
    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    ...(padding && { padding }),
  }
}

/**
 * Common "no data" message text
 * Use this in chart components with useI18n hook
 */
export const NO_DATA_MESSAGE_KEY = 'common.no_data' as const
export const NO_DATA_MESSAGE_DEFAULT = 'No data available' as const

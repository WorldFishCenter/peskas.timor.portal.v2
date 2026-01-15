/**
 * Route configuration
 * Centralized route definitions for the application
 */

export const ROUTES = {
  HOME: '/home',
  CATCH: '/catch',
  REVENUE: '/revenue',
  MARKET: '/market',
  COMPOSITION: '/composition',
  NUTRIENTS: '/nutrients',
  TRACKS: '/tracks',
  ABOUT: '/about',
  DATA_TEST: '/data-test',
} as const

export type Route = typeof ROUTES[keyof typeof ROUTES]

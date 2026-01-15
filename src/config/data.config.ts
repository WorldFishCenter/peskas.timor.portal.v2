/**
 * Data configuration
 * Centralized configuration for data loading and paths
 */

export const DATA_CONFIG = {
  /** Base path for data files in public directory */
  BASE_PATH: '/data',
  
  /** Cache TTL in milliseconds (5 minutes) */
  CACHE_TTL_MS: 5 * 60 * 1000,
  
  /** Default cache setting for data loading */
  DEFAULT_USE_CACHE: true,
} as const

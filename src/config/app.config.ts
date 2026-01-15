/**
 * Application configuration
 * Centralized application settings and constants
 */

export const APP_CONFIG = {
  /** Application name */
  NAME: 'PESKAS | Timor-Leste',
  
  /** Application version */
  VERSION: '2.0.0',
  
  /** Default language */
  DEFAULT_LANGUAGE: 'en' as const,
  
  /** Supported languages */
  SUPPORTED_LANGUAGES: ['en', 'tet', 'pt'] as const,
} as const

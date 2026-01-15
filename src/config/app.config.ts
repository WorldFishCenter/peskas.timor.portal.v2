/**
 * Application configuration
 * Static configuration values that were previously in pars.json
 */

/**
 * Variable formatting and display configuration
 */
export const VARIABLE_CONFIG: Record<string, {
  format?: string
  multiplier?: number
  suffix?: string
  quality?: 'low' | 'medium' | 'high'
}> = {
  n_landings: { format: ',' },
  n_tracks: { format: ',' },
  n_matched: { format: ',' },
  revenue: { format: '$,.2r', quality: 'medium' },
  recorded_revenue: { format: '$,.2r', quality: 'high' },
  catch: { format: ',.2r', multiplier: 0.001, suffix: ' t', quality: 'medium' },
  recorded_catch: { format: ',.2r', multiplier: 0.001, suffix: ' t', quality: 'high' },
  price_kg: { format: '$,.2r', quality: 'medium' },
  landing_revenue: { format: '$,.2r', quality: 'medium' },
  landing_weight: { format: ',.3r', suffix: ' kg', quality: 'medium' },
  n_landings_per_boat: { format: ',.3r', quality: 'low' },
  n_boats: { format: ',', quality: 'high' },
  prop_landings_woman: { format: '.1%' },
  pds_tracks_trips: { format: ',.3r', quality: 'low' },
  pds_tracks_cpe: { format: ',.3r', quality: 'medium' },
  pds_tracks_rpe: { format: ',.3r', quality: 'high' },
  nut_supply: { format: ',.3r', multiplier: 0.001, suffix: ' Kg' },
  nut_rdi: { format: ',.3r', multiplier: 0.001, suffix: ' k' },
}

/**
 * Taxa display order
 */
export const TAXA_DISPLAY_ORDER = ['CLP', 'FLY', 'TUN', 'SDX', 'GZP', 'SNA', 'CGX', 'CJX', 'BEN', 'MOO', 'RAX', 'LWX', 'MZZ'] as const

/**
 * Nutrients display order
 */
export const NUTRIENTS_DISPLAY_ORDER = ['omega3', 'protein', 'zinc', 'calcium', 'vitaminA', 'iron'] as const

/**
 * Mapping from English display names (as they appear in data) to nutrient keys
 */
export const NUTRIENT_NAME_TO_KEY: Record<string, string> = {
  'Protein': 'protein',
  'Zinc': 'zinc',
  'Vitamin A': 'vitaminA',
  'Omega-3': 'omega3',
  'Calcium': 'calcium',
  'Iron': 'iron',
  'Selenium': 'selenium', // Not in display order but may appear in data
}

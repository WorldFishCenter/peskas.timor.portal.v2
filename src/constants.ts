export const MUNICIPALITIES = [
  'all',
  'ainaro',
  'atauro',
  'baucau',
  'bobonaro',
  'covalima',
  'dili',
  'lautem',
  'liquica',
  'manatuto',
  'manufahi',
  'oecusse',
  'viqueque'
] as const
export type Municipality = typeof MUNICIPALITIES[number]

export const MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const
export type MonthShort = typeof MONTHS_SHORT[number]

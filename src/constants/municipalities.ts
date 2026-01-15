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

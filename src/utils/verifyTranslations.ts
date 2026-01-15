/**
 * Translation Verification Utility
 * 
 * This utility helps verify that all translation keys are properly defined
 * and accessible. Run this in the browser console to check for missing keys.
 */

import type { Lang } from '../i18n'

type Dict = Record<string, unknown>

// Import dictionaries - need to access them differently
// We'll check them at runtime instead

// Helper to get all keys from a nested object
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

export function verifyTranslations(dicts: Record<'en' | 'tet' | 'pt', Dict>) {
  const enKeys = getAllKeys(dicts.en)
  const tetKeys = getAllKeys(dicts.tet)
  const ptKeys = getAllKeys(dicts.pt)

  // Find missing keys
  const missingInTet = enKeys.filter(key => !tetKeys.includes(key))
  const missingInPt = enKeys.filter(key => !ptKeys.includes(key))

  console.log('=== Translation Verification ===')
  console.log(`Total keys in English: ${enKeys.length}`)
  console.log(`Total keys in Tetum: ${tetKeys.length}`)
  console.log(`Total keys in Portuguese: ${ptKeys.length}`)
  
  if (missingInTet.length > 0) {
    console.warn(`Missing in Tetum (${missingInTet.length}):`, missingInTet)
  } else {
    console.log('✓ All English keys present in Tetum')
  }
  
  if (missingInPt.length > 0) {
    console.warn(`Missing in Portuguese (${missingInPt.length}):`, missingInPt)
  } else {
    console.log('✓ All English keys present in Portuguese')
  }
  
  return {
    enKeys,
    tetKeys,
    ptKeys,
    missingInTet,
    missingInPt,
    allComplete: missingInTet.length === 0 && missingInPt.length === 0
  }
}

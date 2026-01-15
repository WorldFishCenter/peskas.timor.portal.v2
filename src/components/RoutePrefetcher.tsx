import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGE_DATA_REQUIREMENTS } from '../hooks/useData'
import { prefetchData } from '../utils/dataLoader'
import type { DataFileName } from '../types/data'

/**
 * Component that prefetches data for likely next pages based on current route
 * Improves perceived performance by loading data in advance
 */
export default function RoutePrefetcher() {
  const location = useLocation()

  useEffect(() => {
    // Prefetch data for adjacent/related pages
    const currentPath = location.pathname

    // Determine likely next pages based on current route
    const prefetchRoutes: Array<keyof typeof PAGE_DATA_REQUIREMENTS> = []

    if (currentPath.includes('/home')) {
      // From home, likely to visit catch or revenue
      prefetchRoutes.push('catch', 'revenue')
    } else if (currentPath.includes('/catch')) {
      // From catch, likely to visit revenue or composition
      prefetchRoutes.push('revenue', 'composition')
    } else if (currentPath.includes('/revenue')) {
      // From revenue, likely to visit market or catch
      prefetchRoutes.push('market', 'catch')
    } else if (currentPath.includes('/market')) {
      // From market, likely to visit composition or nutrients
      prefetchRoutes.push('composition', 'nutrients')
    } else if (currentPath.includes('/composition')) {
      // From composition, likely to visit nutrients
      prefetchRoutes.push('nutrients')
    }

    // Prefetch data for likely next pages (with delay to not interfere with current page)
    if (prefetchRoutes.length > 0) {
      const timeoutId = setTimeout(() => {
        prefetchRoutes.forEach(route => {
          const dataFiles = PAGE_DATA_REQUIREMENTS[route] as readonly DataFileName[]
          prefetchData([...dataFiles])
        })
      }, 2000) // Wait 2 seconds after page load

      return () => clearTimeout(timeoutId)
    }
  }, [location.pathname])

  return null // This component doesn't render anything
}

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    gtag: (command: string, id: string, config?: any) => void
  }
}

/**
 * Component that tracks page views on route changes for Google Analytics
 */
export default function Analytics() {
  const location = useLocation()

  useEffect(() => {
    if (window.gtag) {
      const path = location.pathname + location.search

      // Send pageview to UA (Legacy)
      window.gtag('config', 'UA-146082632-1', {
        page_path: path,
      })

      // Send pageview to GA4 (Modern)
      window.gtag('config', 'G-J430YJ6DC5', {
        page_path: path,
      })
    }
  }, [location])

  return null
}

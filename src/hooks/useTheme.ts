/**
 * Hook to detect current theme (light/dark) from Tabler's data-bs-theme attribute
 */
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check the html element's data-bs-theme attribute or system preference
    const htmlElement = document.documentElement;
    const dataTheme = htmlElement.getAttribute('data-bs-theme');

    if (dataTheme === 'dark') return 'dark';
    if (dataTheme === 'light') return 'light';

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    const htmlElement = document.documentElement;

    // Create a MutationObserver to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-bs-theme') {
          const newTheme = htmlElement.getAttribute('data-bs-theme');
          if (newTheme === 'dark' || newTheme === 'light') {
            setTheme(newTheme);
          }
        }
      });
    });

    // Start observing
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['data-bs-theme'],
    });

    // Also listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no explicit data-bs-theme is set
      const explicitTheme = htmlElement.getAttribute('data-bs-theme');
      if (!explicitTheme || explicitTheme === 'auto') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return theme;
}

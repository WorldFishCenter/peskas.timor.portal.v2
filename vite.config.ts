import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/layout': path.resolve(__dirname, './src/layout'),
      '@/context': path.resolve(__dirname, './src/context'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chart libraries (heavy)
          'chart-vendor': ['apexcharts', 'react-apexcharts'],
          // Map libraries (very heavy)
          'map-vendor': [
            'deck.gl',
            '@deck.gl/react',
            '@deck.gl/layers',
            '@deck.gl/aggregation-layers',
            'maplibre-gl',
            '@vis.gl/react-maplibre',
          ],
          // Table library
          'table-vendor': ['@tanstack/react-table'],
          // UI framework
          'ui-vendor': ['@tabler/core'],
        },
      },
    },
    // Increase chunk size warning limit (we're splitting manually)
    chunkSizeWarningLimit: 1000,
  },
})

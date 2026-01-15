# PESKAS | Timor-Leste Portal v2

A React-based data visualization portal for fishing data in Timor-Leste, built with TypeScript, Vite, and modern web technologies.

## Features

- **Multi-language Support**: English, Tetum, and Portuguese translations
- **Interactive Visualizations**: Charts and maps powered by ApexCharts and DeckGL
- **Responsive Design**: Modern UI built with Tabler CSS framework
- **Dark Mode**: Theme switching support
- **Data-Driven**: Dynamic loading of JSON data files with caching

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Charts**: ApexCharts
- **Maps**: DeckGL with MapLibre GL
- **Routing**: React Router v6
- **Styling**: Tabler CSS Framework
- **State Management**: React Context API

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── charts/        # Chart components (ApexCharts)
│   └── ...            # Other UI components
├── config/            # Application configuration
│   ├── app.config.ts  # App settings
│   ├── data.config.ts # Data loading configuration
│   └── routes.config.ts # Route definitions
├── constants/         # Application constants
│   ├── colors.ts      # Color palettes
│   ├── municipalities.ts # Municipality data
│   └── months.ts      # Month constants
├── context/           # React Context providers
├── hooks/             # Custom React hooks
│   ├── useData.ts     # Data loading hooks
│   └── ...            # Other custom hooks
├── i18n.tsx           # Internationalization setup
├── layout/            # Layout components
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    ├── charts/         # Chart utility functions
    ├── dataLoader.ts   # Data fetching utilities
    └── ...            # Other utilities
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## Configuration

### Path Aliases

The project uses path aliases for cleaner imports:

- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`
- `@/constants/*` → `src/constants/*`
- `@/config/*` → `src/config/*`
- `@/pages/*` → `src/pages/*`
- `@/layout/*` → `src/layout/*`
- `@/context/*` → `src/context/*`

### Data Files

Data files are expected in the `public/data/` directory as JSON files. The application uses typed data loading with caching (5-minute TTL).

## Key Components

### MetricCard

Reusable metric card component for displaying key metrics with optional trend indicators and sparkline charts.

### Chart Components

- `TimeSeriesChart`: Time series line/area charts
- `StackedBarChart`: Stacked bar charts
- `DonutChart`: Donut/pie charts
- `RadarChart`: Radar/spider charts
- `TreemapChart`: Treemap visualizations
- `SparklineChart`: Small inline sparkline charts

### Data Loading

The app uses custom hooks for data loading:

- `useData(fileName)`: Load a single data file
- `useMultipleData(fileNames)`: Load multiple data files in parallel
- `usePageData(pageName)`: Load all data required for a specific page

All data loading includes:
- Loading states
- Error handling
- Automatic caching (5-minute TTL)
- Type safety via TypeScript

## Internationalization

The app supports three languages:
- English (`en`)
- Tetum (`tet`)
- Portuguese (`pt`)

Translations are managed in `src/i18n.tsx`. Use the `useI18n()` hook to access translations:

```tsx
const { t, lang, setLang } = useI18n()
const title = t('nav.catch')
```

## License

See LICENSE.md for details.

## Contributing

This project follows modern React and TypeScript best practices:

- Type-safe code with strict TypeScript
- Component-based architecture
- Reusable utilities and hooks
- Centralized configuration
- Consistent code organization

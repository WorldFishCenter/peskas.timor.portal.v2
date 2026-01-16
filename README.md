# Web portal: Peskas - Timor (v2)

**Authoritative version**: `peskas.timor.portal.v2` (replaces the original R/Shiny portal)

A web portal displaying data and insights from small fisheries in East Timor. This project provides a comprehensive dashboard for monitoring fishery indicators, catch trends, revenue, and vessel activity across the country.

## About the Project

Peskas - Timor is part of a larger ecosystem designed to process and visualize data from small-scale fisheries. The portal aims to provide stakeholders with real-time insights into:
- **Catch Trends**: Monthly aggregated catch data and composition.
- **Revenue & Economy**: Estimated revenue, revenue per trip, and price per kg.
- **Vessel Activity**: Monitoring of fishing tracks and active boat counts.
- **Nutritional Information**: Nutrient RDI contributions from different fish species.

The content of the dashboard is automatically updated through GitHub Actions, which syncs processed data from the Google Cloud Storage bucket managed by the complementary data processing pipeline.

## Key Features

- **Multilingual Support**: Full support for **English**, **Tetum**, and **Portuguese**.
- **Interactive Data Visualization**: 
  - Time series analysis of catch and revenue.
  - Habitat and taxa composition via Treemaps and Bar charts.
  - High-performance mapping of vessel tracks using DeckGL and MapLibre.
- **Performance Optimized**: Built with modern web standards for fast load times and smooth interactions on both desktop and mobile.
- **Automated Data Sync**: Daily synchronization with the data pipeline ensures the portal always shows the latest available records.

## Tech Stack

This version (v2) is a complete rewrite of the original R/Shiny portal, moving to a modern JavaScript/TypeScript architecture for better scalability and performance:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Visualizations**: ApexCharts (Charts) and DeckGL (Maps)
- **Styling**: Tabler UI Framework
- **Deployment**: Vercel

## Development

### Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/WorldFishCenter/peskas.timor.portal.v2
    cd peskas.timor.portal.v2
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start development server**:
    ```bash
    npm run dev
    ```

### Data Fetching

To fetch the latest data from Google Cloud Storage locally, you will need to set up a `.env` file with your GCP credentials (see `.env.example`):

```bash
npm run fetch-data
```

## Deployment

The portal is optimized for deployment on **Vercel**. It includes a `vercel.json` configuration for:
- SPA routing and redirects.
- Aggressive caching for static assets.
- Enhanced security headers.

To deploy, simply push to the `main` or `master` branch.

## Code of Conduct

Please note that the Peskas Timor Portal project is released with a Contributor Code of Conduct. By contributing to this project, you agree to abide by its terms.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

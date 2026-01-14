# Shiny to React Color Palettes

This document extracts and documents all color palettes used in the Shiny app for consistent implementation in React.

## Summary

| Palette | Source File | Usage | React Location |
|---------|-------------|-------|----------------|
| habitatPalette | app_server.R | Treemaps, habitat charts | src/constants/colors.ts |
| tabPalette | app_server.R | Summary table backgrounds | src/constants/colors.ts |
| donutBlue | app_server.R | Donut charts (trips, revenue) | src/constants/colors.ts |
| spiderColors | app_server.R | Radar/spider charts | src/constants/colors.ts |
| viridis | d3-scale-chromatic | Dynamic (fish, taxa, conservation) | d3-scale-chromatic import |
| heatmapColors | tab_home_content.R | DeckGL hexagon map | src/constants/colors.ts |

---

## 1. Habitat Palette

**Source:** `app_server.R` - `habitatPalette`

**Usage:** Treemaps for catch/revenue by habitat, habitat charts

**Hex Values:**
```typescript
export const habitatPalette = [
  "#440154",  // Dark purple (Viridis start)
  "#30678D",  // Dark blue
  "#35B778",  // Green
  "#FDE725",  // Yellow (Viridis end)
  "#FCA35D",  // Orange
  "#D32F2F",  // Red
  "#67001F"   // Dark red/maroon
];
```

**React Implementation:** `src/constants/colors.ts`

---

## 2. Tab/Table Palette

**Source:** `app_server.R` - `tabPalette`

**Usage:** SummaryTable cell backgrounds (gradient from white to teal)

**Hex Values:**
```typescript
export const tabPalette = [
  "#ffffff",  // White (min value)
  "#f2fbd2",  // Light yellow-green
  "#c9ecb4",  // Light green
  "#93d3ab",  // Medium green
  "#35b0ab"   // Teal (max value)
];
```

**React Implementation:** `src/constants/colors.ts` - Used with biased interpolation in SummaryTable

---

## 3. Donut Blue

**Source:** `app_server.R` - Home tab donut charts

**Usage:** Trips by area, Revenue by area, Fish by group

**Hex Values:**
```typescript
export const donutBlue = [
  "#d7eaf3",  // Light blue (smallest slice)
  "#77b5d9",  // Medium blue
  "#14397d"   // Dark blue (largest slice)
];
```

**React Implementation:** `src/constants/colors.ts` - Used in Home.tsx DonutChart components

---

## 4. Spider/Radar Colors

**Source:** `app_server.R` - Market tab

**Usage:** Radar chart for habitat comparison

**Hex Values:**
```typescript
export const spiderColors = [
  "#c57b57",  // Brown/tan
  "#96BDC6"   // Light blue-gray
];
```

**React Implementation:** `src/constants/colors.ts`

---

## 5. Viridis (Dynamic)

**Source:** d3-scale-chromatic library

**Usage:** Fish donut (5 colors), Taxa treemap (13 colors), Conservation (5 colors)

**Implementation:**
```typescript
import { interpolateViridis } from 'd3-scale-chromatic';

// Generate n viridis colors
const viridisColors = (n: number) => 
  Array.from({ length: n }, (_, i) => interpolateViridis(i / (n - 1)));
```

**React Implementation:** Import directly from `d3-scale-chromatic` (already installed)

**Example Usage:**
```typescript
// For fish donut with 5 groups
const fishColors = viridisColors(5);
// Result: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"]

// For taxa with 13 groups
const taxaColors = viridisColors(13);

// For conservation with 5 methods
const conservationColors = viridisColors(5);
```

---

## 6. Heatmap Colors

**Source:** `tab_home_content.R` - DeckGL HexagonLayer

**Usage:** Fishing tracks hexagon heatmap

**RGB Values:**
```typescript
export const heatmapColors: [number, number, number][] = [
  [1, 152, 189],    // Cyan
  [73, 227, 206],   // Light teal
  [216, 254, 181],  // Light green
  [239, 254, 172],  // Yellow-green (from Shiny)
  [255, 255, 217]   // Pale yellow
];
```

**Note:** DeckGL requires RGB arrays, not hex strings

**React Implementation:** `src/constants/colors.ts` - Used in Tracks.tsx HexagonLayer

---

## Color Usage by Page

| Page | Palettes Used |
|------|---------------|
| Home | donutBlue, tabPalette (table), heatmapColors (if showing map) |
| Catch | tabPalette (treemap) |
| Revenue | tabPalette (treemap) |
| Composition | habitatPalette (treemap) |
| Market | spiderColors, viridis (conservation bar) |
| Nutrients | habitatPalette |
| Tracks | heatmapColors |

---

## Implementation Status

| Palette | In colors.ts | Used in Components |
|---------|--------------|-------------------|
| habitatPalette | ✅ | ✅ Composition, Nutrients |
| tabPalette | ✅ | ✅ SummaryTable |
| donutBlue | ✅ | ✅ Home DonutCharts |
| spiderColors | ✅ | ✅ Market |
| viridis | N/A (d3 import) | ✅ Market (conservation) |
| heatmapColors | ✅ | ✅ Tracks |

All 6 color palettes are extracted and implemented.

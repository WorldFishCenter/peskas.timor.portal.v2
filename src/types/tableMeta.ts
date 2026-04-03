import type { CSSProperties } from 'react';

/** TanStack Table column meta for heatmap cell backgrounds. */
export type HeatmapColumnMeta<V = number | null> = {
  style?: (value: V) => CSSProperties;
};

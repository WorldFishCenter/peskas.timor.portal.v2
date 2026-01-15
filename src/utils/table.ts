export function interpolateColor(colors: string[], t: number, opacity: number = 1): string {
  const n = colors.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const f = t * n - i;

  const c1 = colors[i];
  const c2 = colors[i + 1];

  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);

  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  const r = Math.round(r1 + f * (r2 - r1));
  const g = Math.round(g1 + f * (g2 - g1));
  const b = Math.round(b1 + f * (b2 - b1));

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function normalize(value: number, values: number[]): number {
  const valid = values.filter(v => !isNaN(v));
  if (valid.length === 0) return 0.5;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (min === max) return 0.5;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, isNaN(normalized) ? 0.5 : normalized));
}

export function biasedNormalize(value: number, values: number[], bias: number = 2): number {
  const n = normalize(value, values);
  return Math.pow(n, 1 / bias);
}

export function getHeatmapStyle(value: number, values: number[], theme: 'light' | 'dark', _tabPalette: string[]) {
  if (value === undefined || value === null || isNaN(value) || values.length === 0) return {};
  
  const t = biasedNormalize(value, values);
  
  // Base teal color from the palette: #35b0ab -> rgba(53, 176, 171)
  const baseColor = '53, 176, 171';
  
  // Use a clear range of opacity for visibility
  // Light mode: 0.05 to 0.5
  // Dark mode: 0.1 to 0.45
  const minOpacity = theme === 'dark' ? 0.1 : 0.05;
  const maxOpacity = theme === 'dark' ? 0.45 : 0.5;
  const opacity = minOpacity + (t * (maxOpacity - minOpacity));
  
  return {
    backgroundColor: `rgba(${baseColor}, ${opacity})`,
    // Do NOT set text color or font weight; let the theme handle it for consistency
  };
}

/** Smarter display for summary tables when magnitude varies (avoids 0.0 / $0.00 for small recorded values). */

/** Shown when a source field is absent (distinct from a numeric zero). */
export const SUMMARY_MISSING = '-'

export function formatSummaryNullable(
  format: (n: number) => string,
  n: number | null | undefined
): string {
  if (n == null) return SUMMARY_MISSING
  return format(n)
}

/** Values present in the table column (excludes null/undefined) for heatmaps and aggregates. */
export function summaryNumericColumn(values: (number | null | undefined)[]): number[] {
  return values.filter((v): v is number => v != null)
}

export function formatTonnes(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a < 1e-8) return '0'
  if (a < 0.01) return n.toFixed(4)
  if (a < 0.1) return n.toFixed(3)
  if (a < 1) return n.toFixed(2)
  if (a < 10) return n.toFixed(1)
  if (a < 100) return n.toFixed(1)
  return n.toFixed(0)
}

export function formatMillionsUsd(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a < 1e-9) return '$0'
  if (a < 0.01) return `$${n.toFixed(4)}`
  if (a < 0.1) return `$${n.toFixed(3)}`
  if (a < 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(2)}`
}

/** Catch per trip (kg) — extra precision when the average is below ~10 kg */
export function formatKg(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a < 10) return n.toFixed(2)
  if (a < 100) return n.toFixed(1)
  return n.toFixed(0)
}

/** Plain USD (e.g. average trip value), not scaled to millions */
export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a < 0.01) return `$${n.toFixed(3)}`
  if (a < 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(2)}`
}

export function formatTripsPerBoat(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a < 10) return n.toFixed(2)
  return n.toFixed(1)
}

/** Survey-recorded total catch (kg), same units as JSON */
export function formatRecordedCatchKg(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a < 1e-8) return '0'
  if (a < 1) return n.toFixed(2)
  if (a < 100) return n.toFixed(1)
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

/** Survey-recorded total revenue (USD), same units as JSON */
export function formatRecordedRevenueUsd(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a < 1e-6) return '$0'
  if (a < 1) return `$${n.toFixed(2)}`
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

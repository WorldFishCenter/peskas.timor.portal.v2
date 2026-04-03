/**
 * Helpers for monthly aggregated time series used in summary tables and charts.
 */
import type { AggregatedRecord, MunicipalAggregatedRecord } from '../types/data';

export type MonthSeriesRow = AggregatedRecord | MunicipalAggregatedRecord;

export function uniqueCalendarYearsDesc(rows: MonthSeriesRow[] | undefined): string[] {
  if (!rows?.length) return [];
  const years = [...new Set(rows.map((row) => new Date(row.date_bin_start).getFullYear().toString()))];
  return years.sort((a, b) => b.localeCompare(a));
}

export function filterRowsByCalendarYear(rows: MonthSeriesRow[], year: string): MonthSeriesRow[] {
  return rows.filter((row) => new Date(row.date_bin_start).getFullYear().toString() === year);
}

/** Newest first, then take up to `limit` rows. */
export function sortRecentMonths<T extends { date_bin_start: string }>(rows: T[], limit: number): T[] {
  return [...rows]
    .sort((a, b) => new Date(b.date_bin_start).getTime() - new Date(a.date_bin_start).getTime())
    .slice(0, limit);
}

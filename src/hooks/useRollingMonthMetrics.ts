import { useMemo } from 'react';
import type { MunicipalScopedAggregatedData } from '../types/data';
import type { MonthSeriesRow } from '../utils/monthSeries';

type TrendDirection = 'up' | 'down' | 'neutral';

export type RollingTrend = { value: string; direction: TrendDirection };

function sortMonthsChronological(rows: MonthSeriesRow[]) {
  return [...rows].sort(
    (a, b) => new Date(a.date_bin_start).getTime() - new Date(b.date_bin_start).getTime()
  );
}

function trendFromPercentChange(val: number): RollingTrend {
  return {
    value: `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`,
    direction: val > 0 ? 'up' : val < 0 ? 'down' : 'neutral',
  };
}

const emptyCatch = {
  totalCatch: '0',
  avgLandingWeight: '0',
  nBoats: '0',
  catchTrend: { value: '0%', direction: 'neutral' as const },
  weightTrend: { value: '0%', direction: 'neutral' as const },
  boatsTrend: { value: '0%', direction: 'neutral' as const },
  catchSparkline: [] as { date: string; value: number }[],
  weightSparkline: [] as { date: string; value: number }[],
};

export function useCatchRollingMetrics(aggregated: MunicipalScopedAggregatedData | null) {
  return useMemo(() => {
    if (!aggregated?.month || aggregated.month.length < 2) {
      return emptyCatch;
    }
    const sortedData = sortMonthsChronological(aggregated.month);
    const last12 = sortedData.slice(-12);
    const prev12 = sortedData.slice(-24, -12);

    const totalCatch = last12.reduce((sum, r) => sum + (r.catch ?? 0), 0);
    const prevCatch = prev12.reduce((sum, r) => sum + (r.catch ?? 0), 0);
    const catchChange = prevCatch ? ((totalCatch - prevCatch) / prevCatch) * 100 : 0;

    const avgWeight =
      last12.reduce((sum, r) => sum + (r.landing_weight ?? 0), 0) / last12.length;
    const prevWeight =
      prev12.length > 0
        ? prev12.reduce((sum, r) => sum + (r.landing_weight ?? 0), 0) / prev12.length
        : 0;
    const weightChange = prevWeight ? ((avgWeight - prevWeight) / prevWeight) * 100 : 0;

    const lastMonthBoats = last12[last12.length - 1]?.n_boats ?? 0;

    return {
      totalCatch: (totalCatch / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }),
      avgLandingWeight: avgWeight.toFixed(1),
      nBoats: lastMonthBoats.toLocaleString(),
      catchTrend: trendFromPercentChange(catchChange),
      weightTrend: trendFromPercentChange(weightChange),
      boatsTrend: { value: '0%', direction: 'neutral' as const },
      catchSparkline: last12.map((r) => ({
        date: r.date_bin_start,
        value: (r.catch ?? 0) / 1000,
      })),
      weightSparkline: last12.map((r) => ({
        date: r.date_bin_start,
        value: r.landing_weight ?? 0,
      })),
    };
  }, [aggregated]);
}

const emptyRevenue = {
  totalRevenue: '0',
  avgRevenuePerTrip: '0',
  nBoats: '0',
  revenueTrend: { value: '0%', direction: 'neutral' as const },
  tripTrend: { value: '0%', direction: 'neutral' as const },
  boatsTrend: { value: '0%', direction: 'neutral' as const },
  revenueSparkline: [] as { date: string; value: number }[],
  tripSparkline: [] as { date: string; value: number }[],
};

export function useRevenueRollingMetrics(aggregated: MunicipalScopedAggregatedData | null) {
  return useMemo(() => {
    if (!aggregated?.month || aggregated.month.length < 2) {
      return emptyRevenue;
    }
    const sortedData = sortMonthsChronological(aggregated.month);
    const last12 = sortedData.slice(-12);
    const prev12 = sortedData.slice(-24, -12);

    const totalRevenue = last12.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
    const prevRevenue = prev12.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
    const revenueChange = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const avgTrip =
      last12.reduce((sum, r) => sum + (r.landing_revenue ?? 0), 0) / last12.length;
    const prevTrip =
      prev12.length > 0
        ? prev12.reduce((sum, r) => sum + (r.landing_revenue ?? 0), 0) / prev12.length
        : 0;
    const tripChange = prevTrip ? ((avgTrip - prevTrip) / prevTrip) * 100 : 0;

    const lastMonthBoats = last12[last12.length - 1]?.n_boats ?? 0;

    return {
      totalRevenue: (totalRevenue / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }),
      avgRevenuePerTrip: avgTrip.toFixed(1),
      nBoats: lastMonthBoats.toLocaleString(),
      revenueTrend: trendFromPercentChange(revenueChange),
      tripTrend: trendFromPercentChange(tripChange),
      boatsTrend: { value: '0%', direction: 'neutral' as const },
      revenueSparkline: last12.map((r) => ({
        date: r.date_bin_start,
        value: (r.revenue ?? 0) / 1000000,
      })),
      tripSparkline: last12.map((r) => ({
        date: r.date_bin_start,
        value: r.landing_revenue ?? 0,
      })),
    };
  }, [aggregated]);
}

import { useLayoutEffect, useMemo, useState } from 'react';
import { uniqueCalendarYearsDesc, type MonthSeriesRow } from '../utils/monthSeries';

/**
 * Derives calendar years from monthly rows and keeps selected year in sync when the list changes.
 */
export function useMonthlyYearFilter(monthRows: MonthSeriesRow[] | undefined) {
  const years = useMemo(() => uniqueCalendarYearsDesc(monthRows), [monthRows]);

  const [selectedYear, setSelectedYear] = useState('');

  useLayoutEffect(() => {
    if (years.length === 0) return;
    setSelectedYear((prev) => (prev && years.includes(prev) ? prev : years[0]));
  }, [years]);

  return { years, selectedYear, setSelectedYear };
}

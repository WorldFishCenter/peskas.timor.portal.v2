/**
 * React hook for loading municipality-filtered data
 */
import { useMemo } from 'react';
import { useData } from './useData';
import { useFilters } from '../context/FilterContext';
import type { MunicipalAggregatedRecord, MunicipalMonthlySlice, MunicipalScopedAggregatedData } from '../types/data';

function buildMunicipalMonthlySlice(rows: MunicipalAggregatedRecord[]): MunicipalMonthlySlice {
  return { month: rows };
}

/**
 * Hook that returns municipality-filtered aggregated data
 * - If municipality is 'all', returns national aggregated data
 * - Otherwise, returns filtered municipal_aggregated rows as `{ month }` (municipal JSON is not fetched when national)
 */
export function useMunicipalData(): {
  data: MunicipalScopedAggregatedData | null;
  loading: boolean;
  error: Error | null;
} {
  const { municipality } = useFilters();
  const municipalEnabled = municipality !== 'all';

  const { data: nationalData, loading: nationalLoading, error: nationalError } = useData('aggregated');
  const { data: municipalData, loading: municipalLoading, error: municipalError } = useData(
    'municipal_aggregated',
    { enabled: municipalEnabled }
  );

  const filteredData = useMemo((): MunicipalScopedAggregatedData | null => {
    if (municipality === 'all') {
      return nationalData;
    }

    if (!municipalData) return null;

    const filtered = municipalData.filter(
      (row) => row.region.toLowerCase() === municipality.toLowerCase()
    );

    return buildMunicipalMonthlySlice(filtered);
  }, [municipality, nationalData, municipalData]);

  const loading = municipality === 'all' ? nationalLoading : nationalLoading || municipalLoading;
  const error = municipality === 'all' ? nationalError : nationalError || municipalError;

  return { data: filteredData, loading, error };
}

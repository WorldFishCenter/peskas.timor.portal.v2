/**
 * React hook for loading municipality-filtered data
 */
import { useMemo } from 'react';
import { useData } from './useData';
import { useFilters } from '../context/FilterContext';
import type { Municipality } from '../constants';

export interface MunicipalAggregatedRow {
  region: string;
  date_bin_start: string;
  is_imputed: boolean;
  n_landings_per_boat: number;
  landing_revenue: number;
  landing_weight: number;
  price_kg: number;
  revenue: number;
  catch: number;
  n_boats: number;
  recorded_catch?: number;
  recorded_revenue?: number;
  month: string;
  year: string;
}

export interface AggregatedRow {
  date_bin_start: string;
  is_imputed: boolean;
  n_landings_per_boat: number;
  landing_revenue: number;
  landing_weight: number;
  price_kg: number;
  revenue: number;
  catch: number;
  n_boats: number;
  recorded_catch?: number;
  recorded_revenue?: number;
  month: string;
  year: string;
}

/**
 * Hook that returns municipality-filtered aggregated data
 * - If municipality is 'all', returns national aggregated data
 * - Otherwise, returns filtered municipal_aggregated data for the selected municipality
 */
export function useMunicipalData() {
  const { municipality } = useFilters();
  const { data: nationalData, loading: nationalLoading, error: nationalError } = useData('aggregated');
  const { data: municipalData, loading: municipalLoading, error: municipalError } = useData('municipal_aggregated');

  const filteredData = useMemo(() => {
    if (municipality === 'all') {
      return nationalData;
    }

    if (!municipalData) return null;

    // Filter by selected municipality
    const filtered = (municipalData as MunicipalAggregatedRow[]).filter(
      row => row.region.toLowerCase() === municipality.toLowerCase()
    );

    return { month: filtered } as typeof nationalData;
  }, [municipality, nationalData, municipalData]);

  const loading = municipality === 'all' ? nationalLoading : (nationalLoading || municipalLoading);
  const error = municipality === 'all' ? nationalError : (nationalError || municipalError);

  return { data: filteredData, loading, error };
}

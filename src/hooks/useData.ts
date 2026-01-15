/**
 * React hook for loading data files with loading and error states
 */
import { useState, useEffect, useCallback } from 'react';
import type { DataFileName, DataTypeMap } from '../types/data';
import { fetchData, clearDataCache, DataLoadError } from '../utils/dataLoader';

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useData<T extends DataFileName>(
  fileName: T,
  options?: { useCache?: boolean }
): UseDataResult<DataTypeMap[T]> {
  const { useCache = true } = options ?? {};
  const [data, setData] = useState<DataTypeMap[T] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDataAsync = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(fileName, useCache);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fileName, useCache]);

  useEffect(() => {
    fetchDataAsync();
  }, [fetchDataAsync]);

  const refetch = useCallback(() => {
    if (useCache) {
      clearDataCache(fileName);
    }
    fetchDataAsync();
  }, [fileName, useCache, fetchDataAsync]);

  return { data, loading, error, refetch };
}

export interface UseMultipleDataResult<T extends DataFileName[]> {
  data: { [K in T[number]]: DataTypeMap[K] } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMultipleData<T extends DataFileName[]>(
  fileNames: T
): UseMultipleDataResult<T> {
  const [data, setData] = useState<{ [K in T[number]]: DataTypeMap[K] } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDataAsync = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        fileNames.map(async (fileName) => ({
          fileName,
          data: await fetchData(fileName, true), // Use cache for multiple data
        }))
      );

      const dataMap = Object.fromEntries(
        results.map(({ fileName, data }) => [fileName, data])
      ) as { [K in T[number]]: DataTypeMap[K] };

      setData(dataMap);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fileNames.join(',')]);

  useEffect(() => {
    fetchDataAsync();
  }, [fetchDataAsync]);

  const refetch = useCallback(() => {
    // Clear cache for all requested files
    fileNames.forEach(fileName => clearDataCache(fileName));
    fetchDataAsync();
  }, [fileNames, fetchDataAsync]);

  return { data, loading, error, refetch };
}

export { DataLoadError };

/**
 * Common data file combinations for pages
 */
export const PAGE_DATA_REQUIREMENTS = {
  home: ['summary_data', 'aggregated'] as const,
  catch: ['aggregated', 'taxa_aggregated', 'municipal_aggregated'] as const,
  revenue: ['aggregated', 'municipal_aggregated', 'summary_data'] as const,
  composition: ['taxa_aggregated', 'municipal_taxa'] as const,
  market: ['summary_data', 'aggregated'] as const,
  nutrients: ['nutrients_aggregated', 'summary_data'] as const,
  tracks: ['predicted_tracks'] as const,
} as const;

export type PageName = keyof typeof PAGE_DATA_REQUIREMENTS;

/**
 * Hook to load all data required for a specific page
 */
export function usePageData<P extends PageName>(page: P) {
  return useMultipleData([...PAGE_DATA_REQUIREMENTS[page]]);
}

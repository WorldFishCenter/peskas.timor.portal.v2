/**
 * Data loading utilities for Peskas Timor Portal
 * Provides typed fetch functions and React hooks for loading JSON data files
 */

import { useState, useEffect, useCallback } from 'react';
import type { DataFileName, DataTypeMap } from '../types/data';

const DATA_BASE_PATH = '/data';

export class DataFetchError extends Error {
  fileName: string;
  originalError: Error;

  constructor(fileName: string, originalError: Error) {
    super(`Failed to fetch data file: ${fileName}`);
    this.name = 'DataFetchError';
    this.fileName = fileName;
    this.originalError = originalError;
  }
}

/**
 * Fetch a data file from public/data/ directory with type safety
 */
export async function fetchData<T extends DataFileName>(
  fileName: T
): Promise<DataTypeMap[T]> {
  const url = `${DATA_BASE_PATH}/${fileName}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as DataTypeMap[T];
  } catch (error) {
    throw new DataFetchError(
      fileName,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Cache for data files to avoid redundant fetches
 */
const dataCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch data with caching
 */
export async function fetchDataCached<T extends DataFileName>(
  fileName: T
): Promise<DataTypeMap[T]> {
  const cached = dataCache.get(fileName);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as DataTypeMap[T];
  }

  const data = await fetchData(fileName);
  dataCache.set(fileName, { data, timestamp: now });
  return data;
}

/**
 * Clear cache for a specific file or all files
 */
export function clearDataCache(fileName?: DataFileName): void {
  if (fileName) {
    dataCache.delete(fileName);
  } else {
    dataCache.clear();
  }
}

/**
 * Hook state for data loading
 */
export interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: DataFetchError | null;
  refetch: () => void;
}

/**
 * React hook for loading a data file
 */
export function useData<T extends DataFileName>(
  fileName: T,
  options?: { useCache?: boolean }
): UseDataState<DataTypeMap[T]> {
  const { useCache = true } = options ?? {};

  const [data, setData] = useState<DataTypeMap[T] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataFetchError | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchFn = useCache ? fetchDataCached : fetchData;
      const result = await fetchFn(fileName);
      setData(result);
    } catch (err) {
      if (err instanceof DataFetchError) {
        setError(err);
      } else {
        setError(
          new DataFetchError(
            fileName,
            err instanceof Error ? err : new Error(String(err))
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }, [fileName, useCache]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    if (useCache) {
      clearDataCache(fileName);
    }
    loadData();
  }, [fileName, useCache, loadData]);

  return { data, loading, error, refetch };
}

/**
 * Hook for loading multiple data files in parallel
 */
export function useMultipleData<T extends DataFileName[]>(
  fileNames: T
): {
  data: { [K in T[number]]?: DataTypeMap[K] };
  loading: boolean;
  error: DataFetchError | null;
  refetch: () => void;
} {
  type ResultType = { [K in T[number]]?: DataTypeMap[K] };

  const [data, setData] = useState<ResultType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataFetchError | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        fileNames.map(async (fileName) => ({
          fileName,
          data: await fetchDataCached(fileName),
        }))
      );

      const resultObj: ResultType = {};
      for (const result of results) {
        (resultObj as Record<string, unknown>)[result.fileName] = result.data;
      }

      setData(resultObj);
    } catch (err) {
      if (err instanceof DataFetchError) {
        setError(err);
      } else {
        setError(
          new DataFetchError(
            'multiple',
            err instanceof Error ? err : new Error(String(err))
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }, [fileNames]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    for (const fileName of fileNames) {
      clearDataCache(fileName);
    }
    loadData();
  }, [fileNames, loadData]);

  return { data, loading, error, refetch };
}

/**
 * Pre-fetch data files for faster subsequent loads
 */
export async function prefetchData(fileNames: DataFileName[]): Promise<void> {
  await Promise.all(fileNames.map((fileName) => fetchDataCached(fileName)));
}

/**
 * Common data file combinations for pages
 */
export const PAGE_DATA_REQUIREMENTS = {
  home: ['summary_data', 'pars', 'aggregated'] as const,
  catch: ['aggregated', 'taxa_aggregated', 'municipal_aggregated', 'pars'] as const,
  revenue: ['aggregated', 'municipal_aggregated', 'summary_data', 'pars'] as const,
  composition: ['taxa_aggregated', 'taxa_names', 'municipal_taxa', 'pars'] as const,
  market: ['summary_data', 'aggregated', 'pars'] as const,
  nutrients: ['nutrients_aggregated', 'summary_data', 'pars'] as const,
  tracks: ['predicted_tracks', 'indicators_grid', 'pars'] as const,
} as const;

export type PageName = keyof typeof PAGE_DATA_REQUIREMENTS;

/**
 * Hook to load all data required for a specific page
 */
export function usePageData<P extends PageName>(page: P) {
  return useMultipleData([...PAGE_DATA_REQUIREMENTS[page]]);
}

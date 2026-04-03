/**
 * React hook for loading data files with loading and error states
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { DataFileName, DataTypeMap } from '../types/data';
import { fetchData, clearDataCache, DataLoadError } from '../utils/dataLoader';

export interface UseDataOptions {
  useCache?: boolean;
  /** When false, no fetch runs; data, error are null and loading is false. */
  enabled?: boolean;
}

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useData<T extends DataFileName>(
  fileName: T,
  options?: UseDataOptions
): UseDataResult<DataTypeMap[T]> {
  const { useCache = true, enabled = true } = options ?? {};
  const [data, setData] = useState<DataTypeMap[T] | null>(null);
  const [loading, setLoading] = useState(() => enabled);
  const [error, setError] = useState<Error | null>(null);
  const genRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      genRef.current += 1;
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    genRef.current += 1;
    const runId = genRef.current;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await fetchData(fileName, useCache);
        if (cancelled || runId !== genRef.current) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (cancelled || runId !== genRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled && runId === genRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileName, useCache, enabled]);

  const refetch = useCallback(() => {
    if (!enabled) return;
    genRef.current += 1;
    const runId = genRef.current;
    setLoading(true);
    setError(null);
    if (useCache) {
      clearDataCache(fileName);
    }
    (async () => {
      try {
        const result = await fetchData(fileName, useCache);
        if (runId !== genRef.current) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (runId !== genRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (runId === genRef.current) {
          setLoading(false);
        }
      }
    })();
  }, [fileName, useCache, enabled]);

  return { data, loading, error, refetch };
}

export interface UseMultipleDataResult<T extends DataFileName[]> {
  data: { [K in T[number]]: DataTypeMap[K] } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function stableFileNamesKey<T extends DataFileName[]>(fileNames: T): string {
  return [...fileNames].join('\0');
}

export function useMultipleData<T extends DataFileName[]>(
  fileNames: T
): UseMultipleDataResult<T> {
  const [data, setData] = useState<{ [K in T[number]]: DataTypeMap[K] } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const genRef = useRef(0);
  const fileNamesRef = useRef(fileNames);
  fileNamesRef.current = fileNames;
  const namesKey = stableFileNamesKey(fileNames);

  useEffect(() => {
    let cancelled = false;
    genRef.current += 1;
    const runId = genRef.current;
    const currentFiles = fileNamesRef.current;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const results = await Promise.all(
          currentFiles.map(async (fileName) => ({
            fileName,
            data: await fetchData(fileName, true),
          }))
        );

        if (cancelled || runId !== genRef.current) return;

        const dataMap = Object.fromEntries(
          results.map(({ fileName, data: d }) => [fileName, d])
        ) as { [K in T[number]]: DataTypeMap[K] };

        setData(dataMap);
        setError(null);
      } catch (err) {
        if (cancelled || runId !== genRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled && runId === genRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [namesKey]);

  const refetch = useCallback(() => {
    genRef.current += 1;
    const runId = genRef.current;
    const currentFiles = fileNamesRef.current;
    currentFiles.forEach((fileName) => clearDataCache(fileName));
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const results = await Promise.all(
          currentFiles.map(async (fileName) => ({
            fileName,
            data: await fetchData(fileName, true),
          }))
        );
        if (runId !== genRef.current) return;
        const dataMap = Object.fromEntries(
          results.map(({ fileName, data: d }) => [fileName, d])
        ) as { [K in T[number]]: DataTypeMap[K] };
        setData(dataMap);
        setError(null);
      } catch (err) {
        if (runId !== genRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (runId === genRef.current) {
          setLoading(false);
        }
      }
    })();
  }, []);

  return { data, loading, error, refetch };
}

export { DataLoadError };

/**
 * Common data file combinations for pages
 */
export const PAGE_DATA_REQUIREMENTS = {
  home: ['summary_data', 'aggregated', 'municipal_aggregated'] as const,
  catch: ['aggregated', 'taxa_aggregated', 'municipal_aggregated'] as const,
  revenue: ['aggregated', 'municipal_aggregated', 'summary_data'] as const,
  composition: ['taxa_aggregated', 'municipal_taxa'] as const,
  market: ['summary_data', 'aggregated', 'municipal_aggregated'] as const,
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

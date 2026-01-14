/**
 * React hook for loading data files with loading and error states
 */
import { useState, useEffect, useCallback } from 'react';
import type { DataFileName, DataTypeMap } from '../types/data';
import { fetchData, DataLoadError } from '../utils/dataLoader';

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useData<T extends DataFileName>(
  fileName: T
): UseDataResult<DataTypeMap[T]> {
  const [data, setData] = useState<DataTypeMap[T] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDataAsync = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(fileName);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fileName]);

  useEffect(() => {
    fetchDataAsync();
  }, [fetchDataAsync]);

  const refetch = useCallback(() => {
    fetchDataAsync();
  }, [fetchDataAsync]);

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
          data: await fetchData(fileName),
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
    fetchDataAsync();
  }, [fetchDataAsync]);

  return { data, loading, error, refetch };
}

export { DataLoadError };

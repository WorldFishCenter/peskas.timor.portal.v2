/**
 * Data loading utilities for fetching JSON data files
 */
import type { DataFileName, DataTypeMap } from '../types/data';
import { DATA_CONFIG } from '../config/data.config';

const DATA_BASE_PATH = DATA_CONFIG.BASE_PATH;

export class DataLoadError extends Error {
  fileName: string;
  originalError: Error;

  constructor(fileName: string, originalError: Error) {
    super(`Failed to load data file: ${fileName}`);
    this.name = 'DataLoadError';
    this.fileName = fileName;
    this.originalError = originalError;
  }
}

/**
 * Cache for data files to avoid redundant fetches
 */
const dataCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = DATA_CONFIG.CACHE_TTL_MS;

/**
 * Fetch a data file from public/data/ directory with type safety
 */
export async function fetchData<T extends DataFileName>(
  fileName: T,
  useCache = false
): Promise<DataTypeMap[T]> {
  // Check cache if enabled
  if (useCache) {
    const cached = dataCache.get(fileName);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as DataTypeMap[T];
    }
  }

  const url = `${DATA_BASE_PATH}/${fileName}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store in cache if enabled
    if (useCache) {
      dataCache.set(fileName, { data, timestamp: Date.now() });
    }
    
    return data as DataTypeMap[T];
  } catch (error) {
    throw new DataLoadError(
      fileName,
      error instanceof Error ? error : new Error(String(error))
    );
  }
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

export async function fetchMultipleData<T extends DataFileName[]>(
  fileNames: T
): Promise<{ [K in T[number]]: DataTypeMap[K] }> {
  const results = await Promise.all(
    fileNames.map(async (fileName) => ({
      fileName,
      data: await fetchData(fileName),
    }))
  );

  return Object.fromEntries(
    results.map(({ fileName, data }) => [fileName, data])
  ) as { [K in T[number]]: DataTypeMap[K] };
}

/**
 * Data loading utilities for fetching JSON data files
 */
import type { DataFileName, DataTypeMap } from '../types/data';

const DATA_BASE_PATH = '/data';

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
    throw new DataLoadError(
      fileName,
      error instanceof Error ? error : new Error(String(error))
    );
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

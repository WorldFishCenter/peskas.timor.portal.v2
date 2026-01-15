import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useData } from '../hooks';
import { tabPalette } from '../constants/colors';
import { useI18n } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import { getHeatmapStyle } from '../utils/table';

interface MunicipalSummary {
  region: string;
  landing_revenue: number;
  landing_weight: number;
  n_landings_per_boat: number;
  revenue: number;
  catch: number;
  price_kg: number;
}

interface SummaryTableProps {
  title?: string;
  caption?: string;
}

function SummaryTableComponent({ title, caption }: SummaryTableProps) {
  const { t } = useI18n();
  const theme = useTheme();
  const { data: municipalData, loading, error } = useData('municipal_aggregated');
  const [sorting, setSorting] = useState<SortingState>([]);

  const summaryData = useMemo(() => {
    if (!municipalData) return [];

    type GroupedData = Record<string, {
      landing_revenues: number[];
      landing_weights: number[];
      n_landings_per_boats: number[];
      revenues: number[];
      catches: number[];
      price_kgs: number[];
    }>;

    const grouped: GroupedData = {};
    for (const record of municipalData) {
      if (!grouped[record.region]) {
        grouped[record.region] = {
          landing_revenues: [],
          landing_weights: [],
          n_landings_per_boats: [],
          revenues: [],
          catches: [],
          price_kgs: [],
        };
      }
      grouped[record.region].landing_revenues.push(record.landing_revenue);
      grouped[record.region].landing_weights.push(record.landing_weight);
      grouped[record.region].n_landings_per_boats.push(record.n_landings_per_boat);
      grouped[record.region].revenues.push(record.revenue);
      grouped[record.region].catches.push(record.catch);
      grouped[record.region].price_kgs.push(record.price_kg);
    }

    // Optimized median calculation using QuickSelect-like approach for better performance
    const median = (arr: number[]): number => {
      const valid = arr.filter(v => !isNaN(v) && isFinite(v));
      if (valid.length === 0) return 0;
      const sorted = valid.sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    // Optimized sum - single pass
    const sum = (arr: number[]): number => {
      let total = 0;
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        if (!isNaN(val) && isFinite(val)) total += val;
      }
      return total;
    };

    // Optimized mean - single pass
    const mean = (arr: number[]): number => {
      let total = 0;
      let count = 0;
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        if (!isNaN(val) && isFinite(val)) {
          total += val;
          count++;
        }
      }
      return count > 0 ? total / count : 0;
    };

    const result: MunicipalSummary[] = Object.entries(grouped).map(([region, values]) => ({
      region,
      landing_revenue: Math.round(median(values.landing_revenues) * 100) / 100,
      landing_weight: Math.round(median(values.landing_weights) * 100) / 100,
      n_landings_per_boat: Math.round(median(values.n_landings_per_boats) * 100) / 100,
      revenue: Math.round(sum(values.revenues) / 1000000 * 100) / 100,
      catch: Math.round(sum(values.catches) / 1000 * 100) / 100,
      price_kg: Math.round(mean(values.price_kgs) * 100) / 100,
    }));

    return result;
  }, [municipalData]);

  const totals = useMemo(() => {
    if (summaryData.length === 0) return null;
    return {
      revenue: summaryData.reduce((acc, row) => acc + row.revenue, 0),
      catch: summaryData.reduce((acc, row) => acc + row.catch, 0),
    };
  }, [summaryData]);

  const columnValues = useMemo(() => ({
    landing_revenue: summaryData.map(r => r.landing_revenue),
    landing_weight: summaryData.map(r => r.landing_weight),
    n_landings_per_boat: summaryData.map(r => r.n_landings_per_boat),
    revenue: summaryData.map(r => r.revenue),
    catch: summaryData.map(r => r.catch),
    price_kg: summaryData.map(r => r.price_kg),
  }), [summaryData]);

  const columns = useMemo<ColumnDef<MunicipalSummary>[]>(
    () => [
      {
        accessorKey: 'region',
        header: t('table.municipality'),
        cell: info => <span className="text-capitalize">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'landing_revenue',
        header: t('table.revenue_per_trip'),
        cell: info => `$${(info.getValue() as number).toFixed(2)}`,
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.landing_revenue, theme, tabPalette),
        },
      },
      {
        accessorKey: 'n_landings_per_boat',
        header: t('table.landings_per_boat'),
        cell: info => (info.getValue() as number).toFixed(2),
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.n_landings_per_boat, theme, tabPalette),
        },
      },
      {
        accessorKey: 'landing_weight',
        header: t('table.catch_per_trip'),
        cell: info => `${(info.getValue() as number).toFixed(2)} ${t('units.kg', { defaultValue: 'kg' })}`,
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.landing_weight, theme, tabPalette),
        },
      },
      {
        accessorKey: 'revenue',
        header: t('table.total_revenue'),
        cell: info => `$${(info.getValue() as number).toFixed(2)} ${t('units.million_short', { defaultValue: 'M' })}`,
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.revenue, theme, tabPalette),
        },
      },
      {
        accessorKey: 'catch',
        header: t('table.total_catch'),
        cell: info => `${(info.getValue() as number).toFixed(2)} ${t('units.t', { defaultValue: 't' })}`,
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.catch, theme, tabPalette),
        },
      },
      {
        accessorKey: 'price_kg',
        header: t('table.price_per_kg'),
        cell: info => `$${(info.getValue() as number).toFixed(2)}`,
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.price_kg, theme, tabPalette),
        },
      },
    ],
    [t, columnValues, theme]
  );

  const table = useReactTable({
    data: summaryData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body py-5 text-center">
          <div className="spinner-border text-primary" role="status" />
          <div className="text-muted mt-2">{t('table.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body py-5 text-center text-danger">
          {t('table.error')}
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      {title && (
        <div className="card-header border-0 pb-0">
          <div>
            <h3 className="card-title fw-bold">{title}</h3>
            {caption && (
              <div className="text-muted mt-1" style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>
                {caption}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-vcenter table-hover card-table" style={{ fontSize: '0.875rem' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="text-center"
                      style={{ minWidth: header.id === 'region' ? 140 : 100, cursor: 'pointer', userSelect: 'none' }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === 'asc' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-chevron-up" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M6 15l6 -6l6 6"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-chevron-down" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M6 9l6 6l6 -6"></path>
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    const cellMeta = cell.column.columnDef.meta as { style?: (value: number) => React.CSSProperties };
                    const cellStyle = cellMeta?.style ? cellMeta.style(cell.getValue() as number) : {};

                    return (
                      <td
                        key={cell.id}
                        className="text-center"
                        style={cellStyle}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totals && (
        <div className="card-footer bg-light-lt border-top-0 py-2">
          <div className="d-flex align-items-center justify-content-end gap-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                {t('vars.revenue.short_name', { defaultValue: 'Revenue' })}
              </span>
              <span className="text-primary fw-bold">
                ${totals.revenue.toFixed(2)}{t('units.million_short', { defaultValue: 'M' })}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                {t('vars.catch.short_name', { defaultValue: 'Catch' })}
              </span>
              <span className="text-azure fw-bold">
                {totals.catch.toFixed(1)} {t('units.t', { defaultValue: 't' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const SummaryTable = React.memo(SummaryTableComponent)

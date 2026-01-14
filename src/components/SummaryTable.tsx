import { useMemo, useState } from 'react';
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

interface MunicipalSummary {
  region: string;
  landing_revenue: number;
  landing_weight: number;
  n_landings_per_boat: number;
  revenue: number;
  catch: number;
  price_kg: number;
}

function interpolateColor(colors: string[], t: number, opacity: number = 1): string {
  const n = colors.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const f = t * n - i;

  const c1 = colors[i];
  const c2 = colors[i + 1];

  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);

  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  const r = Math.round(r1 + f * (r2 - r1));
  const g = Math.round(g1 + f * (g2 - g1));
  const b = Math.round(b1 + f * (b2 - b1));

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function normalize(value: number, values: number[]): number {
  const valid = values.filter(v => !isNaN(v));
  if (valid.length === 0) return 0.5;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (min === max) return 0.5;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, isNaN(normalized) ? 0.5 : normalized));
}

function biasedNormalize(value: number, values: number[], bias: number = 2): number {
  const n = normalize(value, values);
  return Math.pow(n, 1 / bias);
}

export function SummaryTable() {
  const { t } = useI18n();
  const theme = useTheme();
  const { data: municipalData, loading, error } = useData('municipal_aggregated');
  const { data: pars } = useData('pars');
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

    const median = (arr: number[]) => {
      const sorted = [...arr].filter(v => !isNaN(v)).sort((a, b) => a - b);
      if (sorted.length === 0) return 0;
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const sum = (arr: number[]) => arr.filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
    const mean = (arr: number[]) => {
      const valid = arr.filter(v => !isNaN(v));
      return valid.length > 0 ? sum(valid) / valid.length : 0;
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

  const columnValues = useMemo(() => ({
    landing_revenue: summaryData.map(r => r.landing_revenue),
    landing_weight: summaryData.map(r => r.landing_weight),
    n_landings_per_boat: summaryData.map(r => r.n_landings_per_boat),
    revenue: summaryData.map(r => r.revenue),
    catch: summaryData.map(r => r.catch),
    price_kg: summaryData.map(r => r.price_kg),
  }), [summaryData]);

  const getCellStyle = (value: number, values: number[]) => {
    const t = biasedNormalize(value, values);
    // Higher opacity for better visibility in both themes
    const opacity = theme === 'dark' ? 0.5 : 0.6;
    return {
      backgroundColor: interpolateColor(tabPalette, t, opacity),
      // Ensure text remains readable with proper contrast
      color: theme === 'dark' ? '#fff' : 'inherit',
    };
  };

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
          getCellStyle: (value: number) => getCellStyle(value, columnValues.landing_revenue),
        },
      },
      {
        accessorKey: 'n_landings_per_boat',
        header: t('table.landings_per_boat'),
        cell: info => (info.getValue() as number).toFixed(2),
        meta: {
          getCellStyle: (value: number) => getCellStyle(value, columnValues.n_landings_per_boat),
        },
      },
      {
        accessorKey: 'landing_weight',
        header: t('table.catch_per_trip'),
        cell: info => `${(info.getValue() as number).toFixed(2)} ${t('units.kg', { defaultValue: 'kg' })}`,
        meta: {
          getCellStyle: (value: number) => getCellStyle(value, columnValues.landing_weight),
        },
      },
      {
        accessorKey: 'revenue',
        header: t('table.total_revenue'),
        cell: info => `$${(info.getValue() as number).toFixed(2)} ${t('units.million_short', { defaultValue: 'M' })}`,
        meta: {
          getCellStyle: (value: number) => getCellStyle(value, columnValues.revenue),
        },
      },
      {
        accessorKey: 'catch',
        header: t('table.total_catch'),
        cell: info => `${(info.getValue() as number).toFixed(2)} ${t('units.t', { defaultValue: 't' })}`,
        meta: {
          getCellStyle: (value: number) => getCellStyle(value, columnValues.catch),
        },
      },
      {
        accessorKey: 'price_kg',
        header: t('table.price_per_kg'),
        cell: info => `$${(info.getValue() as number).toFixed(2)}`,
        meta: {
          getCellStyle: (value: number) => getCellStyle(value, columnValues.price_kg),
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
      <div className="text-muted text-center py-4">
        {t('table.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger text-center py-4">
        {t('table.error')}
      </div>
    );
  }

  const tableCaption = pars?.home?.table?.caption ?? '';

  return (
    <div>
      {tableCaption && (
        <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>{tableCaption}</p>
      )}
      <div className="table-responsive">
        <table className="table table-vcenter table-hover" style={{ fontSize: '0.875rem' }}>
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
                  const cellMeta = cell.column.columnDef.meta as { getCellStyle?: (value: number) => React.CSSProperties };
                  const cellStyle = cellMeta?.getCellStyle ? cellMeta.getCellStyle(cell.getValue() as number) : {};

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
  );
}

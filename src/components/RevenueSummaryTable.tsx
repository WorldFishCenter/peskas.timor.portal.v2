import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMunicipalData } from '../hooks/useMunicipalData'
import { useMonthlyYearFilter } from '../hooks/useMonthlyYearFilter'
import { useFilters } from '../context/FilterContext'
import { useI18n } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { tabPalette } from '../constants/colors'
import { getHeatmapStyle } from '../utils/table'
import { filterRowsByCalendarYear, sortRecentMonths } from '../utils/monthSeries'
import { getMunicipalityScopeLabel } from '../utils/i18nLabels'
import type { HeatmapColumnMeta } from '../types/tableMeta'
import {
  formatMillionsUsd,
  formatRecordedRevenueUsd,
  formatSummaryNullable,
  formatTripsPerBoat,
  formatUsd,
  summaryNumericColumn,
} from '../utils/formatSummaryTable'
import DataScopeCallout from './DataScopeCallout'

interface RevenueTableRow {
  month: string
  revenue: number | null
  recorded_revenue: number | null
  landing_revenue: number | null
  n_landings_per_boat: number | null
}

export default function RevenueSummaryTable() {
  const { t, lang } = useI18n()
  const theme = useTheme()
  const { municipality } = useFilters()
  const locale = lang === 'tet' ? 'tet' : lang === 'pt' ? 'pt-PT' : 'en-US'
  const { data: aggregated, loading, error } = useMunicipalData()
  const { years, selectedYear, setSelectedYear } = useMonthlyYearFilter(aggregated?.month)

  const scopeLabel = getMunicipalityScopeLabel(t, municipality)

  const tableData = useMemo(() => {
    if (!aggregated?.month || !selectedYear) return []

    const filtered = filterRowsByCalendarYear(aggregated.month, selectedYear)

    return sortRecentMonths(filtered, 12).map(row => ({
      month: new Date(row.date_bin_start).toLocaleDateString(locale, { month: 'long' }),
      revenue: row.revenue == null ? null : row.revenue / 1000000,
      recorded_revenue: row.recorded_revenue ?? null,
      landing_revenue: row.landing_revenue ?? null,
      n_landings_per_boat: row.n_landings_per_boat ?? null,
    }))
  }, [aggregated, selectedYear, locale])

  const columnValues = useMemo(() => ({
    revenue: summaryNumericColumn(tableData.map(r => r.revenue)),
    recorded_revenue: summaryNumericColumn(tableData.map(r => r.recorded_revenue)),
    landing_revenue: summaryNumericColumn(tableData.map(r => r.landing_revenue)),
    n_landings_per_boat: summaryNumericColumn(tableData.map(r => r.n_landings_per_boat)),
  }), [tableData])

  const columns = useMemo<ColumnDef<RevenueTableRow>[]>(
    () => [
      {
        accessorKey: 'month',
        header: t('revenue.month', { defaultValue: 'Month' }),
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'revenue',
        header: t('vars.revenue.short_name'),
        cell: info => formatSummaryNullable(formatMillionsUsd, info.getValue() as number | null),
        meta: {
          style: (value: number | null) => getHeatmapStyle(value, columnValues.revenue, theme, tabPalette),
        } satisfies HeatmapColumnMeta,
      },
      {
        accessorKey: 'recorded_revenue',
        header: t('vars.recorded_revenue.short_name'),
        cell: info => formatSummaryNullable(formatRecordedRevenueUsd, info.getValue() as number | null),
        meta: {
          style: (value: number | null) =>
            getHeatmapStyle(value, columnValues.recorded_revenue, theme, tabPalette),
        } satisfies HeatmapColumnMeta,
      },
      {
        accessorKey: 'landing_revenue',
        header: t('vars.landing_revenue.short_name'),
        cell: info => formatSummaryNullable(formatUsd, info.getValue() as number | null),
        meta: {
          style: (value: number | null) => getHeatmapStyle(value, columnValues.landing_revenue, theme, tabPalette),
        } satisfies HeatmapColumnMeta,
      },
      {
        accessorKey: 'n_landings_per_boat',
        header: t('vars.n_landings_per_boat.short_name'),
        cell: info => formatSummaryNullable(formatTripsPerBoat, info.getValue() as number | null),
        meta: {
          style: (value: number | null) =>
            getHeatmapStyle(value, columnValues.n_landings_per_boat, theme, tabPalette),
        } satisfies HeatmapColumnMeta,
      },
    ],
    [t, columnValues, theme]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totals = useMemo(() => {
    if (tableData.length === 0) return null
    const revenueVals = summaryNumericColumn(tableData.map(r => r.revenue))
    const recordedVals = summaryNumericColumn(tableData.map(r => r.recorded_revenue))
    return {
      revenue: revenueVals.length ? revenueVals.reduce((a, b) => a + b, 0) : null,
      recorded_revenue: recordedVals.length ? recordedVals.reduce((a, b) => a + b, 0) : null,
    }
  }, [tableData])

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0 pb-0 d-flex flex-wrap align-items-start gap-2">
        <div className="flex-grow-1" style={{ minWidth: '12rem' }}>
          <h3 className="card-title fw-bold">{t('revenue.summary_table', { defaultValue: 'Annual Summary' })}</h3>
          <DataScopeCallout areaLabel={scopeLabel} className="mt-2" />
        </div>
        <div className="ms-auto card-actions">
          <select
            className="form-select form-select-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
        {error ? (
          <div className="alert alert-danger m-3" role="alert">
            {error.message || t('common.error_loading')}
          </div>
        ) : loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
            <table className="table table-vcenter card-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      const value = cell.getValue();
                      const meta = cell.column.columnDef.meta as HeatmapColumnMeta | undefined;
                      const style = meta?.style ? meta.style(value as number | null) : {};
                      
                      return (
                        <td key={cell.id} style={style}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                      )
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
      {totals && (
        <div className="card-footer bg-light-lt border-top-0 py-2">
          <div className="d-flex align-items-center justify-content-end gap-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                {t('vars.revenue.short_name')}
              </span>
              <span className="text-primary fw-bold">
                {formatSummaryNullable(formatMillionsUsd, totals.revenue)}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                {t('vars.recorded_revenue.short_name')}
              </span>
              <span className="text-azure fw-bold">
                {formatSummaryNullable(formatRecordedRevenueUsd, totals.recorded_revenue)}
            </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

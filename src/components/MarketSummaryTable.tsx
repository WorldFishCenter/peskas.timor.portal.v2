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
import DataScopeCallout from './DataScopeCallout'
import { useTheme } from '../hooks/useTheme'
import { tabPalette } from '../constants/colors'
import { getHeatmapStyle } from '../utils/table'
import { filterRowsByCalendarYear, sortRecentMonths } from '../utils/monthSeries'
import { getMunicipalityScopeLabel } from '../utils/i18nLabels'
import type { HeatmapColumnMeta } from '../types/tableMeta'
import {
  formatKg,
  formatSummaryNullable,
  formatTripsPerBoat,
  summaryNumericColumn,
} from '../utils/formatSummaryTable'

interface MarketTableRow {
  month: string
  price_kg: number | null
  landing_weight: number | null
  n_landings_per_boat: number | null
}

function formatPriceKg(n: number): string {
  return `$${n.toFixed(2)}`
}

export default function MarketSummaryTable() {
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
      price_kg: row.price_kg ?? null,
      landing_weight: row.landing_weight ?? null,
      n_landings_per_boat: row.n_landings_per_boat ?? null,
    }))
  }, [aggregated, selectedYear, locale])

  const columnValues = useMemo(() => ({
    price_kg: summaryNumericColumn(tableData.map(r => r.price_kg)),
    landing_weight: summaryNumericColumn(tableData.map(r => r.landing_weight)),
    n_landings_per_boat: summaryNumericColumn(tableData.map(r => r.n_landings_per_boat)),
  }), [tableData])

  // Always use translations - translations are the single source of truth
  const priceHeader = t('vars.price_kg.short_name')
  const landingHeader = t('vars.landing_weight.short_name')
  const landingsLabel = t('vars.n_landings_per_boat.short_name')

  const columns = useMemo<ColumnDef<MarketTableRow>[]>(
    () => [
      {
        accessorKey: 'month',
        header: t('market.month', { defaultValue: 'Month' }),
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'price_kg',
        header: priceHeader,
        cell: info => formatSummaryNullable(formatPriceKg, info.getValue() as number | null),
        meta: {
          style: (value: number | null) => getHeatmapStyle(value, columnValues.price_kg, theme, tabPalette),
        } satisfies HeatmapColumnMeta,
      },
      {
        accessorKey: 'landing_weight',
        header: landingHeader,
        cell: info => formatSummaryNullable(formatKg, info.getValue() as number | null),
        meta: {
          style: (value: number | null) => getHeatmapStyle(value, columnValues.landing_weight, theme, tabPalette),
        } satisfies HeatmapColumnMeta,
      },
      {
        accessorKey: 'n_landings_per_boat',
        header: landingsLabel,
        cell: info => formatSummaryNullable(formatTripsPerBoat, info.getValue() as number | null),
        meta: {
          style: (value: number | null) =>
            getHeatmapStyle(value, columnValues.n_landings_per_boat, theme, tabPalette),
        } satisfies HeatmapColumnMeta,
      },
    ],
    [t, theme, columnValues]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const averages = useMemo(() => {
    if (tableData.length === 0) return null
    const prices = summaryNumericColumn(tableData.map(r => r.price_kg))
    const weights = summaryNumericColumn(tableData.map(r => r.landing_weight))
    return {
      price_kg: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
      landing_weight: weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : null,
    }
  }, [tableData])

  // Always use translations - translations are the single source of truth
  const tableHeading = t('revenue.table_heading')

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0 pb-0 d-flex flex-wrap align-items-start gap-2">
        <div className="flex-grow-1" style={{ minWidth: '12rem' }}>
          <h3 className="card-title fw-bold mb-0">{tableHeading}</h3>
          <DataScopeCallout areaLabel={scopeLabel} className="mt-2" />
        </div>
        <div className="ms-auto card-actions">
          <select
            className="form-select form-select-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={loading}
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
        {error ? (
          <div className="alert alert-danger m-3" role="alert">
            {error.message || t('common.error_loading')}
          </div>
        ) : loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-vcenter card-table table-hover">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
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
                      const value = cell.getValue()
                      const meta = cell.column.columnDef.meta as HeatmapColumnMeta | undefined
                      const style = meta?.style ? meta.style(value as number | null) : {}
                      return (
                        <td key={cell.id} style={style}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {averages && (
        <div className="card-footer bg-light-lt border-top-0 py-2">
          <div className="d-flex align-items-center justify-content-end gap-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                {t('common.avg', { defaultValue: 'Avg' })} {t('vars.price_kg.short_name')}
              </span>
              <span className="text-primary fw-bold">
                {formatSummaryNullable(formatPriceKg, averages.price_kg)}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                {t('common.avg', { defaultValue: 'Avg' })} {landingHeader}
              </span>
              <span className="text-azure fw-bold">
                {formatSummaryNullable(formatKg, averages.landing_weight)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

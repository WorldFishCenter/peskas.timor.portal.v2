import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useData } from '../hooks/useData'
import { useI18n } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { tabPalette } from '../constants/colors'
import { getHeatmapStyle } from '../utils/table'

interface MarketTableRow {
  month: string
  price_kg: number
  landing_weight: number
  n_landings_per_boat: number
}

export default function MarketSummaryTable() {
  const { t, lang } = useI18n()
  const theme = useTheme()
  const locale = lang === 'tet' ? 'tet' : lang === 'pt' ? 'pt-PT' : 'en-US'
  const { data: aggregated, loading } = useData('aggregated')
  const { data: pars } = useData('pars')
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const tableData = useMemo(() => {
    if (!aggregated?.month) return []

    let filtered = [...aggregated.month]

    if (selectedYear !== 'all') {
      filtered = filtered.filter(row =>
        new Date(row.date_bin_start).getFullYear().toString() === selectedYear
      )
    }

    return filtered
      .sort((a, b) => new Date(b.date_bin_start).getTime() - new Date(a.date_bin_start).getTime())
      .slice(0, 12)
      .map(row => ({
        month: new Date(row.date_bin_start).toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
        price_kg: row.price_kg ?? 0,
        landing_weight: row.landing_weight ?? 0,
        n_landings_per_boat: row.n_landings_per_boat ?? 0,
      }))
  }, [aggregated, selectedYear, locale])

  const columnValues = useMemo(() => ({
    price_kg: tableData.map(r => r.price_kg),
    landing_weight: tableData.map(r => r.landing_weight),
    n_landings_per_boat: tableData.map(r => r.n_landings_per_boat),
  }), [tableData])

  const years = useMemo(() => {
    if (!aggregated?.month) return []
    const uniqueYears = [...new Set(aggregated.month.map(row =>
      new Date(row.date_bin_start).getFullYear().toString()
    ))].sort((a, b) => b.localeCompare(a))
    return ['all', ...uniqueYears]
  }, [aggregated])

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
        cell: info => `$${(info.getValue() as number).toFixed(2)}`,
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.price_kg, theme, tabPalette),
        },
      },
      {
        accessorKey: 'landing_weight',
        header: landingHeader,
        cell: info => `${(info.getValue() as number).toFixed(1)} ${t('units.kg', { defaultValue: 'kg' })}`,
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.landing_weight, theme, tabPalette),
        },
      },
      {
        accessorKey: 'n_landings_per_boat',
        header: landingsLabel,
        cell: info => (info.getValue() as number).toFixed(2),
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues.n_landings_per_boat, theme, tabPalette),
        },
      },
    ],
    [t, theme, columnValues, pars]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const averages = useMemo(() => {
    if (tableData.length === 0) return null
    return {
      price_kg: tableData.reduce((sum, row) => sum + row.price_kg, 0) / tableData.length,
      landing_weight: tableData.reduce((sum, row) => sum + row.landing_weight, 0) / tableData.length,
    }
  }, [tableData])

  // Always use translations - translations are the single source of truth
  const tableHeading = t('revenue.table_heading')

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0 d-flex align-items-center">
        <h3 className="card-title fw-bold mb-0">{tableHeading}</h3>
        <div className="ms-auto">
          <select
            className="form-select form-select-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={loading}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year === 'all' ? t('common.all_years', { defaultValue: 'All years' }) : year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body p-0">
        {loading ? (
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
                      const meta = cell.column.columnDef.meta as any
                      const style = meta?.style ? meta.style(cell.getValue()) : {}
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
                {t('common.avg', { defaultValue: 'Avg' })} {priceHeader}
              </span>
              <span className="text-primary fw-bold">
                ${averages.price_kg.toFixed(2)}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                {t('common.avg', { defaultValue: 'Avg' })} {landingHeader}
              </span>
              <span className="text-azure fw-bold">
                {averages.landing_weight.toFixed(1)} {t('units.kg', { defaultValue: 'kg' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

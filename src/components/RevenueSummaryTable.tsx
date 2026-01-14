import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useData } from '../hooks/useData'
import { useI18n } from '../i18n'

interface RevenueTableRow {
  month: string
  revenue: number
  recorded_revenue: number
  landing_revenue: number
  n_landings_per_boat: number
}

export default function RevenueSummaryTable() {
  const { t } = useI18n()
  const { data: aggregated, loading } = useData('aggregated')
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
        month: new Date(row.date_bin_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        revenue: (row.revenue ?? 0) / 1000000,
        recorded_revenue: (row.recorded_revenue ?? 0) / 1000000,
        landing_revenue: row.landing_revenue ?? 0,
        n_landings_per_boat: row.n_landings_per_boat ?? 0,
      }))
  }, [aggregated, selectedYear])

  const years = useMemo(() => {
    if (!aggregated?.month) return []
    const uniqueYears = [...new Set(aggregated.month.map(row =>
      new Date(row.date_bin_start).getFullYear().toString()
    ))].sort((a, b) => b.localeCompare(a))
    return ['all', ...uniqueYears]
  }, [aggregated])

  const columns = useMemo<ColumnDef<RevenueTableRow>[]>(
    () => [
      {
        accessorKey: 'month',
        header: t('revenue.month', { defaultValue: 'Month' }),
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'revenue',
        header: t('vars.revenue.short_name', { defaultValue: 'Revenue (M USD)' }),
        cell: info => '$' + (info.getValue() as number).toFixed(2),
      },
      {
        accessorKey: 'recorded_revenue',
        header: t('vars.recorded_revenue.short_name', { defaultValue: 'Recorded revenue (M USD)' }),
        cell: info => '$' + (info.getValue() as number).toFixed(2),
      },
      {
        accessorKey: 'landing_revenue',
        header: t('vars.landing_revenue.short_name', { defaultValue: 'Revenue per trip (USD)' }),
        cell: info => '$' + (info.getValue() as number).toFixed(1),
      },
      {
        accessorKey: 'n_landings_per_boat',
        header: t('vars.n_landings_per_boat.short_name', { defaultValue: 'Trips per boat' }),
        cell: info => (info.getValue() as number).toFixed(1),
      },
    ],
    [t]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totals = useMemo(() => {
    if (tableData.length === 0) return null
    return {
      revenue: tableData.reduce((sum, row) => sum + row.revenue, 0),
      recorded_revenue: tableData.reduce((sum, row) => sum + row.recorded_revenue, 0),
    }
  }, [tableData])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{t('revenue.summary_table', { defaultValue: 'Summary Table' })}</h3>
        <div className="ms-auto">
          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year === 'all' ? t('common.all_years', { defaultValue: 'All years' }) : year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-table table-responsive">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <table className="table table-vcenter">
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
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {totals && (
        <div className="card-footer">
          <div className="d-flex justify-content-end text-muted small">
            <span>
              {t('vars.revenue.short_name', { defaultValue: 'Revenue' })}: ${totals.revenue.toFixed(2)}M ; {' '}
              {t('vars.recorded_revenue.short_name', { defaultValue: 'Recorded revenue' })}: ${totals.recorded_revenue.toFixed(2)}M
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

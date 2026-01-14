import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useData } from '../hooks/useData'
import { useI18n } from '../i18n'

interface CatchTableRow {
  month: string
  catch: number
  recorded_catch: number
  landing_weight: number
  n_landings_per_boat: number
}

export default function CatchSummaryTable() {
  const { t, lang } = useI18n()
  const locale = lang === 'tet' ? 'tet' : 'en-US'
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
        month: new Date(row.date_bin_start).toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
        catch: (row.catch ?? 0) / 1000,
        recorded_catch: (row.recorded_catch ?? 0) / 1000,
        landing_weight: row.landing_weight ?? 0,
        n_landings_per_boat: row.n_landings_per_boat ?? 0,
      }))
  }, [aggregated, selectedYear, locale])

  const years = useMemo(() => {
    if (!aggregated?.month) return []
    const uniqueYears = [...new Set(aggregated.month.map(row =>
      new Date(row.date_bin_start).getFullYear().toString()
    ))].sort((a, b) => b.localeCompare(a))
    return ['all', ...uniqueYears]
  }, [aggregated])

  const columns = useMemo<ColumnDef<CatchTableRow>[]>(
    () => [
      {
        accessorKey: 'month',
        header: t('catch.month', { defaultValue: 'Month' }),
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'catch',
        header: t('vars.catch.short_name', { defaultValue: 'Catch (t)' }),
        cell: info => (info.getValue() as number).toFixed(1),
      },
      {
        accessorKey: 'recorded_catch',
        header: t('vars.recorded_catch.short_name', { defaultValue: 'Recorded catch (t)' }),
        cell: info => (info.getValue() as number).toFixed(1),
      },
      {
        accessorKey: 'landing_weight',
        header: t('vars.landing_weight.short_name', { defaultValue: 'Catch per trip (kg)' }),
        cell: info => (info.getValue() as number).toFixed(1),
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
      catch: tableData.reduce((sum, row) => sum + row.catch, 0),
      recorded_catch: tableData.reduce((sum, row) => sum + row.recorded_catch, 0),
    }
  }, [tableData])

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0 pb-0">
        <div>
          <h3 className="card-title text-muted fw-bold">{t('catch.summary_table', { defaultValue: 'Annual Summary' })}</h3>
          {totals && (
            <div className="text-muted small mt-1">
              {t('vars.catch.short_name', { defaultValue: 'Catch' })}: {totals.catch.toFixed(1)} {t('units.t', { defaultValue: 't' })} ; {' '}
              {t('vars.recorded_catch.short_name', { defaultValue: 'Recorded catch' })}: {totals.recorded_catch.toFixed(1)} {t('units.t', { defaultValue: 't' })}
            </div>
          )}
        </div>
        <div className="ms-auto card-actions">
          <select
            className="form-select form-select-sm"
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
      <div className="card-body p-0">
        <div className="table-responsive">
          {loading ? (
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
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useData } from '../hooks/useData'
import { useI18n } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { tabPalette } from '../constants/colors'
import { getHeatmapStyle } from '../utils/table'

interface TaxaYearRow {
  taxaCode: string
  taxa: string
  imageUrl: string
  [year: string]: string | number // Dynamic year columns
}

// Taxa image URLs from the Shiny app - mapped to actual taxa codes
const TAXA_IMAGES: Record<string, string> = {
  'CLP': 'https://storage.googleapis.com/public-timor/SAR.svg',      // Sardines and herrings
  'GZP': 'https://storage.googleapis.com/public-timor/GAR.svg',      // Garfishes
  'TUN': 'https://storage.googleapis.com/public-timor/TUN.svg',      // Tunas
  'SDX': 'https://storage.googleapis.com/public-timor/MAC.svg',      // Mackerel scads
  'FLY': 'https://storage.googleapis.com/public-timor/FLYFI.svg',    // Flying fishes
  'SNA': 'https://storage.googleapis.com/public-timor/SNA.svg',      // Snappers and seaperches
  'MOO': 'https://storage.googleapis.com/public-timor/MOO.svg',      // Moonfishes
  'CGX': 'https://storage.googleapis.com/public-timor/JAC.svg',      // Jacks and trevalies
  'CJX': 'https://storage.googleapis.com/public-timor/FUS.svg',      // Fusiliers
  'BEN': 'https://storage.googleapis.com/public-timor/NEE.svg',      // Needlefishes
  'RAX': 'https://storage.googleapis.com/public-timor/SHM.svg',      // Short bodied mackerels
  'LWX': 'https://storage.googleapis.com/public-timor/JOB.svg',      // Jobfishes
  'MZZ': 'https://storage.googleapis.com/public-timor/OTHR.svg',     // Other
}

export default function CompositionSummaryTable() {
  const { t } = useI18n()
  const theme = useTheme()
  const { data: taxaAggregated, loading } = useData('taxa_aggregated')
  const { data: taxaNames } = useData('taxa_names')
  const { data: pars } = useData('pars')
  const [sorting, setSorting] = useState<SortingState>([])

  // Create taxa name lookup map
  const taxaNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (taxaNames) {
      taxaNames.forEach((t) => {
        map[t.grouped_taxa] = t.grouped_taxa_names
      })
    }
    return map
  }, [taxaNames])

  const { tableData, years, columnValues } = useMemo(() => {
    if (!taxaAggregated?.month) return { tableData: [], years: [], columnValues: {} }

    // Get years from 2018 onwards
    const allYears = [...new Set(taxaAggregated.month.map(r => r.year))]
      .filter(y => parseInt(y) >= 2018)
      .sort()

    // Group data by taxa and year (summing catch across all months)
    const grouped: Record<string, Record<string, number>> = {}
    taxaAggregated.month.forEach(row => {
      const taxa = row.grouped_taxa
      const year = row.year
      if (!grouped[taxa]) grouped[taxa] = {}
      if (!grouped[taxa][year]) grouped[taxa][year] = 0
      grouped[taxa][year] += (row.catch ?? 0) / 1000 // Convert to tons
    })

    // Get all taxa sorted
    const allTaxa = Object.keys(grouped).sort()

    // Build table rows
    const rows: TaxaYearRow[] = allTaxa.map(taxaCode => {
      const row: TaxaYearRow = {
        taxaCode,
        taxa: taxaNameMap[taxaCode] || taxaCode,
        imageUrl: TAXA_IMAGES[taxaCode] || TAXA_IMAGES['OTHR'],
      }
      allYears.forEach(year => {
        row[year] = grouped[taxaCode]?.[year] ?? 0
      })
      return row
    })

    // Calculate column values for heatmap styling (all years together for consistent coloring)
    const allValues: number[] = []
    rows.forEach(row => {
      allYears.forEach(year => {
        const val = row[year] as number
        if (val > 0) allValues.push(val)
      })
    })

    const colValues: Record<string, number[]> = {}
    allYears.forEach(year => {
      colValues[year] = allValues // Use same scale for all columns
    })

    return { tableData: rows, years: allYears, columnValues: colValues }
  }, [taxaAggregated, taxaNameMap])

  const columns = useMemo<ColumnDef<TaxaYearRow>[]>(() => {
    const cols: ColumnDef<TaxaYearRow>[] = [
      {
        accessorKey: 'taxa',
        header: t('table.taxa', { defaultValue: 'TAXA' }),
        cell: info => info.getValue(),
        size: 110,
        minSize: 110,
        maxSize: 110,
      },
      {
        accessorKey: 'imageUrl',
        header: '',
        cell: info => (
          <img
            src={info.getValue() as string}
            alt={info.row.original.taxa}
            style={{ height: '60px', width: '95px', objectFit: 'contain' }}
          />
        ),
        size: 120,
        minSize: 120,
        maxSize: 120,
      },
    ]

    // Add year columns dynamically
    years.forEach(year => {
      cols.push({
        accessorKey: year,
        header: year,
        cell: info => {
          const value = info.getValue() as number
          return `${value.toFixed(2)} t`
        },
        meta: {
          style: (value: number) => getHeatmapStyle(value, columnValues[year], theme, tabPalette),
        },
        size: 90,
        minSize: 90,
        maxSize: 90,
      })
    })

    return cols
  }, [years, columnValues, theme, t])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const tableHeading = pars?.composition?.table?.heading?.text 
    ? t(pars.composition.table.heading.text)
    : t('composition.table_heading', { defaultValue: 'Catch by Taxa and Year' })
  const tableFooter = pars?.composition?.table?.footer?.text ? t(pars.composition.table.footer.text) : null

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0">
        <div>
          <h3 className="card-title fw-bold mb-0">{tableHeading}</h3>
          {tableFooter && (
            <div className="text-muted mt-1 small">{tableFooter}</div>
          )}
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
          <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-vcenter card-table" style={{ tableLayout: 'auto' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: theme === 'dark' ? '#1b2434' : '#fff' }}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const size = header.column.columnDef.size
                      return (
                        <th
                          key={header.id}
                          style={{
                            width: size ? `${size}px` : 'auto',
                            minWidth: size ? `${size}px` : 'auto',
                            maxWidth: size ? `${size}px` : 'auto',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
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
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      const meta = cell.column.columnDef.meta as any
                      const size = cell.column.columnDef.size
                      const baseStyle = meta?.style ? meta.style(cell.getValue()) : {}
                      const sizeStyle = size ? {
                        width: `${size}px`,
                        minWidth: `${size}px`,
                        maxWidth: `${size}px`,
                      } : {}
                      const style = { ...baseStyle, ...sizeStyle }
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
    </div>
  )
}

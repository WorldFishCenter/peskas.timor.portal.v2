import { useState, useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

interface SummaryRow {
  indicator: string
  value: number
  change: number
}

export default function SummaryTable() {
  const data = useMemo<SummaryRow[]>(
    () => [
      { indicator: 'Trips', value: 1245, change: 4.5 },
      { indicator: 'Revenue', value: 12300, change: -3.2 },
      { indicator: 'Catch', value: 42, change: 0 },
    ],
    []
  )

  const columns = useMemo<ColumnDef<SummaryRow>[]>(
    () => [
      {
        accessorKey: 'indicator',
        header: () => 'Indicator',
      },
      {
        accessorKey: 'value',
        header: () => 'Value',
        cell: (info) => info.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: 'change',
        header: () => 'Change',
        cell: (info) => `${info.getValue<number>() > 0 ? '+' : ''}${info.getValue<number>()}%`,
      },
    ],
    []
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const getChangeBg = (value: number) =>
    value > 0 ? 'bg-green-lt text-green' : value < 0 ? 'bg-red-lt text-red' : 'bg-yellow-lt text-yellow'

  return (
    <table className="table table-vcenter">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {{
                  asc: ' \u25B2',
                  desc: ' \u25BC',
                }[header.column.getIsSorted() as string] ?? null}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const value = cell.column.id === 'change' ? (cell.getValue<number>()) : undefined
              const bg = value !== undefined ? getChangeBg(value) : ''
              return (
                <td key={cell.id} className={bg}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}


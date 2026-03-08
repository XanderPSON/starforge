'use client'

import { useCallback } from 'react'
import { Download } from 'lucide-react'

interface CSVColumn {
  key: string
  label: string
}

interface ExportCSVButtonProps {
  data: Record<string, unknown>[]
  filename: string
  columns: CSVColumn[]
}

function escapeCSVField(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  // Wrap in quotes if it contains commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(data: Record<string, unknown>[], columns: CSVColumn[]): string {
  const header = columns.map((col) => escapeCSVField(col.label)).join(',')
  const rows = data.map((row) =>
    columns.map((col) => escapeCSVField(row[col.key])).join(',')
  )
  return [header, ...rows].join('\n')
}

export function ExportCSVButton({ data, filename, columns }: ExportCSVButtonProps) {
  const handleDownload = useCallback(() => {
    const csv = generateCSV(data, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [data, filename, columns])

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] bg-white px-3 py-1.5 text-sm font-medium text-hub-text shadow-sm transition hover:bg-black/[0.03] dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
    >
      <Download className="h-4 w-4" />
      Download CSV
    </button>
  )
}

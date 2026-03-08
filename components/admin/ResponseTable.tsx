'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type ResponseRow = {
  user: string
  value: unknown
  submittedAt: Date | string
}

interface ResponseTableProps {
  responses: ResponseRow[]
}

type SortKey = 'user' | 'value' | 'submittedAt'

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

function formatResponseValue(value: unknown): string {
  if (typeof value === 'number') return String(value)

  if (typeof value === 'string') {
    return value.length > 100 ? `${value.slice(0, 100)}…` : value
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'boolean')) {
    const completed = value.filter(Boolean).length
    return `${completed} of ${value.length} completed`
  }

  if (value === null || value === undefined) return 'No response'

  return JSON.stringify(value)
}

function asSortValue(value: unknown): string {
  if (typeof value === 'string') return value.toLowerCase()
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return JSON.stringify(value)
  if (value === null || value === undefined) return ''
  return JSON.stringify(value)
}

export function ResponseTable({ responses }: ResponseTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt')
  const [sortAsc, setSortAsc] = useState(false)

  const sortedRows = useMemo(() => {
    const rows = [...responses]
    rows.sort((a, b) => {
      let comparison = 0
      if (sortKey === 'user') comparison = a.user.localeCompare(b.user)
      if (sortKey === 'value') comparison = asSortValue(a.value).localeCompare(asSortValue(b.value))
      if (sortKey === 'submittedAt') comparison = toDate(a.submittedAt).getTime() - toDate(b.submittedAt).getTime()
      return sortAsc ? comparison : -comparison
    })
    return rows
  }, [responses, sortAsc, sortKey])

  const toggleSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortAsc((prev) => !prev)
      return
    }
    setSortKey(nextKey)
    setSortAsc(nextKey === 'user' || nextKey === 'value')
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-black/[0.08] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
            <tr>
              {([
                ['user', 'User'],
                ['value', 'Response Value'],
                ['submittedAt', 'Submitted At'],
              ] as const).map(([key, label]) => (
                <th key={key} className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">
                  <button
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-1.5 hover:text-hub-primary dark:hover:text-blue-300"
                  >
                    {label}
                    <span className={cn('text-[10px] text-hub-muted dark:text-gray-500', sortKey === key && 'text-hub-primary dark:text-blue-300')}>
                      {sortKey === key ? (sortAsc ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-hub-muted dark:text-gray-400">
                  No responses found.
                </td>
              </tr>
            ) : (
              sortedRows.map((response, index) => (
                <tr key={`${response.user}-${index}`} className="border-t border-black/[0.06] dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-hub-text dark:text-gray-100">{response.user}</td>
                  <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{formatResponseValue(response.value)}</td>
                  <td className="px-4 py-3 text-hub-muted dark:text-gray-400">{toDate(response.submittedAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

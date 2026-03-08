'use client'

import Link from 'next/link'
import { use, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

interface BirdEyeStudent {
  userId: string
  name: string | null
  email: string
  lastPageIndex: number
  visitedPages: number[]
  responsePages: number[]
  firstInteraction: string | null
  lastInteraction: string | null
  isActive: boolean
}

interface BirdEyeResponse {
  slug: string
  sections: string[]
  students: BirdEyeStudent[]
  refreshedAt: string
}

const REFRESH_INTERVAL = 15000

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '—'

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return 'just now'

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatRefreshedAt(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function statusColor(
  isCompleted: boolean,
  isCurrent: boolean,
  hasReached: boolean,
  isActive: boolean
): string {
  if (isCompleted) return 'bg-emerald-500 border-emerald-500'
  if (isCurrent) {
    return cn(
      'bg-blue-500 border-blue-500',
      isActive && 'animate-pulse'
    )
  }
  if (hasReached) return 'bg-black/25 border-black/25 dark:bg-white/30 dark:border-white/30'
  return 'border-black/25 dark:border-white/25'
}

export default function LiveViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [data, setData] = useState<BirdEyeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/trainings/${slug}/live`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch live view data')
        const json = (await res.json()) as BirdEyeResponse

        if (!mounted) return
        setData(json)
        setError(null)
      } catch {
        if (!mounted) return
        setError('Unable to refresh live data right now.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, REFRESH_INTERVAL)
      return () => {
        mounted = false
        clearInterval(interval)
      }
    }

    return () => {
      mounted = false
    }
  }, [slug, autoRefresh])

  const sections = data?.sections ?? []
  const students = useMemo(() => {
    if (!data) return []

    return [...data.students].sort((a, b) => {
      const aTime = a.lastInteraction ? new Date(a.lastInteraction).getTime() : 0
      const bTime = b.lastInteraction ? new Date(b.lastInteraction).getTime() : 0
      return bTime - aTime || a.email.localeCompare(b.email)
    })
  }, [data])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href={`/admin/trainings/${slug}`} className="text-sm font-medium text-hub-primary hover:underline dark:text-blue-300">
          ← Back to Training Detail
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">{slug}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live View
          </span>
        </div>
        <p className="text-sm text-hub-muted dark:text-gray-400">
          Last refreshed: {formatRefreshedAt(data?.refreshedAt ?? null)}
        </p>
      </header>

      <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-hub-text dark:text-gray-200">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
              className="h-4 w-4 rounded border-black/20 text-hub-primary focus:ring-hub-primary dark:border-white/20 dark:bg-white/10"
            />
            Auto-refresh
          </label>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-hub-muted dark:text-gray-400">
            {autoRefresh ? 'Auto-refreshing every 15s' : 'Paused'}
          </p>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-hub-muted dark:text-gray-400">Loading live workshop matrix…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-rose-600 dark:text-rose-300">{error}</p>
        ) : students.length === 0 ? (
          <p className="mt-6 text-sm text-hub-muted dark:text-gray-400">No student activity found for this training yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 min-w-[240px] border-b border-black/[0.08] bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-hub-muted dark:border-white/10 dark:bg-[#0b1220] dark:text-gray-400">
                    Student
                  </th>
                  {sections.map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      className="border-b border-black/[0.08] px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-hub-muted dark:border-white/10 dark:text-gray-400"
                    >
                      <span className="inline-block min-w-[28px]">{index + 1}</span>
                    </th>
                  ))}
                  <th className="min-w-[170px] border-b border-black/[0.08] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-hub-muted dark:border-white/10 dark:text-gray-400">
                    Progress
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const completedAll = sections.length > 0 && student.responsePages.length >= sections.length
                  const currentPage = Math.max(student.lastPageIndex + 1, 1)
                  const activeLabel = student.isActive ? 'active now' : 'inactive'

                  return (
                    <tr
                      key={student.userId}
                      className={cn(
                        'border-b border-black/[0.06] dark:border-white/10',
                        student.isActive && 'bg-emerald-50/70 dark:bg-emerald-500/10'
                      )}
                    >
                      <td className="sticky left-0 z-10 border-b border-black/[0.06] bg-inherit px-4 py-3 dark:border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-hub-text dark:text-gray-100">{student.name ?? student.email}</p>
                            <p className="text-xs text-hub-muted dark:text-gray-400">{student.name ? student.email : '—'}</p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-hub-muted dark:bg-white/[0.08] dark:text-gray-400">
                            <span className={cn('h-1.5 w-1.5 rounded-full', student.isActive ? 'bg-emerald-500' : 'bg-gray-400')} />
                            {activeLabel}
                          </span>
                        </div>
                      </td>

                      {sections.map((_heading, index) => {
                        const isCompleted = student.responsePages.includes(index)
                        const isCurrent = student.lastPageIndex === index
                        const hasReached = isCurrent || isCompleted || student.visitedPages.includes(index) || student.lastPageIndex > index

                        return (
                          <td key={`${student.userId}-${index}`} className="border-b border-black/[0.06] px-3 py-2 text-center dark:border-white/10">
                            <span
                              className={cn(
                                'inline-block h-4 w-4 rounded-full border',
                                statusColor(isCompleted, isCurrent, hasReached, student.isActive)
                              )}
                              title={`Page ${index + 1}`}
                            />
                          </td>
                        )
                      })}

                      <td className="border-b border-black/[0.06] px-4 py-3 text-sm dark:border-white/10">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-hub-text dark:text-gray-200">
                            Page {currentPage} of {Math.max(sections.length, 1)}
                          </span>
                          {completedAll && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              Complete
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-hub-muted dark:text-gray-400">
                          First interaction: {formatRelativeTime(student.firstInteraction)}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {sections.length > 0 && (
              <div className="mt-3 grid gap-1 text-xs text-hub-muted dark:text-gray-400">
                {sections.map((heading, index) => (
                  <p key={`legend-${index}`}>
                    <span className="font-semibold text-hub-text dark:text-gray-200">{index + 1}.</span> {heading}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

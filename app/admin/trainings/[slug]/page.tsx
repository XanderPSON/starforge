import Link from 'next/link'
import { getDropOffAnalysis, getTrainingTimeAnalytics } from '@/lib/admin-queries'
import { DropOffChart } from '@/components/admin/DropOffChart'
import { StatsCard } from '@/components/admin/StatsCard'
import { getPrisma } from '@/lib/prisma'

interface TrainingDetailPageProps {
  params: Promise<{ slug: string }>
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export default async function AdminTrainingDetailPage({ params }: TrainingDetailPageProps) {
  const { slug } = await params
  const [dropOff, timeAnalytics, componentCounts] = await Promise.all([
    getDropOffAnalysis(slug),
    getTrainingTimeAnalytics(slug),
    (async () => {
      const prisma = getPrisma()
      if (!prisma) return []
      return prisma.interactionResponse.groupBy({
        by: ['componentId'],
        where: { slug },
        _count: { _all: true },
        orderBy: { componentId: 'asc' },
      })
    })(),
  ])

  const maxCount = Math.max(...dropOff.map((row) => row.count), 0)
  const maxSectionAverage = Math.max(...timeAnalytics.perSectionTime.map((row) => row.averageDurationMs), 0)

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/trainings" className="text-sm font-medium text-hub-primary hover:underline dark:text-blue-300">
          ← Back to Trainings
        </Link>
        <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">{slug}</h1>
        <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">
          Drop-off analysis pinpoints where learners stop progressing.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Learners" value={timeAnalytics.totalLearners} />
        <StatsCard title="Completed" value={timeAnalytics.completedLearners} />
        <StatsCard title="Avg. Completion Time" value={formatDuration(timeAnalytics.averageCompletionMs)} />
        <StatsCard title="Median Completion Time" value={formatDuration(timeAnalytics.medianCompletionMs)} />
      </section>

      <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Completion Time Distribution</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-hub-muted dark:text-gray-400">Fastest</p>
            <p className="mt-1 text-xl font-semibold text-hub-text dark:text-gray-100">
              {formatDuration(timeAnalytics.fastestCompletionMs)}
            </p>
          </div>
          <div className="rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-hub-muted dark:text-gray-400">Slowest</p>
            <p className="mt-1 text-xl font-semibold text-hub-text dark:text-gray-100">
              {formatDuration(timeAnalytics.slowestCompletionMs)}
            </p>
          </div>
          <div className="rounded-lg border border-black/[0.06] bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-hub-muted dark:text-gray-400">Std Dev</p>
            <p className="mt-1 text-xl font-semibold text-hub-text dark:text-gray-100">
              {formatDuration(timeAnalytics.stdDevCompletionMs)}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-hub-muted dark:text-gray-400">
          Measured from first interaction to last interaction per learner.
        </p>
      </section>

      <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Per-Section Time Analysis</h2>
        {timeAnalytics.perSectionTime.length === 0 ? (
          <p className="mt-4 text-sm text-hub-muted dark:text-gray-400">No per-section timing events recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-black/[0.08] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Page</th>
                  <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Average</th>
                  <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Median</th>
                  <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Std Dev</th>
                  <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Samples</th>
                </tr>
              </thead>
              <tbody>
                {timeAnalytics.perSectionTime.map((row) => {
                  const barWidth = maxSectionAverage === 0 ? 0 : Math.round((row.averageDurationMs / maxSectionAverage) * 100)
                  return (
                    <tr key={row.pageIndex} className="border-t border-black/[0.06] dark:border-white/10">
                      <td className="px-4 py-3 text-hub-text dark:text-gray-100">Page {row.pageIndex + 1}</td>
                      <td className="px-4 py-3 text-hub-text dark:text-gray-100">
                        <div className="space-y-2">
                          <span>{formatDuration(row.averageDurationMs)}</span>
                          <div className="h-2 w-full rounded-full bg-black/[0.08] dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-hub-primary dark:bg-blue-400"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{formatDuration(row.medianDurationMs)}</td>
                      <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{formatDuration(row.stdDevDurationMs)}</td>
                      <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{row.samples}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {dropOff.length === 0 ? (
        <div className="rounded-xl border border-black/[0.08] bg-white p-6 text-sm text-hub-muted shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:backdrop-blur-sm">
          No progress records found for this training yet.
        </div>
      ) : (
        <DropOffChart
          data={dropOff.map((row) => ({
            page: row.page,
            count: row.count,
          }))}
          maxCount={maxCount}
        />
      )}

      <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Interactive Components</h2>
        <div className="mt-4 space-y-2">
          {componentCounts.length === 0 ? (
            <p className="text-sm text-hub-muted dark:text-gray-400">No responses recorded yet.</p>
          ) : (
            componentCounts.map((component) => (
              <div
                key={component.componentId}
                className="flex items-center justify-between rounded-lg border border-black/[0.06] bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="font-mono text-xs text-hub-text dark:text-gray-200">{component.componentId}</span>
                <span className="text-sm text-hub-muted dark:text-gray-400">{component._count._all} responses</span>
              </div>
            ))
          )}
        </div>
      </section>

      <div>
        <Link
          href={`/admin/trainings/${slug}/live`}
          className="inline-flex items-center gap-2 rounded-lg bg-hub-primary px-4 py-2 text-sm font-medium text-white hover:bg-hub-primary-dark dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Open Live View →
        </Link>
      </div>
    </div>
  )
}

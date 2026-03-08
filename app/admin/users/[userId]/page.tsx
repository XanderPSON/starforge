import Link from 'next/link'
import { StatsCard } from '@/components/admin/StatsCard'
import { getUserDetail } from '@/lib/admin-queries'

interface AdminUserDetailPageProps {
  params: Promise<{ userId: string }>
}

function formatDateTime(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleString()
}

function formatMemberSince(date: Date): string {
  return date.toLocaleDateString()
}

function formatRole(role: 'student' | 'admin'): string {
  return role === 'admin' ? 'Admin' : 'Student'
}

function formatDuration(start: Date | null, end: Date | null): string {
  if (!start || !end) return '—'
  const diffMs = Math.max(0, end.getTime() - start.getTime())
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)

  if (days >= 1) {
    return `${days} day${days === 1 ? '' : 's'}`
  }

  if (totalHours >= 1) {
    const minutes = totalMinutes % 60
    return `${totalHours}h ${minutes}m`
  }

  return `${totalMinutes}m`
}

function formatResponseValue(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function truncateValue(value: string, limit: number): string {
  if (value.length <= limit) return value
  return `${value.slice(0, limit)}…`
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { userId } = await params
  const detail = await getUserDetail(userId)

  if (!detail) {
    return (
      <div className="space-y-8">
        <Link href="/admin/users" className="font-medium text-hub-primary hover:underline dark:text-blue-300">
          ← Back to Users
        </Link>

        <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
          <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">User not found</h1>
          <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">
            We couldn&apos;t find a user with that ID.
          </p>
        </section>
      </div>
    )
  }

  const activityDates = [
    ...detail.trainings.map((training) => training.completedAt),
    ...detail.trainings.map((training) => training.lastInteraction).filter((date): date is Date => date !== null),
    ...detail.recentResponses.map((response) => response.updatedAt),
  ]

  const lastActive = activityDates.length > 0
    ? new Date(Math.max(...activityDates.map((date) => date.getTime())))
    : null

  return (
    <div className="space-y-8">
      <Link href="/admin/users" className="font-medium text-hub-primary hover:underline dark:text-blue-300">
        ← Back to Users
      </Link>

      <header>
        <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">{detail.name ?? 'Unnamed User'}</h1>
        <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">{detail.email}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-black/[0.1] bg-black/[0.03] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-hub-text dark:border-white/15 dark:bg-white/[0.06] dark:text-gray-200">
            {formatRole(detail.role)}
          </span>
          <span className="text-xs text-hub-muted dark:text-gray-400">
            Member since {formatMemberSince(detail.createdAt)}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard title="Total Trainings" value={detail.trainings.length} />
        <StatsCard title="Total Responses" value={detail.totalResponses} />
        <StatsCard title="Last Active" value={formatDateTime(lastActive)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-black/[0.08] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Training</th>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Progress</th>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Time Spent</th>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">First Started</th>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Last Activity</th>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Responses</th>
              </tr>
            </thead>
            <tbody>
              {detail.trainings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-hub-muted dark:text-gray-400">
                    No training progress found for this user.
                  </td>
                </tr>
              ) : (
                detail.trainings.map((training) => (
                  <tr key={training.slug} className="border-t border-black/[0.06] dark:border-white/10">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/trainings/${training.slug}`}
                        className="font-medium text-hub-primary hover:underline dark:text-blue-300"
                      >
                        {training.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-hub-text dark:text-gray-100">Page {training.pageIndex + 1}</td>
                    <td className="px-4 py-3 text-hub-muted dark:text-gray-300">
                      {formatDuration(training.firstInteraction, training.lastInteraction)}
                    </td>
                    <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{formatDateTime(training.firstInteraction)}</td>
                    <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{formatDateTime(training.lastInteraction)}</td>
                    <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{training.responseCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Recent Responses</h2>
        <div className="mt-4 space-y-2">
          {detail.recentResponses.length === 0 ? (
            <p className="text-sm text-hub-muted dark:text-gray-400">No responses recorded yet.</p>
          ) : (
            detail.recentResponses.map((response) => {
              const value = truncateValue(formatResponseValue(response.value), 140)
              return (
                <div
                  key={`${response.slug}:${response.componentId}:${response.updatedAt.toISOString()}`}
                  className="rounded-lg border border-black/[0.06] bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-hub-text dark:text-gray-100">
                      <span className="font-medium">{response.slug}</span> ·{' '}
                      <span className="font-mono text-xs">{response.componentId}</span>
                    </p>
                    <p className="text-xs text-hub-muted dark:text-gray-400">{formatDateTime(response.updatedAt)}</p>
                  </div>
                  <p className="mt-1 font-mono text-xs text-hub-muted dark:text-gray-300">{value}</p>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

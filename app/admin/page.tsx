import { CompletionTrendChart } from '@/components/admin/charts/CompletionTrendChart'
import { StatsCard } from '@/components/admin/StatsCard'
import { getCompletionTrend, getDashboardStats, getRecentActivity } from '@/lib/admin-queries'

function getActivityDayLabel(date: Date): string {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (target.getTime() === today.getTime()) return 'Today'
  if (target.getTime() === yesterday.getTime()) return 'Yesterday'

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getActivityType(componentId: string): 'temperature' | 'response' {
  return componentId.toLowerCase().includes('temperature') ? 'temperature' : 'response'
}

export default async function AdminOverviewPage() {
  const [stats, completionTrend, activity] = await Promise.all([
    getDashboardStats(),
    getCompletionTrend(14),
    getRecentActivity(10),
  ])

  const groupedActivity = new Map<string, typeof activity>()
  for (const item of activity) {
    const dayKey = item.updatedAt.toISOString().slice(0, 10)
    const dayItems = groupedActivity.get(dayKey) ?? []
    dayItems.push(item)
    groupedActivity.set(dayKey, dayItems)
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">Admin Overview</h1>
        <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">Live operational analytics for Starforge.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Users" value={stats.totalUsers} />
        <StatsCard title="Trainings Completed" value={stats.totalTrainingsCompleted} />
        <StatsCard title="Total Responses" value={stats.totalResponses} />
        <StatsCard
          title="Completion Rate"
          value={`${stats.overallCompletionRate}%`}
          description="Completed trainings ÷ total possible completions"
        />
      </section>

      <CompletionTrendChart data={completionTrend} />

      <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Recent Activity</h2>
        <div className="mt-4 space-y-6">
          {activity.length === 0 ? (
            <p className="text-sm text-hub-muted dark:text-gray-400">No activity yet.</p>
          ) : (
            Array.from(groupedActivity.entries()).map(([dayKey, items]) => {
              const dayDate = items[0]?.updatedAt ?? new Date(dayKey)
              return (
                <div key={dayKey} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-hub-muted dark:text-gray-400">
                    {getActivityDayLabel(dayDate)}
                  </p>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const activityType = getActivityType(item.componentId)
                      const borderColor = activityType === 'temperature'
                        ? 'border-l-amber-500 dark:border-l-amber-400'
                        : 'border-l-hub-primary dark:border-l-blue-400'

                      return (
                        <div
                          key={item.id}
                          className={`rounded-lg border border-black/[0.06] border-l-4 bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/[0.03] ${borderColor}`}
                        >
                          <p className="text-sm text-hub-text dark:text-gray-100">
                            <span className="font-semibold">{item.user}</span> answered{' '}
                            <span className="font-mono text-xs">{item.componentId}</span> in{' '}
                            <span className="font-medium">{item.slug}</span>
                          </p>
                          <p className="mt-1 text-xs text-hub-muted dark:text-gray-400">{item.updatedAt.toLocaleString()}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

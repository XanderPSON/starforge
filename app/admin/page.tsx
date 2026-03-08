import { getDashboardStats, getRecentActivity } from '@/lib/admin-queries'
import { StatsCard } from '@/components/admin/StatsCard'

export default async function AdminOverviewPage() {
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(10),
  ])

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

      <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Recent Activity</h2>
        <div className="mt-4 space-y-3">
          {activity.length === 0 ? (
            <p className="text-sm text-hub-muted dark:text-gray-400">No activity yet.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="rounded-lg border border-black/[0.06] bg-black/[0.02] px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm text-hub-text dark:text-gray-100">
                  <span className="font-semibold">{item.user}</span> answered{' '}
                  <span className="font-mono text-xs">{item.componentId}</span> in{' '}
                  <span className="font-medium">{item.slug}</span>
                </p>
                <p className="mt-1 text-xs text-hub-muted dark:text-gray-400">{item.updatedAt.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

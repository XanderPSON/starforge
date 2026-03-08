import { AlertTriangle, Clock, TrendingDown, UserX } from 'lucide-react'
import { detectAlerts, getAlerts, getUnresolvedAlertCount, type AlertRecord } from '@/lib/admin-queries'
import { resolveAlertAction } from '@/app/admin/actions'

const TYPE_LABELS: Record<string, string> = {
  high_dropoff: 'High drop-off',
  slow_completion: 'Slow completion',
  inactive_user: 'Inactive user',
  low_engagement: 'Low engagement',
}

const TYPE_ICONS: Record<string, typeof AlertTriangle> = {
  high_dropoff: AlertTriangle,
  slow_completion: Clock,
  inactive_user: UserX,
  low_engagement: TrendingDown,
}

function formatType(type: string): string {
  return TYPE_LABELS[type] ?? type.split('_').join(' ')
}

function formatDateTime(date: Date): string {
  return date.toLocaleString()
}

function severityStyles(severity: string): string {
  if (severity === 'critical') {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200'
}

function severityLabel(severity: string): string {
  if (severity === 'critical') return 'Critical'
  return 'Warning'
}

function AlertCard({ alert }: { alert: AlertRecord }) {
  const Icon = TYPE_ICONS[alert.type] ?? AlertTriangle
  const resolveAction = resolveAlertAction.bind(null, alert.id)

  return (
    <article className="rounded-xl border border-black/[0.08] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${severityStyles(alert.severity)}`}
            >
              {severityLabel(alert.severity)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-hub-muted dark:text-gray-400">
              <Icon className="h-3.5 w-3.5" />
              {formatType(alert.type)}
            </span>
          </div>
          <h3 className="text-base font-semibold text-hub-text dark:text-gray-100">{alert.title}</h3>
          <p className="text-sm text-hub-muted dark:text-gray-300">{alert.message}</p>
          <p className="text-xs text-hub-muted dark:text-gray-400">Created {formatDateTime(alert.createdAt)}</p>
        </div>

        {!alert.resolved ? (
          <form action={resolveAction}>
            <button
              type="submit"
              className="inline-flex items-center rounded-lg border border-black/[0.12] px-3 py-1.5 text-sm font-medium text-hub-text transition hover:bg-black/[0.04] dark:border-white/15 dark:text-gray-100 dark:hover:bg-white/[0.08]"
            >
              Resolve
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-black/[0.08] bg-black/[0.02] px-3 py-2 text-xs text-hub-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-400">
            <p>Resolved {alert.resolvedAt ? formatDateTime(alert.resolvedAt) : '—'}</p>
            <p>By {alert.resolvedBy ?? 'unknown'}</p>
          </div>
        )}
      </div>
    </article>
  )
}

export default async function AdminAlertsPage() {
  await detectAlerts()

  const [alerts, unresolvedCount] = await Promise.all([
    getAlerts(),
    getUnresolvedAlertCount(),
  ])

  const activeAlerts = alerts.filter((alert) => !alert.resolved)
  const resolvedAlerts = alerts.filter((alert) => alert.resolved)

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">Alerts</h1>
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
            {unresolvedCount} unresolved
          </span>
        </div>
        <p className="text-sm text-hub-muted dark:text-gray-400">
          Automated anomaly detection for training health and learner activity.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Active Alerts</h2>
        {activeAlerts.length === 0 ? (
          <div className="rounded-xl border border-black/[0.08] bg-white p-5 text-sm text-hub-muted shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:backdrop-blur-sm">
            No active alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </section>

      <section>
        <details className="rounded-xl border border-black/[0.08] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.12em] text-hub-muted dark:text-gray-300">
            Resolved ({resolvedAlerts.length})
          </summary>
          <div className="mt-4 space-y-3">
            {resolvedAlerts.length === 0 ? (
              <p className="text-sm text-hub-muted dark:text-gray-400">No resolved alerts yet.</p>
            ) : (
              resolvedAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
            )}
          </div>
        </details>
      </section>
    </div>
  )
}

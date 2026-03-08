interface DropOffChartProps {
  data: Array<{ page: string; count: number }>
  maxCount: number
}

function getBarClass(percent: number): string {
  if (percent >= 80) return 'from-emerald-500 to-green-400'
  if (percent >= 55) return 'from-yellow-500 to-amber-400'
  return 'from-orange-500 to-red-500'
}

export function DropOffChart({ data, maxCount }: DropOffChartProps) {
  const safeMax = maxCount > 0 ? maxCount : 1

  let problemPageIndex = -1
  let maxDrop = -1
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1]?.count ?? 0
    const current = data[i]?.count ?? 0
    const drop = prev - current
    if (drop > maxDrop) {
      maxDrop = drop
      problemPageIndex = i
    }
  }

  return (
    <div className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-hub-text dark:text-gray-100">Drop-off by Page</h3>
        <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">
          Highest drop-off is highlighted to pinpoint where learners stop.
        </p>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          const percent = Math.round((item.count / safeMax) * 100)
          const isProblem = index === problemPageIndex && maxDrop > 0

          return (
            <div key={item.page}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-hub-text dark:text-gray-200">
                  {item.page}
                  {isProblem && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-300">
                      Problem page
                    </span>
                  )}
                </span>
                <span className="text-hub-muted dark:text-gray-400">{item.count} users</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getBarClass(percent)} ${isProblem ? 'ring-2 ring-red-300 dark:ring-red-500/60' : ''}`}
                  style={{ width: `${Math.max(percent, item.count > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '@/components/admin/charts/chart-theme'

interface CompletionTrendChartProps {
  data: Array<{ date: string; completions: number; responses: number }>
}

function formatDateLabel(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  const theme = useChartTheme()

  return (
    <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Completion Trend</h2>
      <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">Daily completions and responses for the selected period.</p>

      <div className="mt-5 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: theme.axisText, fontSize: 12 }}
              tickFormatter={formatDateLabel}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
            />
            <YAxis
              tick={{ fill: theme.axisText, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.tooltipBackground,
                borderColor: theme.grid,
                color: theme.tooltipText,
                borderRadius: '0.75rem',
              }}
              formatter={(value, name) => [String(value), name === 'completions' ? 'Completions' : 'Responses']}
              labelFormatter={(value) => formatDateLabel(String(value))}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ color: theme.axisText, paddingTop: 12 }} />
            <Line type="monotone" dataKey="completions" stroke={theme.lineBlue} strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="responses" stroke={theme.lineEmerald} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

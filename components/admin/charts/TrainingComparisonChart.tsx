'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '@/components/admin/charts/chart-theme'

interface TrainingComparisonChartProps {
  data: Array<{ slug: string; completionRate: number; responseCount: number }>
}

export function TrainingComparisonChart({ data }: TrainingComparisonChartProps) {
  const theme = useChartTheme()
  const chartHeight = Math.max(280, data.length * 56)

  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }

  return (
    <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Completion Rate by Training</h2>
      <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">Compare completion percentage and response volume across trainings.</p>

      <div className="mt-5 w-full" style={{ height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={chartHeight}>
          <BarChart data={data} layout="vertical" margin={{ top: 6, right: 30, left: 8, bottom: 6 }}>
            <defs>
              <linearGradient id="trainingCompletionGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={theme.barBlueStart} />
                <stop offset="100%" stopColor={theme.barBlueEnd} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: theme.axisText, fontSize: 12 }}
              tickFormatter={(value) => `${toNumber(value)}%`}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
            />
            <YAxis
              type="category"
              dataKey="slug"
              width={140}
              tick={{ fill: theme.axisText, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.tooltipBackground,
                borderColor: theme.grid,
                color: theme.tooltipText,
                borderRadius: '0.75rem',
              }}
              formatter={(value, name, item) => {
                if (name === 'completionRate') {
                  return [`${value}%`, 'Completion Rate']
                }
                const responses = item.payload?.responseCount ?? 0
                return [responses, 'Responses']
              }}
            />
            <Bar dataKey="completionRate" fill="url(#trainingCompletionGradient)" radius={[0, 6, 6, 0]}>
              <LabelList
                dataKey="completionRate"
                position="right"
                formatter={(value) => `${toNumber(value)}%`}
                style={{ fill: theme.axisText, fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

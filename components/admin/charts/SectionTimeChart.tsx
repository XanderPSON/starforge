'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '@/components/admin/charts/chart-theme'

interface SectionTimeChartProps {
  data: Array<{ page: string; averageMs: number; medianMs: number }>
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0m'
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export function SectionTimeChart({ data }: SectionTimeChartProps) {
  const theme = useChartTheme()

  return (
    <div className="mt-4 h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="page"
            tick={{ fill: theme.axisText, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
          />
          <YAxis
            tick={{ fill: theme.axisText, fontSize: 12 }}
            tickFormatter={(value) => formatDuration(toNumber(value))}
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
            formatter={(value, name) => [
              formatDuration(toNumber(value)),
              name === 'averageMs' ? 'Average Time' : 'Median Time',
            ]}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ color: theme.axisText, paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="averageMs"
            stroke={theme.lineBlue}
            fill={theme.fillBlue}
            strokeWidth={2.2}
            fillOpacity={1}
            name="Average"
          />
          <Area
            type="monotone"
            dataKey="medianMs"
            stroke={theme.lineEmerald}
            fillOpacity={0}
            strokeWidth={2.2}
            name="Median"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

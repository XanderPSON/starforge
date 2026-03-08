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

interface DistributionChartProps {
  data: Array<{ label: string; count: number; percentage: number }>
}

export function DistributionChart({ data }: DistributionChartProps) {
  const theme = useChartTheme()
  const chartHeight = Math.max(240, data.length * 52)

  return (
    <div className="mt-4 w-full" style={{ height: `${chartHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 30, left: 6, bottom: 6 }}>
          <defs>
            <linearGradient id="distributionGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.barBlueStart} />
              <stop offset="100%" stopColor={theme.barBlueEnd} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={{ fill: theme.axisText, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={180}
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
            formatter={(value, _name, item) => {
              const percentage = item.payload?.percentage ?? 0
              return [`${value} (${percentage}%)`, 'Responses']
            }}
          />
          <Bar dataKey="count" fill="url(#distributionGradient)" radius={[0, 6, 6, 0]}>
            <LabelList
              dataKey="count"
              position="right"
              formatter={(value) => String(value)}
              style={{ fill: theme.axisText, fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

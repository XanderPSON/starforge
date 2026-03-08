'use client'

import { Area, AreaChart } from 'recharts'

interface ActivitySparklineProps {
  data: Array<{ date: string; count: number }>
}

export function ActivitySparkline({ data }: ActivitySparklineProps) {
  const hasActivity = data.some((point) => point.count > 0)

  if (!hasActivity) {
    return <span className="text-xs text-hub-muted dark:text-gray-500">—</span>
  }

  return (
    <AreaChart width={120} height={32} data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="count"
        stroke="#3b82f6"
        strokeWidth={1.5}
        fill="url(#sparkFill)"
        isAnimationActive={false}
      />
    </AreaChart>
  )
}

'use client'

import { useEffect, useState } from 'react'

interface ChartTheme {
  axisText: string
  grid: string
  tooltipBackground: string
  tooltipText: string
  lineBlue: string
  lineEmerald: string
  fillBlue: string
  barBlueStart: string
  barBlueEnd: string
}

const lightTheme: ChartTheme = {
  axisText: '#6b7280',
  grid: '#e5e7eb',
  tooltipBackground: '#ffffff',
  tooltipText: '#111827',
  lineBlue: '#2563eb',
  lineEmerald: '#10b981',
  fillBlue: 'rgba(37, 99, 235, 0.25)',
  barBlueStart: '#3b82f6',
  barBlueEnd: '#2563eb',
}

const darkTheme: ChartTheme = {
  axisText: '#9ca3af',
  grid: 'rgba(255,255,255,0.1)',
  tooltipBackground: '#1f2937',
  tooltipText: '#ffffff',
  lineBlue: '#60a5fa',
  lineEmerald: '#34d399',
  fillBlue: 'rgba(96, 165, 250, 0.3)',
  barBlueStart: '#60a5fa',
  barBlueEnd: '#3b82f6',
}

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

export function useChartTheme(): ChartTheme {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(isDarkMode())

    const observer = new MutationObserver(() => {
      setDark(isDarkMode())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return dark ? darkTheme : lightTheme
}

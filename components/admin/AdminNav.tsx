'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/trainings', label: 'Trainings' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/questions', label: 'Questions' },
  { href: '/admin/alerts', label: 'Alerts' },
]

export function AdminNav() {
  const pathname = usePathname()
  const [unresolvedAlertCount, setUnresolvedAlertCount] = useState(0)

  useEffect(() => {
    let mounted = true

    async function fetchUnresolvedAlertCount() {
      try {
        const response = await fetch('/api/admin/alerts?resolved=false&limit=0', { cache: 'no-store' })
        if (!response.ok) return

        const payload = (await response.json()) as { count?: unknown }
        const count = typeof payload.count === 'number' ? payload.count : 0
        if (mounted) {
          setUnresolvedAlertCount(Math.max(0, Math.floor(count)))
        }
      } catch {
        if (mounted) {
          setUnresolvedAlertCount(0)
        }
      }
    }

    fetchUnresolvedAlertCount()

    return () => {
      mounted = false
    }
  }, [])

  const alertBadgeText = unresolvedAlertCount > 99 ? '99+' : String(unresolvedAlertCount)

  return (
    <aside className="sticky top-12 h-[calc(100vh-3rem)] w-64 shrink-0 border-r border-black/[0.08] bg-hub-surface/90 px-4 py-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <p className="mb-6 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-hub-muted dark:text-gray-400">
        Admin Console
      </p>
      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-hub-primary/12 text-hub-primary shadow-sm dark:bg-blue-500/20 dark:text-blue-300'
                  : 'text-hub-muted hover:bg-black/[0.03] hover:text-hub-text dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100'
              )}
              >
              <span className="inline-flex items-center gap-2">
                <span>{item.label}</span>
                {item.href === '/admin/alerts' && unresolvedAlertCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {alertBadgeText}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

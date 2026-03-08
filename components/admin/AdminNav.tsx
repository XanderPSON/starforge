'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/trainings', label: 'Trainings' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/questions', label: 'Questions' },
]

export function AdminNav() {
  const pathname = usePathname()

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
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

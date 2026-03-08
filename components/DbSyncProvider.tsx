'use client'

import { useEffect } from 'react'
import { isDbEnabled, isAuthEnabled } from '@/lib/features'
import { syncInteractionToDb } from '@/app/actions/sync'

interface DbSyncEvent extends CustomEvent {
  detail: { key: string; value: unknown }
}

export function DbSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isDbEnabled() || !isAuthEnabled()) return

    const handleSync = (e: Event) => {
      const { key, value } = (e as DbSyncEvent).detail
      const prefix = 'codelab:'
      if (!key.startsWith(prefix)) return

      const parts = key.slice(prefix.length).split(':')
      if (parts.length < 2) return

      const slug = parts[0]!
      const componentId = parts.slice(1).join(':')

      syncInteractionToDb(slug, componentId, value).catch((error: unknown) => {
        console.warn('DB sync failed:', error)
      })
    }

    window.addEventListener('starforge:dbSync', handleSync)
    return () => window.removeEventListener('starforge:dbSync', handleSync)
  }, [])

  return <>{children}</>
}

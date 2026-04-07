'use client'

import { useEffect } from 'react'
import { isDbEnabled } from '@/lib/features'
import { syncInteractionToDb } from '@/app/actions/sync'
import { getSelfIdentity } from '@/lib/event-tracking'

interface DbSyncEvent extends CustomEvent {
  detail: { key: string; value: unknown }
}

export function DbSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isDbEnabled()) return

    const handleSync = (e: Event) => {
      const { key, value } = (e as DbSyncEvent).detail
      const prefix = 'codelab:'
      if (!key.startsWith(prefix)) return

      const parts = key.slice(prefix.length).split(':')
      if (parts.length < 2) return

      const slug = parts[0]!
      const componentId = parts.slice(1).join(':')

      const identity = getSelfIdentity()
      const userId = identity?.userId
      if (!userId) return

      syncInteractionToDb(slug, componentId, value, userId).catch((error: unknown) => {
        console.warn('DB sync failed:', error)
      })
    }

    window.addEventListener('starforge:dbSync', handleSync)
    return () => window.removeEventListener('starforge:dbSync', handleSync)
  }, [])

  return <>{children}</>
}

'use client'

import { isDbEnabled } from '@/lib/features'

interface StoredState {
  id: string
  value: unknown
  updatedAt: number
  version: string
}

export async function importLocalStorageToDb(
  syncAction: (slug: string, componentId: string, value: unknown) => Promise<void>
): Promise<number> {
  if (!isDbEnabled()) return 0
  if (typeof window === 'undefined') return 0

  let migrated = 0
  const prefix = 'codelab:'

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(prefix)) continue

    const parts = key.slice(prefix.length).split(':')
    if (parts.length < 2) continue

    const slug = parts[0]!
    const componentId = parts.slice(1).join(':')

    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue

      const parsed: StoredState = JSON.parse(raw)
      await syncAction(slug, componentId, parsed.value)
      migrated++
    } catch {
      console.warn(`Migration: skipping invalid data for key "${key}"`)
    }
  }

  return migrated
}

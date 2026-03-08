'use server'

import { isDbEnabled } from '@/lib/features'
import { saveInteractionResponse } from '@/lib/db'

export async function syncInteractionToDb(
  slug: string,
  componentId: string,
  value: unknown
): Promise<void> {
  if (!isDbEnabled()) return

  // Auth check — lazy import to avoid circular deps when auth is disabled
  let userId: string | undefined
  try {
    const { auth } = await import('@/lib/auth')
    const session = await auth()
    userId = session?.user?.id
  } catch {
    return
  }

  if (!userId) return

  await saveInteractionResponse(userId, slug, componentId, value)
}

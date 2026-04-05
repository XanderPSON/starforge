'use server'

import { isDbEnabled } from '@/lib/features'
import { getPrisma } from '@/lib/prisma'

interface SelfIdentifyResult {
  success: boolean
  userId?: string
  error?: string
}

export async function selfIdentify(
  email: string,
  name: string | undefined,
  persistentId: string
): Promise<SelfIdentifyResult> {
  if (!isDbEnabled()) {
    return { success: false, error: 'Database is not enabled' }
  }

  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  const prisma = getPrisma()
  if (!prisma) {
    return { success: false, error: 'Database unavailable' }
  }

  const user = await prisma.user.upsert({
    where: { email: trimmedEmail },
    update: { name: name?.trim() || undefined },
    create: { email: trimmedEmail, name: name?.trim() || null },
  })

  // Backfill: link all anonymous events from this persistentId to the user
  const backfilled = await prisma.learningEvent.updateMany({
    where: {
      sessionId: persistentId,
      userId: null,
    },
    data: {
      userId: user.id,
    },
  })

  if (backfilled.count > 0) {
    console.log(`Backfilled ${backfilled.count} anonymous events for ${trimmedEmail}`)
  }

  return { success: true, userId: user.id }
}

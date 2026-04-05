'use server'

import { isDbEnabled } from '@/lib/features'
import { getPrisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'

export async function saveEvent(
  sessionId: string,
  slug: string,
  eventType: string,
  pageIndex?: number,
  metadata?: Record<string, unknown>,
  selfIdentifiedUserId?: string
): Promise<void> {
  if (!isDbEnabled()) return

  let userId: string | undefined = selfIdentifiedUserId
  if (!userId) {
    try {
      const { auth } = await import('@/lib/auth')
      const session = await auth()
      userId = session?.user?.id
    } catch {
    }
  }

  const prisma = getPrisma()
  if (!prisma) return

  await prisma.learningEvent.create({
    data: {
      userId,
      sessionId,
      slug,
      pageIndex: pageIndex ?? null,
      eventType,
      metadata: (metadata as Prisma.InputJsonValue | undefined) ?? undefined,
    },
  })
}

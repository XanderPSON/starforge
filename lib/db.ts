import { getPrisma } from '@/lib/prisma'
import type { Role } from '@/lib/generated/prisma/client'

export async function saveInteractionResponse(
  userId: string,
  slug: string,
  componentId: string,
  value: unknown
) {
  const prisma = getPrisma()
  if (!prisma) return null

  return prisma.interactionResponse.upsert({
    where: { userId_slug_componentId: { userId, slug, componentId } },
    update: { value: value as never, updatedAt: new Date() },
    create: { userId, slug, componentId, value: value as never },
  })
}

export async function getInteractionResponses(userId: string, slug?: string) {
  const prisma = getPrisma()
  if (!prisma) return []

  return prisma.interactionResponse.findMany({
    where: slug ? { userId, slug } : { userId },
    orderBy: { submittedAt: 'desc' },
  })
}

export async function saveTrainingProgress(
  userId: string,
  slug: string,
  pageIndex: number
) {
  const prisma = getPrisma()
  if (!prisma) return null

  return prisma.trainingProgress.upsert({
    where: { userId_slug: { userId, slug } },
    update: { pageIndex, completedAt: new Date() },
    create: { userId, slug, pageIndex },
  })
}

export async function getTrainingProgress(userId: string, slug?: string) {
  const prisma = getPrisma()
  if (!prisma) return []

  return prisma.trainingProgress.findMany({
    where: slug ? { userId, slug } : { userId },
    orderBy: { completedAt: 'desc' },
  })
}

export async function getUserByEmail(email: string) {
  const prisma = getPrisma()
  if (!prisma) return null

  return prisma.user.findUnique({ where: { email } })
}

export async function upsertUser(email: string, name?: string, image?: string) {
  const prisma = getPrisma()
  if (!prisma) return null

  return prisma.user.upsert({
    where: { email },
    update: { name, image },
    create: { email, name, image },
  })
}

export async function updateUserRole(userId: string, role: Role) {
  const prisma = getPrisma()
  if (!prisma) return null

  return prisma.user.update({
    where: { id: userId },
    data: { role },
  })
}

export async function listUsers() {
  const prisma = getPrisma()
  if (!prisma) return []

  return prisma.user.findMany({
    include: {
      _count: { select: { progress: true, responses: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

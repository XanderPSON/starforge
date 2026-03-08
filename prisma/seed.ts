import 'dotenv/config'

import { randomUUID } from 'node:crypto'

import { Prisma, PrismaClient, Role } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const TRAININGS = [
  { slug: 'eng-bootcamp-backend', totalPages: 8 },
  { slug: 'graceful-degradation', totalPages: 6 },
  { slug: 'intro-onchain-workshops', totalPages: 7 },
  { slug: 'intro', totalPages: 5 },
  { slug: 'nho-ai-tools', totalPages: 9 },
] as const

const SAMPLE_USERS = [
  { name: 'Alice Johnson', email: 'alice.johnson@coinbase.com', role: Role.student, completedAllTrainings: true },
  { name: 'Ben Carter', email: 'ben.carter@coinbase.com', role: Role.student, completedAllTrainings: true },
  { name: 'Chloe Nguyen', email: 'chloe.nguyen@coinbase.com', role: Role.student, completedAllTrainings: false },
  { name: 'Daniel Patel', email: 'daniel.patel@coinbase.com', role: Role.student, completedAllTrainings: false },
  { name: 'Evelyn Chen', email: 'evelyn.chen@coinbase.com', role: Role.student, completedAllTrainings: true },
  { name: 'Farah Khan', email: 'farah.khan@coinbase.com', role: Role.student, completedAllTrainings: false },
  { name: 'Gavin Brooks', email: 'gavin.brooks@coinbase.com', role: Role.student, completedAllTrainings: true },
  { name: 'Harper Li', email: 'harper.li@coinbase.com', role: Role.student, completedAllTrainings: false },
  { name: 'Ian Rivera', email: 'ian.rivera@coinbase.com', role: Role.admin, completedAllTrainings: true },
  { name: 'Jordan Smith', email: 'jordan.smith@coinbase.com', role: Role.admin, completedAllTrainings: false },
] as const

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function randomDateInLast7Days(): Date {
  const dayOffset = randomInt(0, 6)
  const base = daysAgo(dayOffset)
  const hour = randomInt(8, 20)
  const minute = randomInt(0, 59)
  const second = randomInt(0, 59)
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hour,
    minute,
    second,
    randomInt(0, 999),
  )
}

function pickTrainingSlugs(completedAllTrainings: boolean): string[] {
  if (completedAllTrainings) {
    return TRAININGS.map((training) => training.slug)
  }

  const count = randomInt(2, 4)
  const shuffled = [...TRAININGS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((training) => training.slug)
}

function buildResponsesForSlug(slug: string, userName: string): Array<{ componentId: string; value: Prisma.InputJsonValue }> {
  return [
    { componentId: 'temp-check-1', value: randomInt(2, 5) },
    { componentId: 'temp-check-2', value: randomInt(1, 5) },
    {
      componentId: 'free-response-setup',
      value: `${userName} set up local tooling and verified dev environment for ${slug}.`,
    },
    {
      componentId: 'mc-runtime-choice',
      value: ['Node.js', 'Bun', 'Deno'][randomInt(0, 2)] ?? 'Node.js',
    },
    {
      componentId: 'checklist-preflight',
      value: [Math.random() > 0.2, Math.random() > 0.3, Math.random() > 0.15],
    },
    {
      componentId: 'flavor-ssh-key',
      value: 'Generated a new SSH key, added it to GitHub, and validated clone access.',
    },
    {
      componentId: 'flavor-first-pr',
      value: 'Opened first PR with passing checks and requested review from onboarding buddy.',
    },
  ]
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run prisma seed')
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const seededUsers = await Promise.all(
      SAMPLE_USERS.map((user, index) =>
        prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            role: user.role,
          },
          create: {
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: daysAgo(6 + (index % 2)),
          },
        }),
      ),
    )

    const userIds = seededUsers.map((user) => user.id)

    await prisma.learningEvent.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.interactionResponse.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.trainingProgress.deleteMany({ where: { userId: { in: userIds } } })

    const trainingProgressData: Prisma.TrainingProgressCreateManyInput[] = []
    const responseData: Prisma.InteractionResponseCreateManyInput[] = []
    const eventData: Prisma.LearningEventCreateManyInput[] = []

    for (const seededUser of seededUsers) {
      const userConfig = SAMPLE_USERS.find((user) => user.email === seededUser.email)
      if (!userConfig) continue

      const slugs = pickTrainingSlugs(userConfig.completedAllTrainings)

      for (const slug of slugs) {
        const training = TRAININGS.find((item) => item.slug === slug)
        if (!training) continue

        const finished = userConfig.completedAllTrainings || Math.random() > 0.35
        const pageIndex = finished
          ? training.totalPages - 1
          : randomInt(1, Math.max(1, training.totalPages - 2))

        trainingProgressData.push({
          userId: seededUser.id,
          slug,
          pageIndex,
          completedAt: randomDateInLast7Days(),
        })

        const responses = buildResponsesForSlug(slug, userConfig.name)
        for (const response of responses) {
          responseData.push({
            userId: seededUser.id,
            slug,
            componentId: response.componentId,
            value: response.value,
            submittedAt: randomDateInLast7Days(),
          })
        }

        const sessions = randomInt(2, 4)
        for (let sessionNumber = 0; sessionNumber < sessions; sessionNumber += 1) {
          const sessionId = randomUUID()
          const sessionStart = randomDateInLast7Days()

          eventData.push({
            userId: seededUser.id,
            sessionId,
            slug,
            pageIndex: null,
            eventType: 'session_start',
            metadata: {
              source: sessionNumber % 2 === 0 ? 'dashboard' : 'deep-link',
            },
            createdAt: sessionStart,
          })

          const visitedPages = randomInt(2, Math.min(training.totalPages, 5))
          for (let page = 0; page < visitedPages; page += 1) {
            const viewAt = new Date(sessionStart.getTime() + randomInt(2, 40) * 1000 + page * 20_000)
            const durationMs = randomInt(30_000, 600_000)

            eventData.push({
              userId: seededUser.id,
              sessionId,
              slug,
              pageIndex: page,
              eventType: 'page_view',
              metadata: {
                referrer: page === 0 ? '/dashboard' : 'in-training-nav',
              },
              createdAt: viewAt,
            })

            eventData.push({
              userId: seededUser.id,
              sessionId,
              slug,
              pageIndex: page,
              eventType: 'nav_click',
              metadata: {
                target: ['next', 'previous', 'toc'][randomInt(0, 2)] ?? 'next',
                fromPage: page,
              },
              createdAt: new Date(viewAt.getTime() + randomInt(3_000, 45_000)),
            })

            eventData.push({
              userId: seededUser.id,
              sessionId,
              slug,
              pageIndex: page,
              eventType: 'session_heartbeat',
              metadata: {
                activeMs: randomInt(15_000, 60_000),
              },
              createdAt: new Date(viewAt.getTime() + randomInt(10_000, 70_000)),
            })

            eventData.push({
              userId: seededUser.id,
              sessionId,
              slug,
              pageIndex: page,
              eventType: 'page_exit',
              metadata: {
                durationMs,
              },
              createdAt: new Date(viewAt.getTime() + durationMs),
            })
          }
        }
      }
    }

    if (trainingProgressData.length > 0) {
      await prisma.trainingProgress.createMany({ data: trainingProgressData })
    }

    if (responseData.length > 0) {
      await prisma.interactionResponse.createMany({ data: responseData })
    }

    if (eventData.length > 0) {
      await prisma.learningEvent.createMany({ data: eventData })
    }

    console.log(
      `Seed complete: ${seededUsers.length} users, ${trainingProgressData.length} progress records, ${responseData.length} responses, ${eventData.length} events.`,
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})

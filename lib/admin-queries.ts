import { getPrisma } from '@/lib/prisma'

export interface DashboardStats {
  totalUsers: number
  totalTrainingsCompleted: number
  totalResponses: number
  overallCompletionRate: number
}

export interface TrainingCompletionRate {
  slug: string
  completions: number
  totalUsers: number
  completionRate: number
  responseCount: number
}

export interface DropOffPoint {
  page: string
  pageIndex: number
  count: number
  dropFromPrevious: number
}

export interface ResponseDistributionEntry {
  valueLabel: string
  count: number
  percentage: number
}

export interface ResponseDistributionResult {
  slug: string
  componentId: string
  totalResponses: number
  responses: Array<{ user: string; value: unknown; submittedAt: Date }>
  distribution: ResponseDistributionEntry[]
}

export interface UserProgressSummary {
  userId: string
  email: string
  name: string | null
  role: 'student' | 'admin'
  trainingsCompleted: number
  pagesCompleted: number
  responses: number
  lastActive: Date | null
}

export interface UserDetail {
  userId: string
  email: string
  name: string | null
  role: 'student' | 'admin'
  createdAt: Date
  trainings: Array<{
    slug: string
    pageIndex: number
    totalPages: number | null
    completedAt: Date
    responseCount: number
    firstInteraction: Date | null
    lastInteraction: Date | null
  }>
  totalResponses: number
  recentResponses: Array<{
    slug: string
    componentId: string
    value: unknown
    updatedAt: Date
  }>
}

export interface RecentActivityItem {
  id: string
  userId: string
  user: string
  slug: string
  componentId: string
  value: unknown
  submittedAt: Date
  updatedAt: Date
}

export interface EventStatsResult {
  totalEvents: number
  byType: Array<{ eventType: string; count: number }>
  perDay: Array<{ date: string; count: number }>
}

export interface PageViewAnalytics {
  slug: string
  viewsPerPage: Array<{ pageIndex: number; views: number }>
  avgTimePerPage: Array<{ pageIndex: number; averageDurationMs: number; samples: number }>
  mostVisited: { pageIndex: number; views: number } | null
  leastVisited: { pageIndex: number; views: number } | null
}

export interface SessionAnalytics {
  activeSessions: number
  averageSessionDurationMs: number
  sessionsPerDay: Array<{ date: string; sessions: number }>
}

export interface TrainingTimeAnalytics {
  slug: string
  totalLearners: number
  completedLearners: number
  averageCompletionMs: number
  medianCompletionMs: number
  stdDevCompletionMs: number
  fastestCompletionMs: number
  slowestCompletionMs: number
  perSectionTime: Array<{
    pageIndex: number
    averageDurationMs: number
    medianDurationMs: number
    stdDevDurationMs: number
    samples: number
  }>
}

export interface BirdEyeStudentRow {
  userId: string
  name: string | null
  email: string
  lastPageIndex: number
  visitedPages: number[]
  responsePages: number[]
  responseComponentIds: string[]
  firstInteraction: Date | null
  lastInteraction: Date | null
  isActive: boolean
}

function safePercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

function median(values: number[]): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const midpoint = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    const val1 = sorted[midpoint - 1] ?? 0
    const val2 = sorted[midpoint] ?? 0
    return (val1 + val2) / 2
  }

  return sorted[midpoint] ?? 0
}

function stdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0

  const variance = values.reduce((sum, value) => {
    const diff = value - mean
    return sum + diff * diff
  }, 0) / values.length

  return Math.sqrt(variance)
}

function formatDistributionValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === 'boolean')) {
      const completed = value.filter(Boolean).length
      return `${completed} of ${value.length} completed`
    }
    return JSON.stringify(value)
  }
  if (value && typeof value === 'object') return JSON.stringify(value)
  return 'No response'
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getMetadataNumber(metadata: unknown, key: string): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const value = (metadata as Record<string, unknown>)[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return value
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const prisma = getPrisma()
  if (!prisma) {
    return {
      totalUsers: 0,
      totalTrainingsCompleted: 0,
      totalResponses: 0,
      overallCompletionRate: 0,
    }
  }

  const [totalUsers, totalTrainingsCompleted, totalResponses, distinctTrainingCount] = await Promise.all([
    prisma.user.count(),
    prisma.trainingProgress.count(),
    prisma.interactionResponse.count(),
    prisma.trainingProgress.groupBy({ by: ['slug'] }),
  ])

  const maxCompletions = totalUsers * distinctTrainingCount.length
  const overallCompletionRate = safePercent(totalTrainingsCompleted, maxCompletions)

  return {
    totalUsers,
    totalTrainingsCompleted,
    totalResponses,
    overallCompletionRate,
  }
}

export async function getTrainingCompletionRates(): Promise<TrainingCompletionRate[]> {
  const prisma = getPrisma()
  if (!prisma) return []

  const [totalUsers, completionGroups, responseGroups] = await Promise.all([
    prisma.user.count(),
    prisma.trainingProgress.groupBy({ by: ['slug'], _count: { _all: true } }),
    prisma.interactionResponse.groupBy({ by: ['slug'], _count: { _all: true } }),
  ])

  const completionBySlug = new Map<string, number>()
  for (const row of completionGroups) {
    completionBySlug.set(row.slug, row._count._all)
  }

  const responsesBySlug = new Map<string, number>()
  for (const row of responseGroups) {
    responsesBySlug.set(row.slug, row._count._all)
  }

  const allSlugs = new Set<string>([
    ...completionBySlug.keys(),
    ...responsesBySlug.keys(),
  ])

  return Array.from(allSlugs)
    .map((slug) => {
      const completions = completionBySlug.get(slug) ?? 0
      const responseCount = responsesBySlug.get(slug) ?? 0
      return {
        slug,
        completions,
        totalUsers,
        completionRate: safePercent(completions, totalUsers),
        responseCount,
      }
    })
    .sort((a, b) => b.completionRate - a.completionRate || a.slug.localeCompare(b.slug))
}

export async function getDropOffAnalysis(slug: string): Promise<DropOffPoint[]> {
  const prisma = getPrisma()
  if (!prisma) return []

  const progress = await prisma.trainingProgress.findMany({
    where: { slug },
    select: { pageIndex: true },
  })

  if (progress.length === 0) return []

  const maxPageIndex = Math.max(...progress.map((entry) => entry.pageIndex))
  const rows: DropOffPoint[] = []
  let previousCount = 0

  for (let pageIndex = 0; pageIndex <= maxPageIndex; pageIndex++) {
    const count = progress.filter((entry) => entry.pageIndex >= pageIndex).length
    const dropFromPrevious = pageIndex === 0 ? 0 : Math.max(0, previousCount - count)
    rows.push({
      page: `Page ${pageIndex + 1}`,
      pageIndex,
      count,
      dropFromPrevious,
    })
    previousCount = count
  }

  return rows
}

export async function getResponseDistribution(
  slug: string,
  componentId: string
): Promise<ResponseDistributionResult | null> {
  const prisma = getPrisma()
  if (!prisma) return null

  const responses = await prisma.interactionResponse.findMany({
    where: { slug, componentId },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  if (responses.length === 0) {
    return {
      slug,
      componentId,
      totalResponses: 0,
      responses: [],
      distribution: [],
    }
  }

  const frequency = new Map<string, number>()
  for (const response of responses) {
    const key = formatDistributionValue(response.value)
    frequency.set(key, (frequency.get(key) ?? 0) + 1)
  }

  const totalResponses = responses.length
  const distribution = Array.from(frequency.entries())
    .map(([valueLabel, count]) => ({
      valueLabel,
      count,
      percentage: safePercent(count, totalResponses),
    }))
    .sort((a, b) => b.count - a.count)

  return {
    slug,
    componentId,
    totalResponses,
    responses: responses.map((response) => ({
      user: response.user.name ?? response.user.email,
      value: response.value,
      submittedAt: response.submittedAt,
    })),
    distribution,
  }
}

export async function getUserProgressSummary(userId?: string): Promise<UserProgressSummary[]> {
  const prisma = getPrisma()
  if (!prisma) return []

  const users = await prisma.user.findMany({
    where: userId ? { id: userId } : undefined,
    include: {
      progress: {
        select: {
          pageIndex: true,
          completedAt: true,
        },
      },
      responses: {
        select: {
          submittedAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map((user) => {
    const trainingsCompleted = user.progress.length
    const pagesCompleted = user.progress.reduce((acc, item) => acc + item.pageIndex + 1, 0)
    const responses = user.responses.length

    const activityDates = [
      ...user.progress.map((item) => item.completedAt),
      ...user.responses.map((item) => item.updatedAt ?? item.submittedAt),
    ]
    const lastActive = activityDates.length > 0
      ? new Date(Math.max(...activityDates.map((date) => date.getTime())))
      : null

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      trainingsCompleted,
      pagesCompleted,
      responses,
      lastActive,
    }
  })
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const prisma = getPrisma()
  if (!prisma) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) return null

  const [progress, responseGroups, totalResponses, recentResponses] = await Promise.all([
    prisma.trainingProgress.findMany({
      where: { userId },
      select: {
        slug: true,
        pageIndex: true,
        completedAt: true,
      },
      orderBy: [{ completedAt: 'desc' }, { slug: 'asc' }],
    }),
    prisma.interactionResponse.groupBy({
      by: ['slug'],
      where: { userId },
      _count: { _all: true },
      _min: { submittedAt: true },
      _max: { updatedAt: true },
    }),
    prisma.interactionResponse.count({ where: { userId } }),
    prisma.interactionResponse.findMany({
      where: { userId },
      select: {
        slug: true,
        componentId: true,
        value: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ])

  const responsesBySlug = new Map(
    responseGroups.map((row) => [
      row.slug,
      {
        responseCount: row._count._all,
        firstInteraction: row._min.submittedAt,
        lastInteraction: row._max.updatedAt,
      },
    ])
  )

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    trainings: progress.map((training) => {
      const responseSummary = responsesBySlug.get(training.slug)
      return {
        slug: training.slug,
        pageIndex: training.pageIndex,
        totalPages: null,
        completedAt: training.completedAt,
        responseCount: responseSummary?.responseCount ?? 0,
        firstInteraction: responseSummary?.firstInteraction ?? null,
        lastInteraction: responseSummary?.lastInteraction ?? null,
      }
    }),
    totalResponses,
    recentResponses,
  }
}

export async function getRecentActivity(limit: number): Promise<RecentActivityItem[]> {
  const prisma = getPrisma()
  if (!prisma) return []

  const rows = await prisma.interactionResponse.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    user: row.user.name ?? row.user.email,
    slug: row.slug,
    componentId: row.componentId,
    value: row.value,
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
  }))
}

export async function getEventStats(): Promise<EventStatsResult> {
  const prisma = getPrisma()
  if (!prisma) {
    return {
      totalEvents: 0,
      byType: [],
      perDay: [],
    }
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setHours(0, 0, 0, 0)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const [totalEvents, byTypeRows, recentEvents] = await Promise.all([
    prisma.learningEvent.count(),
    prisma.learningEvent.groupBy({
      by: ['eventType'],
      _count: { _all: true },
    }),
    prisma.learningEvent.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const byType = byTypeRows.map((row) => ({
    eventType: row.eventType,
    count: row._count._all,
  }))

  const perDayMap = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo)
    date.setDate(sevenDaysAgo.getDate() + i)
    perDayMap.set(toDayKey(date), 0)
  }

  for (const row of recentEvents) {
    const day = toDayKey(row.createdAt)
    perDayMap.set(day, (perDayMap.get(day) ?? 0) + 1)
  }

  const perDay = Array.from(perDayMap.entries()).map(([date, count]) => ({ date, count }))

  return {
    totalEvents,
    byType,
    perDay,
  }
}

export async function getPageViewAnalytics(slug: string): Promise<PageViewAnalytics> {
  const prisma = getPrisma()
  if (!prisma) {
    return {
      slug,
      viewsPerPage: [],
      avgTimePerPage: [],
      mostVisited: null,
      leastVisited: null,
    }
  }

  const [pageViews, pageExits] = await Promise.all([
    prisma.learningEvent.findMany({
      where: { slug, eventType: 'page_view' },
      select: { pageIndex: true },
    }),
    prisma.learningEvent.findMany({
      where: { slug, eventType: 'page_exit' },
      select: { pageIndex: true, metadata: true },
    }),
  ])

  const viewsMap = new Map<number, number>()
  for (const row of pageViews) {
    if (typeof row.pageIndex !== 'number') continue
    viewsMap.set(row.pageIndex, (viewsMap.get(row.pageIndex) ?? 0) + 1)
  }

  const durationMap = new Map<number, { totalMs: number; samples: number }>()
  for (const row of pageExits) {
    if (typeof row.pageIndex !== 'number') continue
    const durationMs = getMetadataNumber(row.metadata, 'durationMs')
    if (durationMs === null) continue

    const current = durationMap.get(row.pageIndex) ?? { totalMs: 0, samples: 0 }
    durationMap.set(row.pageIndex, {
      totalMs: current.totalMs + durationMs,
      samples: current.samples + 1,
    })
  }

  const viewsPerPage = Array.from(viewsMap.entries())
    .map(([pageIndex, views]) => ({ pageIndex, views }))
    .sort((a, b) => a.pageIndex - b.pageIndex)

  const avgTimePerPage = Array.from(durationMap.entries())
    .map(([pageIndex, stats]) => ({
      pageIndex,
      averageDurationMs: Math.round(stats.totalMs / stats.samples),
      samples: stats.samples,
    }))
    .sort((a, b) => a.pageIndex - b.pageIndex)

  const sortedByViews = [...viewsPerPage].sort((a, b) => b.views - a.views || a.pageIndex - b.pageIndex)

  return {
    slug,
    viewsPerPage,
    avgTimePerPage,
    mostVisited: sortedByViews[0] ?? null,
    leastVisited: sortedByViews.length > 0 ? (sortedByViews[sortedByViews.length - 1] ?? null) : null,
  }
}

export async function getSessionAnalytics(): Promise<SessionAnalytics> {
  const prisma = getPrisma()
  if (!prisma) {
    return {
      activeSessions: 0,
      averageSessionDurationMs: 0,
      sessionsPerDay: [],
    }
  }

  const now = Date.now()
  const activeSince = new Date(now - 10 * 60 * 1000)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setHours(0, 0, 0, 0)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const [activeSessionRows, sessionBoundaries, sessionStarts] = await Promise.all([
    prisma.learningEvent.findMany({
      where: {
        eventType: { in: ['session_start', 'session_heartbeat'] },
        createdAt: { gte: activeSince },
      },
      select: { sessionId: true },
      distinct: ['sessionId'],
    }),
    prisma.learningEvent.groupBy({
      by: ['sessionId'],
      _min: { createdAt: true },
      _max: { createdAt: true },
    }),
    prisma.learningEvent.findMany({
      where: {
        eventType: 'session_start',
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const durationValues = sessionBoundaries
    .map((row) => {
      if (!row._min.createdAt || !row._max.createdAt) return null
      return row._max.createdAt.getTime() - row._min.createdAt.getTime()
    })
    .filter((value): value is number => value !== null)

  const averageSessionDurationMs = durationValues.length === 0
    ? 0
    : Math.round(durationValues.reduce((sum, value) => sum + value, 0) / durationValues.length)

  const sessionsPerDayMap = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo)
    date.setDate(sevenDaysAgo.getDate() + i)
    sessionsPerDayMap.set(toDayKey(date), 0)
  }

  for (const row of sessionStarts) {
    const day = toDayKey(row.createdAt)
    sessionsPerDayMap.set(day, (sessionsPerDayMap.get(day) ?? 0) + 1)
  }

  return {
    activeSessions: activeSessionRows.length,
    averageSessionDurationMs,
    sessionsPerDay: Array.from(sessionsPerDayMap.entries()).map(([date, sessions]) => ({ date, sessions })),
  }
}

export async function getTrainingTimeAnalytics(slug: string): Promise<TrainingTimeAnalytics> {
  const prisma = getPrisma()
  if (!prisma) {
    return {
      slug,
      totalLearners: 0,
      completedLearners: 0,
      averageCompletionMs: 0,
      medianCompletionMs: 0,
      stdDevCompletionMs: 0,
      fastestCompletionMs: 0,
      slowestCompletionMs: 0,
      perSectionTime: [],
    }
  }

  const [interactionWindows, completedLearners, pageExits] = await Promise.all([
    prisma.interactionResponse.groupBy({
      by: ['userId'],
      where: { slug },
      _min: { submittedAt: true },
      _max: { updatedAt: true },
    }),
    prisma.trainingProgress.count({ where: { slug } }),
    prisma.learningEvent.findMany({
      where: { slug, eventType: 'page_exit' },
      select: { pageIndex: true, metadata: true },
    }),
  ])

  const completionDurations = interactionWindows
    .map((row) => {
      const firstInteraction = row._min.submittedAt
      const lastInteraction = row._max.updatedAt
      if (!firstInteraction || !lastInteraction) return null
      return Math.max(0, lastInteraction.getTime() - firstInteraction.getTime())
    })
    .filter((value): value is number => value !== null)

  const totalLearners = interactionWindows.length
  const averageCompletion = completionDurations.length === 0
    ? 0
    : completionDurations.reduce((sum, value) => sum + value, 0) / completionDurations.length
  const medianCompletion = median(completionDurations)
  const completionStdDev = stdDev(completionDurations, averageCompletion)

  const fastestCompletionMs = completionDurations.length === 0 ? 0 : Math.min(...completionDurations)
  const slowestCompletionMs = completionDurations.length === 0 ? 0 : Math.max(...completionDurations)

  const durationsByPage = new Map<number, number[]>()
  for (const row of pageExits) {
    if (typeof row.pageIndex !== 'number') continue
    const durationMs = getMetadataNumber(row.metadata, 'durationMs')
    if (durationMs === null) continue

    const current = durationsByPage.get(row.pageIndex) ?? []
    current.push(durationMs)
    durationsByPage.set(row.pageIndex, current)
  }

  const perSectionTime = Array.from(durationsByPage.entries())
    .map(([pageIndex, durations]) => {
      const averageDuration = durations.reduce((sum, value) => sum + value, 0) / durations.length
      const medianDuration = median(durations)
      return {
        pageIndex,
        averageDurationMs: Math.round(averageDuration),
        medianDurationMs: Math.round(medianDuration),
        stdDevDurationMs: Math.round(stdDev(durations, averageDuration)),
        samples: durations.length,
      }
    })
    .sort((a, b) => a.pageIndex - b.pageIndex)

  return {
    slug,
    totalLearners,
    completedLearners,
    averageCompletionMs: Math.round(averageCompletion),
    medianCompletionMs: Math.round(medianCompletion),
    stdDevCompletionMs: Math.round(completionStdDev),
    fastestCompletionMs,
    slowestCompletionMs,
    perSectionTime,
  }
}

export async function getLiveBirdEyeData(slug: string): Promise<BirdEyeStudentRow[]> {
  const prisma = getPrisma()
  if (!prisma) return []

  const activeSince = new Date(Date.now() - 10 * 60 * 1000)

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { responses: { some: { slug } } },
        { progress: { some: { slug } } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
  })

  if (users.length === 0) return []

  const userIds = users.map((user) => user.id)

  const [progressRows, pageViewRows, interactionRows, activeRows, interactionEventRows] = await Promise.all([
    prisma.trainingProgress.findMany({
      where: {
        slug,
        userId: { in: userIds },
      },
      select: {
        userId: true,
        pageIndex: true,
      },
    }),
    prisma.learningEvent.findMany({
      where: {
        slug,
        eventType: 'page_view',
        userId: { in: userIds },
        pageIndex: { not: null },
      },
      select: {
        userId: true,
        pageIndex: true,
      },
      distinct: ['userId', 'pageIndex'],
    }),
    prisma.interactionResponse.groupBy({
      by: ['userId'],
      where: {
        slug,
        userId: { in: userIds },
      },
      _min: { submittedAt: true },
      _max: { updatedAt: true },
    }),
    prisma.learningEvent.findMany({
      where: {
        slug,
        userId: { in: userIds },
        createdAt: { gte: activeSince },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    }),
    prisma.learningEvent.findMany({
      where: {
        slug,
        userId: { in: userIds },
        pageIndex: { not: null },
        eventType: {
          in: [
            'temperature_check',
            'free_response',
            'multiple_choice',
            'scale_rating',
            'checklist_toggle',
            'submission',
            'reveal_toggle',
          ],
        },
      },
      select: {
        userId: true,
        pageIndex: true,
      },
      distinct: ['userId', 'pageIndex'],
    }),
  ])

  const responseComponentRows = await prisma.interactionResponse.findMany({
    where: {
      slug,
      userId: { in: userIds },
    },
    select: {
      userId: true,
      componentId: true,
    },
    distinct: ['userId', 'componentId'],
  })

  const progressByUser = new Map(progressRows.map((row) => [row.userId, row.pageIndex]))
  const interactionByUser = new Map(
    interactionRows.map((row) => [
      row.userId,
      {
        firstInteraction: row._min.submittedAt ?? null,
        lastInteraction: row._max.updatedAt ?? null,
      },
    ])
  )
  const activeUserIds = new Set(activeRows.map((row) => row.userId).filter((userId): userId is string => Boolean(userId)))

  const visitedByUser = new Map<string, Set<number>>()
  for (const row of pageViewRows) {
    if (!row.userId || row.pageIndex === null) continue
    const current = visitedByUser.get(row.userId) ?? new Set<number>()
    current.add(row.pageIndex)
    visitedByUser.set(row.userId, current)
  }

  const responsePagesByUser = new Map<string, Set<number>>()
  for (const row of interactionEventRows) {
    if (!row.userId || row.pageIndex === null) continue
    const current = responsePagesByUser.get(row.userId) ?? new Set<number>()
    current.add(row.pageIndex)
    responsePagesByUser.set(row.userId, current)
  }

  const responseComponentIdsByUser = new Map<string, Set<string>>()
  for (const row of responseComponentRows) {
    const current = responseComponentIdsByUser.get(row.userId) ?? new Set<string>()
    current.add(row.componentId)
    responseComponentIdsByUser.set(row.userId, current)
  }

  return users
    .map((user) => {
      const interaction = interactionByUser.get(user.id)
      const visitedPages = Array.from(visitedByUser.get(user.id) ?? []).sort((a, b) => a - b)
      const responsePages = Array.from(responsePagesByUser.get(user.id) ?? []).sort((a, b) => a - b)
      const responseComponentIds = Array.from(responseComponentIdsByUser.get(user.id) ?? []).sort((a, b) => a.localeCompare(b))

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        lastPageIndex: progressByUser.get(user.id) ?? 0,
        visitedPages,
        responsePages,
        responseComponentIds,
        firstInteraction: interaction?.firstInteraction ?? null,
        lastInteraction: interaction?.lastInteraction ?? null,
        isActive: activeUserIds.has(user.id),
      }
    })
    .sort((a, b) => {
      const aTime = a.lastInteraction?.getTime() ?? a.firstInteraction?.getTime() ?? 0
      const bTime = b.lastInteraction?.getTime() ?? b.firstInteraction?.getTime() ?? 0
      return bTime - aTime || a.email.localeCompare(b.email)
    })
}

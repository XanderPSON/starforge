'use client'

import { useSearchParams } from 'next/navigation'

/**
 * Returns the current page index from the `?page=` query parameter.
 * Falls back to 0 if missing or unparseable.
 * Must be called from a client component inside a <Suspense> boundary.
 */
export function usePageIndex(): number {
  const searchParams = useSearchParams()
  const raw = searchParams.get('page')
  if (raw === null) return 0
  const parsed = Number.parseInt(raw, 10)
  return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0)
}

export const LEARNING_EVENT_TYPES = {
  // Navigation & session
  PAGE_VIEW: 'page_view',
  PAGE_EXIT: 'page_exit',
  NAV_CLICK: 'nav_click',
  SESSION_START: 'session_start',
  SESSION_HEARTBEAT: 'session_heartbeat',
  // Interactive component interactions
  TEMPERATURE_CHECK: 'temperature_check',
  FREE_RESPONSE: 'free_response',
  MULTIPLE_CHOICE: 'multiple_choice',
  SCALE_RATING: 'scale_rating',
  CHECKLIST_TOGGLE: 'checklist_toggle',
  SUBMISSION: 'submission',
  REVEAL_TOGGLE: 'reveal_toggle',
} as const

export type LearningEventType = typeof LEARNING_EVENT_TYPES[keyof typeof LEARNING_EVENT_TYPES]

export interface TrackEventPayload {
  slug: string
  pageIndex?: number
  metadata?: Record<string, unknown>
  sessionId?: string
}

export interface LearningEventDetail {
  sessionId: string
  userId?: string
  slug: string
  pageIndex?: number
  eventType: LearningEventType
  metadata?: Record<string, unknown>
}

const PERSISTENT_ID_KEY = 'starforge:persistentId'
const SELF_ID_KEY = 'starforge:selfIdentity'

export function generateSessionId(): string {
  if (typeof window === 'undefined') return ''

  try {
    const existing = localStorage.getItem(PERSISTENT_ID_KEY)
    if (existing) return existing

    const persistentId = crypto.randomUUID()
    localStorage.setItem(PERSISTENT_ID_KEY, persistentId)
    return persistentId
  } catch {
    return crypto.randomUUID()
  }
}

export interface SelfIdentity {
  email: string
  name?: string
  userId?: string
}

export function getSelfIdentity(): SelfIdentity | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SELF_ID_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SelfIdentity
  } catch {
    return null
  }
}

export function setSelfIdentity(identity: SelfIdentity): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SELF_ID_KEY, JSON.stringify(identity))
  } catch {
  }
}

export function trackEvent(eventType: LearningEventType, payload: TrackEventPayload): void {
  if (typeof window === 'undefined') return

  const identity = getSelfIdentity()

  const detail: LearningEventDetail = {
    sessionId: payload.sessionId ?? generateSessionId(),
    userId: identity?.userId,
    slug: payload.slug,
    pageIndex: payload.pageIndex,
    eventType,
    metadata: payload.metadata,
  }

  window.dispatchEvent(new CustomEvent<LearningEventDetail>('starforge:trackEvent', { detail }))
}

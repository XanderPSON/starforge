'use client'

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
  slug: string
  pageIndex?: number
  eventType: LearningEventType
  metadata?: Record<string, unknown>
}

const SESSION_STORAGE_KEY = 'starforge:sessionId'

export function generateSessionId(): string {
  if (typeof window === 'undefined') return ''

  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existing) return existing

    const sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    return sessionId
  } catch {
    return crypto.randomUUID()
  }
}

export function trackEvent(eventType: LearningEventType, payload: TrackEventPayload): void {
  if (typeof window === 'undefined') return

  const detail: LearningEventDetail = {
    sessionId: payload.sessionId ?? generateSessionId(),
    slug: payload.slug,
    pageIndex: payload.pageIndex,
    eventType,
    metadata: payload.metadata,
  }

  window.dispatchEvent(new CustomEvent<LearningEventDetail>('starforge:trackEvent', { detail }))
}

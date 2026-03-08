'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { saveEvent } from '@/app/actions/track-event'
import { isDbEnabled } from '@/lib/features'
import {
  LEARNING_EVENT_TYPES,
  generateSessionId,
  type LearningEventDetail,
} from '@/lib/event-tracking'

type PageContext = {
  slug: string
  pageIndex?: number
}

type EventTrackingEvent = CustomEvent<LearningEventDetail>

function getPageContext(pathname: string, search: URLSearchParams): PageContext | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null

  const [root, slug] = parts
  if (!slug) return null

  if (root !== 'training' && root !== 'codelab') return null

  const rawPage = search.get('page')
  if (rawPage === null) {
    return { slug, pageIndex: 0 }
  }

  const parsedPage = Number.parseInt(rawPage, 10)
  return {
    slug,
    pageIndex: Number.isNaN(parsedPage) ? 0 : Math.max(parsedPage, 0),
  }
}

export function EventTrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const sessionIdRef = useRef<string | null>(null)
  const hasSentSessionStartRef = useRef(false)
  const currentPageRef = useRef<PageContext | null>(null)
  const pageVisibleStartRef = useRef<number | null>(null)
  const pageVisibleMsRef = useRef(0)

  useEffect(() => {
    if (!isDbEnabled()) return

    const handleTrackEvent = (event: Event) => {
      const detail = (event as EventTrackingEvent).detail
      if (!detail?.sessionId || !detail.slug || !detail.eventType) return

      saveEvent(
        detail.sessionId,
        detail.slug,
        detail.eventType,
        detail.pageIndex,
        detail.metadata
      ).catch((error: unknown) => {
        console.warn('Event tracking failed:', error)
      })
    }

    window.addEventListener('starforge:trackEvent', handleTrackEvent)
    return () => window.removeEventListener('starforge:trackEvent', handleTrackEvent)
  }, [])

  useEffect(() => {
    if (!isDbEnabled()) return

    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId()
    }

    const sessionId = sessionIdRef.current
    if (!sessionId) return

    const now = Date.now()
    const getVisibleDuration = () => {
      let total = pageVisibleMsRef.current
      if (pageVisibleStartRef.current !== null && document.visibilityState === 'visible') {
        total += Date.now() - pageVisibleStartRef.current
      }
      return total
    }

    const flushPageExit = (reason: string) => {
      if (!currentPageRef.current) return

      const visibleDurationMs = getVisibleDuration()
      void saveEvent(
        sessionId,
        currentPageRef.current.slug,
        LEARNING_EVENT_TYPES.PAGE_EXIT,
        currentPageRef.current.pageIndex,
        {
          durationMs: visibleDurationMs,
          durationSeconds: Math.round(visibleDurationMs / 1000),
          reason,
          pathname,
        }
      )
    }

    const search = typeof window === 'undefined'
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search)
    const currentContext = getPageContext(pathname, search)
    currentPageRef.current = currentContext
    pageVisibleMsRef.current = 0
    pageVisibleStartRef.current = document.visibilityState === 'visible' ? now : null

    if (currentContext) {
      if (!hasSentSessionStartRef.current) {
        hasSentSessionStartRef.current = true
        void saveEvent(
          sessionId,
          currentContext.slug,
          LEARNING_EVENT_TYPES.SESSION_START,
          currentContext.pageIndex,
          {
            pathname,
            referrer: document.referrer || null,
          }
        )
      }

      void saveEvent(
        sessionId,
        currentContext.slug,
        LEARNING_EVENT_TYPES.PAGE_VIEW,
        currentContext.pageIndex,
        {
          pathname,
          source: 'provider',
        }
      )
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (pageVisibleStartRef.current !== null) {
          pageVisibleMsRef.current += Date.now() - pageVisibleStartRef.current
          pageVisibleStartRef.current = null
        }
        return
      }

      if (pageVisibleStartRef.current === null) {
        pageVisibleStartRef.current = Date.now()
      }
    }

    const heartbeatId = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || !currentPageRef.current) return

      const visibleDurationMs = getVisibleDuration()
      void saveEvent(
        sessionId,
        currentPageRef.current.slug,
        LEARNING_EVENT_TYPES.SESSION_HEARTBEAT,
        currentPageRef.current.pageIndex,
        {
          pathname,
          visibleDurationMs,
        }
      )
    }, 5 * 60 * 1000)

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(heartbeatId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      flushPageExit('unmount')
    }
  }, [pathname])

  return <>{children}</>
}

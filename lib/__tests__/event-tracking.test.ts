import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LEARNING_EVENT_TYPES,
  generateSessionId,
  trackEvent,
  type LearningEventDetail,
} from '@/lib/event-tracking'

describe('event-tracking', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  describe('LEARNING_EVENT_TYPES', () => {
    it('contains all expected keys and values', () => {
      expect(LEARNING_EVENT_TYPES).toEqual({
        PAGE_VIEW: 'page_view',
        PAGE_EXIT: 'page_exit',
        NAV_CLICK: 'nav_click',
        SESSION_START: 'session_start',
        SESSION_HEARTBEAT: 'session_heartbeat',
        TEMPERATURE_CHECK: 'temperature_check',
        FREE_RESPONSE: 'free_response',
        MULTIPLE_CHOICE: 'multiple_choice',
        SCALE_RATING: 'scale_rating',
        CHECKLIST_TOGGLE: 'checklist_toggle',
        SUBMISSION: 'submission',
        REVEAL_TOGGLE: 'reveal_toggle',
      })
    })
  })

  describe('generateSessionId', () => {
    it('returns a string and caches it in sessionStorage', () => {
      const uuidSpy = vi.spyOn(crypto, 'randomUUID').mockReturnValue('session-uuid-1')

      const sessionId = generateSessionId()

      expect(typeof sessionId).toBe('string')
      expect(sessionId).toBe('session-uuid-1')
      expect(sessionStorage.getItem('starforge:sessionId')).toBe('session-uuid-1')
      expect(uuidSpy).toHaveBeenCalledTimes(1)
    })

    it('returns existing sessionId if already present', () => {
      sessionStorage.setItem('starforge:sessionId', 'existing-session')
      const uuidSpy = vi.spyOn(crypto, 'randomUUID')

      const sessionId = generateSessionId()

      expect(sessionId).toBe('existing-session')
      expect(uuidSpy).not.toHaveBeenCalled()
    })

    it('returns empty string when window is undefined', () => {
      vi.stubGlobal('window', undefined)

      const sessionId = generateSessionId()

      expect(sessionId).toBe('')
      vi.unstubAllGlobals()
    })

    it('handles sessionStorage errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage blocked')
      })
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('fallback-session')

      const sessionId = generateSessionId()

      expect(sessionId).toBe('fallback-session')
    })
  })

  describe('trackEvent', () => {
    it('dispatches starforge:trackEvent with provided sessionId and detail shape', () => {
      let receivedDetail: LearningEventDetail | null = null
      const handler = (event: Event) => {
        receivedDetail = (event as CustomEvent<LearningEventDetail>).detail
      }

      window.addEventListener('starforge:trackEvent', handler)

      trackEvent(LEARNING_EVENT_TYPES.PAGE_VIEW, {
        slug: 'intro-to-ai',
        pageIndex: 2,
        metadata: { source: 'nav' },
        sessionId: 'provided-session-id',
      })

      expect(receivedDetail).toEqual({
        sessionId: 'provided-session-id',
        slug: 'intro-to-ai',
        pageIndex: 2,
        eventType: LEARNING_EVENT_TYPES.PAGE_VIEW,
        metadata: { source: 'nav' },
      })

      window.removeEventListener('starforge:trackEvent', handler)
    })

    it('generates sessionId when one is not provided', () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('generated-session-id')
      let receivedDetail: LearningEventDetail | null = null

      const handler = (event: Event) => {
        receivedDetail = (event as CustomEvent<LearningEventDetail>).detail
      }

      window.addEventListener('starforge:trackEvent', handler)

      trackEvent(LEARNING_EVENT_TYPES.SUBMISSION, {
        slug: 'grpc-basics',
        metadata: { score: 100 },
      })

      expect(receivedDetail).toEqual({
        sessionId: 'generated-session-id',
        slug: 'grpc-basics',
        pageIndex: undefined,
        eventType: LEARNING_EVENT_TYPES.SUBMISSION,
        metadata: { score: 100 },
      })
      expect(sessionStorage.getItem('starforge:sessionId')).toBe('generated-session-id')

      window.removeEventListener('starforge:trackEvent', handler)
    })

    it('handles server-side environments gracefully when window is undefined', () => {
      vi.stubGlobal('window', undefined)

      expect(() => {
        trackEvent(LEARNING_EVENT_TYPES.PAGE_EXIT, { slug: 'server-rendered-page' })
      }).not.toThrow()

      vi.unstubAllGlobals()
    })
  })
})

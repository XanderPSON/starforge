import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
  ComponentRegistryProvider: ({ children }: { children: ReactNode }) => children,
}))

import {
  checkSize,
  getStorageKey,
  isChecklistValue,
  isFreeResponseValue,
  isMultipleChoiceValue,
  isScaleValue,
  isTemperatureValue,
  safeGetItem,
  safeSetItem,
} from '@/lib/storage'

describe('storage utilities', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', window.sessionStorage)

    if (typeof localStorage.clear === 'function') {
      localStorage.clear()
    } else {
      Object.keys(localStorage).forEach((key) => {
        if (typeof localStorage.removeItem === 'function') {
          localStorage.removeItem(key)
        }
      })
    }
  })

  describe('getStorageKey', () => {
    it('returns codelab-scoped storage key', () => {
      expect(getStorageKey('intro-to-ai', 'q1')).toBe('codelab:intro-to-ai:q1')
    })
  })

  describe('checkSize', () => {
    it('returns ok true with size for small values', () => {
      const result = checkSize({ answer: 'short' })

      expect(result.ok).toBe(true)
      expect(result.size).toBeGreaterThan(0)
    })

    it('returns ok false for values greater than 50KB', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const largeValue = { data: 'x'.repeat(60 * 1024) }

      const result = checkSize(largeValue)

      expect(result.ok).toBe(false)
      expect(result.size).toBeGreaterThan(50 * 1024)
      expect(errorSpy).toHaveBeenCalled()
    })

    it('logs a warning when value exceeds 80% of capacity', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      const nearLimitValue = { data: 'x'.repeat(42 * 1024) }

      const result = checkSize(nearLimitValue)

      expect(result.ok).toBe(true)
      expect(result.size).toBeGreaterThan(50 * 1024 * 0.8)
      expect(warnSpy).toHaveBeenCalled()
    })
  })

  describe('safeGetItem', () => {
    it('returns parsed value from localStorage', () => {
      localStorage.setItem(
        'test:key',
        JSON.stringify({
          id: 'test:key',
          value: { selected: 'A' },
          updatedAt: Date.now(),
          version: '1.0',
        }),
      )

      const value = safeGetItem<{ selected: string }>('test:key')
      expect(value).toEqual({ selected: 'A' })
    })

    it('returns null for missing keys', () => {
      expect(safeGetItem('missing:key')).toBeNull()
    })

    it('returns null for corrupt JSON', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      localStorage.setItem('bad:key', '{invalid-json')

      expect(safeGetItem('bad:key')).toBeNull()
      expect(warnSpy).toHaveBeenCalled()
    })

    it('extracts value from InteractiveState shape', () => {
      localStorage.setItem(
        'state:key',
        JSON.stringify({
          id: 'state:key',
          value: 'stored-text',
          updatedAt: 123,
          version: '1.0',
        }),
      )

      expect(safeGetItem<string>('state:key')).toBe('stored-text')
    })
  })

  describe('safeSetItem', () => {
    it('stores wrapped InteractiveState and returns true on success', () => {
      const result = safeSetItem('answer:key', { checked: true })

      expect(result).toBe(true)

      const raw = localStorage.getItem('answer:key')
      expect(raw).not.toBeNull()

      const parsed = JSON.parse(raw as string) as {
        id: string
        value: { checked: boolean }
        updatedAt: number
        version: string
      }

      expect(parsed.id).toBe('answer:key')
      expect(parsed.value).toEqual({ checked: true })
      expect(parsed.version).toBe('1.0')
      expect(typeof parsed.updatedAt).toBe('number')
    })

    it('returns false when size check fails', () => {
      const result = safeSetItem('big:key', 'x'.repeat(60 * 1024))
      expect(result).toBe(false)
      expect(localStorage.getItem('big:key')).toBeNull()
    })

    it('dispatches codelab:saved and starforge:dbSync events', () => {
      const savedHandler = vi.fn()
      const dbSyncHandler = vi.fn()

      window.addEventListener('codelab:saved', savedHandler)
      window.addEventListener('starforge:dbSync', dbSyncHandler)

      const result = safeSetItem('events:key', { answer: 'yes' })

      expect(result).toBe(true)
      expect(savedHandler).toHaveBeenCalledTimes(1)
      expect(dbSyncHandler).toHaveBeenCalledTimes(1)

      const savedEvent = savedHandler.mock.calls[0][0] as CustomEvent<{ key: string }>
      const syncEvent = dbSyncHandler.mock.calls[0][0] as CustomEvent<{ key: string; value: unknown }>

      expect(savedEvent.detail).toEqual({ key: 'events:key' })
      expect(syncEvent.detail).toEqual({ key: 'events:key', value: { answer: 'yes' } })

      window.removeEventListener('codelab:saved', savedHandler)
      window.removeEventListener('starforge:dbSync', dbSyncHandler)
    })

    it('returns false on QuotaExceededError', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const realStorage = localStorage

      vi.stubGlobal('localStorage', {
        getItem: realStorage.getItem.bind(realStorage),
        setItem: () => {
          throw new DOMException('Quota exceeded', 'QuotaExceededError')
        },
        removeItem: realStorage.removeItem.bind(realStorage),
        clear: realStorage.clear.bind(realStorage),
        key: realStorage.key.bind(realStorage),
        length: realStorage.length,
      })

      const result = safeSetItem('quota:key', { value: 'small' })

      expect(result).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith('localStorage quota exceeded')
    })
  })

  describe('type guards', () => {
    it('isFreeResponseValue validates string values', () => {
      expect(isFreeResponseValue('response')).toBe(true)
      expect(isFreeResponseValue(123)).toBe(false)
    })

    it('isMultipleChoiceValue validates string or null', () => {
      expect(isMultipleChoiceValue('choice-a')).toBe(true)
      expect(isMultipleChoiceValue(null)).toBe(true)
      expect(isMultipleChoiceValue(42)).toBe(false)
    })

    it('isTemperatureValue validates range 1-5 or null', () => {
      expect(isTemperatureValue(1)).toBe(true)
      expect(isTemperatureValue(5)).toBe(true)
      expect(isTemperatureValue(null)).toBe(true)
      expect(isTemperatureValue(0)).toBe(false)
      expect(isTemperatureValue(6)).toBe(false)
      expect(isTemperatureValue('3')).toBe(false)
    })

    it('isScaleValue validates range 1-max or null', () => {
      expect(isScaleValue(1, 10)).toBe(true)
      expect(isScaleValue(10, 10)).toBe(true)
      expect(isScaleValue(null, 10)).toBe(true)
      expect(isScaleValue(0, 10)).toBe(false)
      expect(isScaleValue(11, 10)).toBe(false)
      expect(isScaleValue('4', 10)).toBe(false)
    })

    it('isChecklistValue validates boolean arrays only', () => {
      expect(isChecklistValue([true, false, true])).toBe(true)
      expect(isChecklistValue([])).toBe(true)
      expect(isChecklistValue([true, 'false'])).toBe(false)
      expect(isChecklistValue('not-an-array')).toBe(false)
    })
  })
})

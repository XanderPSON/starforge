'use client'

import { useState, useEffect, useRef } from 'react'
import { useComponentRegistry } from '@/components/ComponentRegistryProvider'

// Re-export for convenience
export { ComponentRegistryProvider } from '@/components/ComponentRegistryProvider'

// ============================================================================
// Constants
// ============================================================================

const MAX_STATE_SIZE_BYTES = 50 * 1024 // 50KB
const AUTO_SAVE_DEBOUNCE_MS = 500
const STORAGE_VERSION = '1.0'

// ============================================================================
// Type Definitions
// ============================================================================

interface InteractiveState<T> {
  id: string
  value: T
  updatedAt: number
  version: string
}

interface SizeCheckResult {
  ok: boolean
  size: number
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate storage key with codelab scoping
 */
export function getStorageKey(slug: string, id: string): string {
  return `codelab:${slug}:${id}`
}

/**
 * Check if value size is within 50KB limit
 */
export function checkSize(value: unknown): SizeCheckResult {
  const json = JSON.stringify(value)
  const size = new Blob([json]).size

  if (size > MAX_STATE_SIZE_BYTES) {
    console.error(`Value exceeds 50KB limit: ${size} bytes`)
    return { ok: false, size }
  }

  if (size > MAX_STATE_SIZE_BYTES * 0.8) {
    console.warn(`Value approaching 50KB limit: ${size} bytes (${Math.round(size / MAX_STATE_SIZE_BYTES * 100)}%)`)
  }

  return { ok: true, size }
}

/**
 * Safely get item from localStorage with error handling
 */
export function safeGetItem<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    return parsed.value as T
  } catch (error) {
    console.warn(`Failed to load state for key "${key}":`, error)
    return null
  }
}

/**
 * Safely set item to localStorage with error handling and quota checking
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  try {
    const state: InteractiveState<T> = {
      id: key,
      value,
      updatedAt: Date.now(),
      version: STORAGE_VERSION
    }

    // Check size before saving
    const sizeCheck = checkSize(state)
    if (!sizeCheck.ok) {
      return false
    }

    localStorage.setItem(key, JSON.stringify(state))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('codelab:saved', { detail: { key } }))
    }
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded')
    } else {
      console.error(`Failed to save state for key "${key}":`, error)
    }
    return false
  }
}

// ============================================================================
// Type Guards
// ============================================================================

export function isFreeResponseValue(value: unknown): value is string {
  return typeof value === 'string'
}

export function isMultipleChoiceValue(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

export function isTemperatureValue(value: unknown): value is number | null {
  return (typeof value === 'number' && value >= 1 && value <= 5) || value === null
}

export function isScaleValue(value: unknown, max: number): value is number | null {
  return (typeof value === 'number' && value >= 1 && value <= max) || value === null
}

export function isChecklistValue(value: unknown): value is boolean[] {
  return Array.isArray(value) && value.every(item => typeof item === 'boolean')
}

// ============================================================================
// useInteractive Hook
// ============================================================================

/**
 * Unified hook for interactive component state management
 *
 * Features:
 * - Client-only hydration (prevents SSR mismatch)
 * - Debounced auto-save (500ms)
 * - Cross-tab synchronization
 * - Error handling (corrupted data, quota exceeded, storage disabled)
 * - Duplicate ID detection
 * - 50KB size limit enforcement
 *
 * @param id - Unique identifier for the component within the codelab
 * @param defaultValue - Initial value used when no saved state exists
 * @returns Tuple of [value, setValue, isSaved]
 */
export function useInteractive<T>(
  id: string,
  defaultValue: T
): [T | undefined, (value: T) => void, boolean] {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [isSaved, setIsSaved] = useState(true)
  const registry = useComponentRegistry()

  // Store initial default value in ref to avoid re-hydration on defaultValue changes
  const initialDefaultValue = useRef(defaultValue)

  // Detect duplicate IDs
  useEffect(() => {
    if (registry.activeIds.has(id)) {
      console.error(`Duplicate component ID detected: "${id}". Each component must have a unique ID within the codelab.`)
      throw new Error(`Component ID "${id}" is already in use`)
    }
    registry.activeIds.add(id)

    return () => {
      registry.activeIds.delete(id)
    }
  }, [id, registry])

  // Client-only hydration (prevents SSR mismatch)
  // Only runs once on mount, using the initial default value
  useEffect(() => {
    const stored = safeGetItem<T>(id)
    setValue(stored !== null ? stored : initialDefaultValue.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Debounced save to localStorage
  useEffect(() => {
    if (value === undefined) return // Skip during hydration

    setIsSaved(false)

    const timeout = setTimeout(() => {
      const success = safeSetItem(id, value)
      setIsSaved(success)
    }, AUTO_SAVE_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [id, value])

  // Cross-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === id && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setValue(parsed.value as T)
        } catch (error) {
          console.warn(`Failed to sync state for key "${id}" from other tab:`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [id])

  return [value, setValue, isSaved]
}

// ============================================================================
// Legacy Hook (kept for backward compatibility)
// ============================================================================

/**
 * Custom hook for localStorage with debounced auto-save
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @param debounceMs - Debounce delay in milliseconds (default: 500ms)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored) as T)
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  // Debounced save to localStorage
  useEffect(() => {
    if (isLoading) return // Don't save during initial load

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error)
      }
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [key, value, debounceMs, isLoading])

  return [value, setValue]
}

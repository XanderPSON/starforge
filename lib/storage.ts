'use client'

import { useState, useEffect } from 'react'

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

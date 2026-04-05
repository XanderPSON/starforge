'use client'

import { useEffect, useRef } from 'react'
import { activateAdminMode } from '@/lib/admin-access'

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
  'Enter',
]

export function KonamiListener() {
  const bufferRef = useRef<string[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const buffer = bufferRef.current
      buffer.push(e.key)

      if (buffer.length > KONAMI_SEQUENCE.length) {
        buffer.shift()
      }

      if (
        buffer.length === KONAMI_SEQUENCE.length &&
        buffer.every((key, i) => key === KONAMI_SEQUENCE[i])
      ) {
        activateAdminMode()
        bufferRef.current = []
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}

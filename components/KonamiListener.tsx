'use client'

import { useEffect, useRef } from 'react'
import { toggleAdminMode } from '@/lib/admin-access'

const CHEAT_SEQUENCES: string[][] = [
  // Konami code
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
   'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
   'b', 'a', 'Enter'],
  // Type "debug" + Enter
  ['d', 'e', 'b', 'u', 'g', 'Enter'],
  // Type "admin" + Enter
  ['a', 'd', 'm', 'i', 'n', 'Enter'],
]

const MAX_BUFFER = Math.max(...CHEAT_SEQUENCES.map(s => s.length))

export function KonamiListener() {
  const bufferRef = useRef<string[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const buffer = bufferRef.current
      buffer.push(e.key)

      if (buffer.length > MAX_BUFFER) {
        buffer.shift()
      }

      for (const seq of CHEAT_SEQUENCES) {
        if (buffer.length >= seq.length) {
          const tail = buffer.slice(-seq.length)
          if (tail.every((key, i) => key === seq[i])) {
            toggleAdminMode()
            bufferRef.current = []
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}

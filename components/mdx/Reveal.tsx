'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { safeGetItem, getStorageKey } from '@/lib/storage'
import type { ReactNode } from 'react'

interface RevealProps {
  requiredId: string
  children: ReactNode
}

function checkIsAnswered(slug: string, requiredId: string): boolean {
  const key = getStorageKey(slug, requiredId)
  const rawValue = safeGetItem(key)
  if (rawValue === null) return false
  if (typeof rawValue === 'string') return rawValue.trim().length > 0
  if (typeof rawValue === 'object' && rawValue !== null) {
    return (rawValue as { isSubmitted?: boolean }).isSubmitted === true
  }
  return false
}

export function Reveal({ requiredId, children }: RevealProps) {
  const params = useParams()
  const slug = (params.slug as string) || 'default'
  const [revealed, setRevealed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    const answered = checkIsAnswered(slug, requiredId)
    if (answered) {
      setRevealed(true)
      setVisible(true)
    }

    const handler = (event: Event) => {
      const key = getStorageKey(slug, requiredId)
      const detail = (event as CustomEvent).detail as { key?: string } | undefined
      if (detail?.key === key) {
        const nowAnswered = checkIsAnswered(slug, requiredId)
        if (nowAnswered) {
          setRevealed(true)
          // Small delay so element mounts at opacity-0 before fading in
          requestAnimationFrame(() => setVisible(true))
        }
      }
    }

    window.addEventListener('codelab:saved', handler)
    return () => window.removeEventListener('codelab:saved', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, requiredId])

  // Prevent SSR mismatch — render nothing until hydrated
  if (!isHydrated || !revealed) return null

  return (
    <div
      className="transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {children}
    </div>
  )
}

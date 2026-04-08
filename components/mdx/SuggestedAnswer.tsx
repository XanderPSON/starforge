'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { trackEvent, LEARNING_EVENT_TYPES, usePageIndex } from '@/lib/event-tracking'
import type { ReactNode } from 'react'

interface SuggestedAnswerProps {
  id?: string
  children: ReactNode
  label?: string
}

export function SuggestedAnswer({ id, children, label = 'Suggested answer' }: SuggestedAnswerProps) {
  const params = useParams()
  const slug = (params.slug as string) || 'default'
  const pageIndex = usePageIndex()
  const [isRevealed, setIsRevealed] = useState(false)

  if (!children) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-300">
        ❌ SuggestedAnswer Error: Missing required prop: <code>children</code>
      </div>
    )
  }

  const handleToggle = () => {
    const newState = !isRevealed
    setIsRevealed(newState)
    trackEvent(LEARNING_EVENT_TYPES.REVEAL_TOGGLE, {
      slug,
      pageIndex,
      metadata: {
        componentId: id || 'suggested-answer',
        action: newState ? 'reveal' : 'hide',
        label,
      },
    })
  }

  return (
    <div className="my-8">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-hub-primary dark:text-coinbase-cyan border border-hub-primary/20 dark:border-coinbase-blue/30 rounded-lg bg-hub-surface-alt dark:bg-white/5 hover:bg-hub-primary/10 dark:hover:bg-coinbase-blue/10 transition-colors"
        aria-expanded={isRevealed}
        aria-label={isRevealed ? `Hide ${label}` : `Reveal ${label}`}
      >
        <span
          className="inline-block transition-transform duration-200"
          style={{ transform: isRevealed ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        {isRevealed ? `Hide ${label}` : `Reveal ${label}`}
      </button>

      {isRevealed && (
        <div className="mt-3 p-5 bg-hub-surface-alt dark:bg-white/5 rounded-xl border border-hub-primary/20 dark:border-coinbase-blue/30 text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none">
          {children}
        </div>
      )}
    </div>
  )
}

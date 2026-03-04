'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

interface SuggestedAnswerProps {
  children: ReactNode
  label?: string
}

export function SuggestedAnswer({ children, label = 'Suggested answer' }: SuggestedAnswerProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <div className="my-8">
      <button
        onClick={() => setIsRevealed((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-coinbase-cyan border border-coinbase-blue/30 rounded-lg glass-effect hover:bg-coinbase-blue/10 transition-colors"
        aria-expanded={isRevealed}
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
        <div className="mt-3 p-5 glass-effect rounded-xl border border-coinbase-blue/30 text-gray-300 prose prose-invert max-w-none">
          {children}
        </div>
      )}
    </div>
  )
}

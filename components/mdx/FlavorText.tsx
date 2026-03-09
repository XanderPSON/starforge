'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'


interface FlavorTextProps {
  id: string
  emoji?: string
  text: string
  className?: string
}

/**
 * A lightweight, fun checkpoint element inspired by MTG flavor text.
 * Single checkbox with an emoji and a witty one-liner that records
 * when the learner reached this point in the training.
 */
export function FlavorText({ id, emoji, text, className }: FlavorTextProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'

  if (!id || !text) {
    return (
      <div className="my-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        FlavorText Error: Missing required prop <code>{!id ? 'id' : 'text'}</code>
      </div>
    )
  }

  const storageKey = getStorageKey(slug, id)
  const [value, setValue] = useInteractive<{ checked: boolean; timestamp: number | null }>(
    storageKey,
    { checked: false, timestamp: null }
  )

  // Skeleton during hydration
  if (value === undefined) {
    return (
      <div className={cn('my-6', className)}>
        <div className="h-10 bg-gray-100 dark:bg-white/[0.03] rounded-lg animate-pulse" />
      </div>
    )
  }

  const handleToggle = () => {
    if (value.checked) {
      setValue({ checked: false, timestamp: null })
    } else {
      setValue({ checked: true, timestamp: Date.now() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className={cn('my-6 max-w-lg', className)}>
      <div
        role="checkbox"
        aria-checked={value.checked}
        aria-label={text}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'group inline-flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer',
          'border transition-all duration-200 select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-coinbase-blue dark:focus-visible:ring-offset-coinbase-dark',
          value.checked
            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-400/30 dark:bg-emerald-400/[0.06]'
            : cn(
                'border-gray-200 dark:border-white/10',
                'bg-gray-50/50 dark:bg-white/[0.02]',
                'hover:border-gray-300 hover:bg-gray-100/50',
                'dark:hover:border-white/20 dark:hover:bg-white/[0.04]',
              ),
        )}
      >
        {/* Checkbox indicator */}
        <div
          className={cn(
            'flex-shrink-0 w-4.5 h-4.5 rounded border-2 transition-all duration-200',
            'flex items-center justify-center',
            value.checked
              ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400'
              : cn(
                  'border-gray-300 dark:border-white/30',
                  'group-hover:border-gray-400 dark:group-hover:border-white/40',
                ),
          )}
        >
          {value.checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Emoji */}
        {emoji && (
          <span className="flex-shrink-0 text-base" aria-hidden="true">
            {emoji}
          </span>
        )}

        {/* Text */}
        <span
          className={cn(
            'flex-1 text-sm italic transition-colors duration-200',
            value.checked
              ? 'text-emerald-700 dark:text-emerald-300/80'
              : 'text-gray-500 dark:text-gray-400',
          )}
        >
          {text}
        </span>

      </div>
    </div>
  )
}

'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { trackEvent, LEARNING_EVENT_TYPES } from '@/lib/event-tracking'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ScaleProps {
  id: string
  max?: number
  label?: string
  className?: string
}

export function Scale({ id, max = 5, label, className }: ScaleProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'

  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ Scale Error: Missing required prop <code>id</code>
      </div>
    )
  }

  const storageKey = getStorageKey(slug, id)
  const [value, setValue] = useInteractive<number | null>(storageKey, null)

  if (value === undefined) {
    return (
      <div className={cn('my-8', className)}>
        {label && <div className="mb-3 h-5 bg-gray-200 dark:bg-white/10 rounded w-1/3 animate-pulse" />}
        <div className="flex gap-1">
          {Array.from({ length: max }).map((_, i) => (
            <div key={i} className="flex-1 h-10 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const handleSelect = (rating: number) => {
    setValue(rating)
    trackEvent(LEARNING_EVENT_TYPES.SCALE_RATING, {
      slug,
      metadata: {
        componentId: id,
        value: rating,
        max,
        label: label || null,
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(rating)
    }
  }

  return (
    <div className={cn('my-8', className)}>
      {label && (
        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
      )}
      <div
        role="group"
        aria-label={label || `Rate from 1 to ${max}`}
        className="flex gap-1"
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => {
          const isFilled = value !== null && rating <= value
          const isCurrent = value === rating

          return (
            <button
              key={rating}
              onClick={() => handleSelect(rating)}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              aria-label={`Rate ${rating} out of ${max}`}
              aria-current={isCurrent || undefined}
              className={cn(
                'flex-1 h-10 flex items-center justify-center',
                'text-sm font-medium font-mono',
                'border transition-all duration-100',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-coinbase-blue focus-visible:z-10',
                'first:rounded-l-lg last:rounded-r-lg',
                isFilled
                  ? cn(
                      'bg-coinbase-blue/30 border-coinbase-blue text-white',
                      isCurrent && 'bg-coinbase-blue/50 font-bold'
                    )
                  : 'bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/15 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-white/30'
              )}
            >
              {rating}
            </button>
          )
        })}
      </div>
      {value !== null && (
        <p className="mt-2 text-center text-xs text-gray-400">
          {value} / {max}
        </p>
      )}
    </div>
  )
}

'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { trackEvent, LEARNING_EVENT_TYPES } from '@/lib/event-tracking'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ScaleProps {
  id: string
  max?: number
  label?: string
  lowLabel?: string
  highLabel?: string
  className?: string
}

export function Scale({ id, max = 5, label, lowLabel, highLabel, className }: ScaleProps) {
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
      <div className={cn('my-8 max-w-md', className)}>
        {label && <div className="mb-3 h-5 bg-gray-200 dark:bg-white/10 rounded w-2/3 animate-pulse" />}
        <div className="h-10 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
      </div>
    )
  }

  const effectiveLow = lowLabel ?? (max === 5 ? 'Not at all' : '1')
  const effectiveHigh = highLabel ?? (max === 5 ? 'Very much' : String(max))
  const options = Array.from({ length: max }, (_, i) => i + 1)

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
    <div className={cn('my-8 max-w-md', className)}>
      {label && (
        <p className="mb-4 text-base font-medium text-gray-700 dark:text-gray-200">{label}</p>
      )}

      <div role="group" aria-label={label || `Rate from 1 to ${max}`}>
        <div className="flex items-center justify-between gap-1">
          {options.map((n) => {
            const isSelected = value === n
            return (
              <button
                key={n}
                type="button"
                role="button"
                aria-label={`Rate ${n} out of ${max}`}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => handleSelect(n)}
                onKeyDown={(e) => handleKeyDown(e, n)}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                  isSelected
                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/25'
                    : 'border-gray-300 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 bg-transparent',
                )}
              >
                {n}
              </button>
            )
          })}
        </div>

        <div className="flex justify-between mt-2 px-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">{effectiveLow}</span>
          {value !== null && (
            <span className="text-xs font-semibold text-blue-400 tabular-nums">{value} / {max}</span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">{effectiveHigh}</span>
        </div>
      </div>
    </div>
  )
}

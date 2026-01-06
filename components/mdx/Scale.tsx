'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
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

  // Validate required props
  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ Scale Error: Missing required prop <code>id</code>
      </div>
    )
  }

  // Use useInteractive hook with codelab-scoped key
  const storageKey = getStorageKey(slug, id)
  const [value, setValue, isSaved] = useInteractive<number | null>(storageKey, null)

  // Show skeleton during hydration
  if (value === undefined) {
    return (
      <div className={cn('my-8', className)}>
        {label && <div className="mb-3 h-5 bg-white/10 rounded w-1/3 animate-pulse" />}
        <div className="flex justify-center gap-2">
          {Array.from({ length: max }).map((_, i) => (
            <div key={i} className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const handleSelect = (rating: number) => {
    setValue(rating)
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
        <p className="mb-3 text-sm font-medium text-gray-200">{label}</p>
      )}
      <div
        role="group"
        aria-label={label || `Rate from 1 to ${max}`}
        className="flex justify-center gap-2"
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => {
          const isHighlighted = value !== null && rating <= value
          const isCurrent = value === rating

          return (
            <button
              key={rating}
              onClick={() => handleSelect(rating)}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              aria-label={`Rate ${rating} out of ${max}`}
              aria-current={isCurrent || undefined}
              className={cn(
                'w-10 h-10 rounded-full border-2 transition-all duration-100',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                isHighlighted
                  ? 'bg-blue-500/30 border-blue-500 scale-105'
                  : 'bg-white/5 border-white/20'
              )}
            >
              <span className="sr-only">{rating}</span>
            </button>
          )
        })}
      </div>
      {value !== null && (
        <p className="mt-3 text-center text-sm text-gray-400">
          {value} / {max}
        </p>
      )}
    </div>
  )
}

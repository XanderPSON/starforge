'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TemperatureCheckProps {
  id: string
  className?: string
}

const TEMPERATURE_LABELS = {
  1: { emoji: '😕', label: 'Confused' },
  2: { emoji: '🤔', label: 'Thinking' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '😊', label: 'Happy' },
  5: { emoji: '🤩', label: 'Starstruck' },
} as const

type TemperatureValue = 1 | 2 | 3 | 4 | 5

export function TemperatureCheck({ id, className }: TemperatureCheckProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'

  // Validate required props
  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ TemperatureCheck Error: Missing required prop <code>id</code>
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
        <div className="flex justify-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-16 h-16 bg-white/5 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const handleSelect = (temp: TemperatureValue) => {
    setValue(temp)
  }

  const handleKeyDown = (e: React.KeyboardEvent, temp: TemperatureValue) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(temp)
    }
  }

  return (
    <div className={cn('my-8', className)}>
      <div
        role="group"
        aria-label="How do you feel about this content?"
        className="flex justify-center gap-4"
      >
        {(Object.keys(TEMPERATURE_LABELS) as unknown as TemperatureValue[]).map((temp) => {
          const { emoji, label } = TEMPERATURE_LABELS[temp]
          const isSelected = value === temp

          return (
            <button
              key={temp}
              onClick={() => handleSelect(temp)}
              onKeyDown={(e) => handleKeyDown(e, temp)}
              aria-label={label}
              aria-pressed={isSelected}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300',
                'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                isSelected && 'bg-blue-500/10'
              )}
            >
              <span
                className={cn(
                  'text-4xl transition-transform duration-300',
                  isSelected && 'scale-125'
                )}
                aria-hidden="true"
              >
                {emoji}
              </span>
              <span className="text-xs text-gray-400">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

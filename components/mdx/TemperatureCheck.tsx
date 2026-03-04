'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TemperatureCheckProps {
  id: string
  className?: string
}

const TEMPERATURE_OPTIONS = [
  {
    value: 1 as const,
    label: 'Confused',
    color: 'text-red-400',
    ringColor: 'ring-red-400',
    // Distressed face: furrowed brows, frown
    face: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
        {/* Furrowed left brow */}
        <path d="M13 16 Q17 13 19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Furrowed right brow */}
        <path d="M29 16 Q31 13 35 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Left eye */}
        <circle cx="17" cy="21" r="2" fill="currentColor" />
        {/* Right eye */}
        <circle cx="31" cy="21" r="2" fill="currentColor" />
        {/* Frown */}
        <path d="M16 33 Q24 27 32 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    value: 2 as const,
    label: 'Skeptical',
    color: 'text-orange-400',
    ringColor: 'ring-orange-400',
    // Skeptical face: one raised brow, flat mouth
    face: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
        {/* Raised left brow */}
        <path d="M13 15 Q17 11 21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Flat right brow */}
        <path d="M27 17 Q31 17 35 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Left eye */}
        <circle cx="17" cy="21" r="2" fill="currentColor" />
        {/* Right eye */}
        <circle cx="31" cy="21" r="2" fill="currentColor" />
        {/* Flat mouth, slightly angled */}
        <path d="M16 32 Q24 30 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    value: 3 as const,
    label: 'Neutral',
    color: 'text-yellow-400',
    ringColor: 'ring-yellow-400',
    // Neutral face: level brows, straight mouth
    face: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
        {/* Left brow */}
        <path d="M13 16 Q17 15 21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right brow */}
        <path d="M27 16 Q31 15 35 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Left eye */}
        <circle cx="17" cy="21" r="2" fill="currentColor" />
        {/* Right eye */}
        <circle cx="31" cy="21" r="2" fill="currentColor" />
        {/* Straight mouth */}
        <path d="M16 31 L32 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 4 as const,
    label: 'Content',
    color: 'text-lime-400',
    ringColor: 'ring-lime-400',
    // Content face: soft smile
    face: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
        {/* Left brow */}
        <path d="M13 16 Q17 15 21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right brow */}
        <path d="M27 16 Q31 15 35 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Left eye */}
        <circle cx="17" cy="21" r="2" fill="currentColor" />
        {/* Right eye */}
        <circle cx="31" cy="21" r="2" fill="currentColor" />
        {/* Gentle smile */}
        <path d="M16 29 Q24 35 32 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    value: 5 as const,
    label: 'Delighted',
    color: 'text-emerald-400',
    ringColor: 'ring-emerald-400',
    // Delighted face: raised brows, big smile, rosy cheeks
    face: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
        {/* Left brow raised */}
        <path d="M12 14 Q17 10 21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right brow raised */}
        <path d="M27 14 Q31 10 36 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Left eye (arc = squinting with joy) */}
        <path d="M15 21 Q17 18 19 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right eye */}
        <path d="M29 21 Q31 18 33 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Big smile */}
        <path d="M14 28 Q24 38 34 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Left cheek blush */}
        <ellipse cx="12" cy="30" rx="3" ry="2" fill="currentColor" opacity="0.25" />
        {/* Right cheek blush */}
        <ellipse cx="36" cy="30" rx="3" ry="2" fill="currentColor" opacity="0.25" />
      </svg>
    ),
  },
]

type TemperatureValue = 1 | 2 | 3 | 4 | 5

export function TemperatureCheck({ id, className }: TemperatureCheckProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'

  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ TemperatureCheck Error: Missing required prop <code>id</code>
      </div>
    )
  }

  const storageKey = getStorageKey(slug, id)
  const [value, setValue] = useInteractive<number | null>(storageKey, null)

  if (value === undefined) {
    return (
      <div className={cn('my-8', className)}>
        <div className="flex justify-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-14 h-14 bg-white/5 rounded-full animate-pulse" />
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
        className="flex justify-center gap-3"
      >
        {TEMPERATURE_OPTIONS.map(({ value: temp, label, color, ringColor, face }) => {
          const isSelected = value === temp

          return (
            <button
              key={temp}
              onClick={() => handleSelect(temp)}
              onKeyDown={(e) => handleKeyDown(e, temp)}
              aria-label={label}
              aria-pressed={isSelected}
              className={cn(
                'flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200',
                'hover:bg-white/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-coinbase-blue',
                isSelected && 'bg-white/5'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full transition-all duration-200',
                  color,
                  isSelected
                    ? cn('ring-2 ring-offset-2 ring-offset-coinbase-dark scale-110', ringColor)
                    : 'opacity-50 hover:opacity-80'
                )}
              >
                {face}
              </div>
              <span className={cn(
                'text-xs transition-colors duration-200',
                isSelected ? color : 'text-gray-500'
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { trackEvent, LEARNING_EVENT_TYPES } from '@/lib/event-tracking'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Frown,
  Annoyed,
  Meh,
  Smile,
  Laugh,
  ThermometerSun,
  type LucideIcon,
} from 'lucide-react'

interface TemperatureCheckProps {
  id: string
  label?: string
  className?: string
}

const TEMPERATURE_OPTIONS: {
  value: TemperatureValue
  label: string
  icon: LucideIcon
  color: string
  hoverColor: string
  hoverBg: string
  selectedBg: string
}[] = [
  {
    value: 1,
    label: 'Confused',
    icon: Frown,
    color: 'text-red-500 dark:text-red-400',
    hoverColor: 'hover:text-red-500 dark:hover:text-red-400',
    hoverBg: 'hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-400/15 dark:hover:border-red-400/40',
    selectedBg: 'bg-red-50 border-red-300 dark:bg-red-400/15 dark:border-red-400/50',
  },
  {
    value: 2,
    label: 'Skeptical',
    icon: Annoyed,
    color: 'text-orange-500 dark:text-orange-400',
    hoverColor: 'hover:text-orange-500 dark:hover:text-orange-400',
    hoverBg: 'hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-400/15 dark:hover:border-orange-400/40',
    selectedBg: 'bg-orange-50 border-orange-300 dark:bg-orange-400/15 dark:border-orange-400/50',
  },
  {
    value: 3,
    label: 'Neutral',
    icon: Meh,
    color: 'text-yellow-500 dark:text-yellow-400',
    hoverColor: 'hover:text-yellow-500 dark:hover:text-yellow-400',
    hoverBg: 'hover:bg-yellow-50 hover:border-yellow-200 dark:hover:bg-yellow-400/15 dark:hover:border-yellow-400/40',
    selectedBg: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-400/15 dark:border-yellow-400/50',
  },
  {
    value: 4,
    label: 'Content',
    icon: Smile,
    color: 'text-lime-500 dark:text-lime-400',
    hoverColor: 'hover:text-lime-500 dark:hover:text-lime-400',
    hoverBg: 'hover:bg-lime-50 hover:border-lime-200 dark:hover:bg-lime-400/15 dark:hover:border-lime-400/40',
    selectedBg: 'bg-lime-50 border-lime-300 dark:bg-lime-400/15 dark:border-lime-400/50',
  },
  {
    value: 5,
    label: 'Delighted',
    icon: Laugh,
    color: 'text-emerald-500 dark:text-emerald-400',
    hoverColor: 'hover:text-emerald-500 dark:hover:text-emerald-400',
    hoverBg: 'hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-400/15 dark:hover:border-emerald-400/40',
    selectedBg: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-400/15 dark:border-emerald-400/50',
  },
]

type TemperatureValue = 1 | 2 | 3 | 4 | 5

export function TemperatureCheck({ id, label, className }: TemperatureCheckProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'

  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        TemperatureCheck Error: Missing required prop <code>id</code>
      </div>
    )
  }

  const storageKey = getStorageKey(slug, id)
  const [value, setValue] = useInteractive<number | null>(storageKey, null)

  if (value === undefined) {
    return (
      <div className={cn('my-8', className)}>
        <div className="rounded-xl border-2 border-gray-200 dark:border-white/10 p-5">
          <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-5 animate-pulse" />
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 h-20 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleSelect = (temp: TemperatureValue) => {
    setValue(temp)
    const option = TEMPERATURE_OPTIONS.find((o) => o.value === temp)
    trackEvent(LEARNING_EVENT_TYPES.TEMPERATURE_CHECK, {
      slug,
      metadata: {
        componentId: id,
        value: temp,
        label: option?.label ?? String(temp),
        promptText: label || 'How are you feeling about this section?',
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent, temp: TemperatureValue) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(temp)
    }
  }

  const promptText = label || 'How are you feeling about this section?'

  return (
    <div className={cn('my-8 max-w-2xl', className)}>
      <div className={cn(
        'rounded-xl border-2 border-gray-200 dark:border-white/10',
        'bg-white dark:bg-coinbase-space/50',
        'p-5',
      )}>
        <div className="flex items-center gap-2.5 mb-5">
          <ThermometerSun className="w-4 h-4 text-hub-primary dark:text-coinbase-blue flex-shrink-0" />
          <span className="text-sm font-semibold text-hub-text dark:text-gray-200">
            {promptText}
          </span>
        </div>

        <div
          role="group"
          aria-label={promptText}
          className="grid grid-cols-5 gap-2"
        >
          {TEMPERATURE_OPTIONS.map(({ value: temp, label: optLabel, icon: Icon, color, hoverColor, hoverBg, selectedBg }) => {
            const isSelected = value === temp

            return (
              <button
                key={temp}
                onClick={() => handleSelect(temp)}
                onKeyDown={(e) => handleKeyDown(e, temp)}
                aria-label={optLabel}
                aria-pressed={isSelected}
                className={cn(
                  'flex flex-col items-center gap-2 py-3 px-2 rounded-lg',
                  'border-2 transition-all duration-200 cursor-pointer',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  'focus-visible:ring-coinbase-blue dark:focus-visible:ring-offset-coinbase-dark',
                  isSelected
                    ? cn(selectedBg, color, 'scale-105')
                    : cn(
                        'border-gray-200 dark:border-white/15',
                        'bg-gray-50 dark:bg-white/[0.07]',
                        'text-gray-500 dark:text-gray-400',
                        hoverColor,
                        hoverBg,
                      )
                )}
              >
                <Icon
                  className={cn(
                    'w-7 h-7 transition-transform duration-200',
                    isSelected && 'scale-110',
                  )}
                  strokeWidth={isSelected ? 2.5 : 1.75}
                />
                <span className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  isSelected ? 'opacity-100' : 'opacity-70',
                )}>
                  {optLabel}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

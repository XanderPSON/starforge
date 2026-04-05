'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useInteractive, getStorageKey } from '@/lib/storage'
import { trackEvent, LEARNING_EVENT_TYPES } from '@/lib/event-tracking'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface FreeResponseProps {
  id: string
  label?: string
  className?: string
  placeholder?: string
}

export function FreeResponse({ id, label, className, placeholder }: FreeResponseProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ALL hooks must be called unconditionally (React Rules of Hooks)
  const storageKey = getStorageKey(slug, id || '__placeholder__')
  const [value, setValue, isSaved] = useInteractive<string>(storageKey, '')

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current && value !== undefined) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const handleBlur = useCallback(() => {
    if (value && value.trim().length > 0) {
      trackEvent(LEARNING_EVENT_TYPES.FREE_RESPONSE, {
        slug,
        metadata: {
          componentId: id,
          responseText: value,
          responseLength: value.length,
          label: label || null,
        },
      })
    }
  }, [value, slug, id, label])

  // Validate required props (after all hooks)
  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ FreeResponse Error: Missing required prop <code>id</code>
      </div>
    )
  }

  // Show skeleton during hydration
  if (value === undefined) {
    return (
      <div className={cn('my-8', className)}>
        {label && <div className="mb-2 h-5 bg-gray-200 dark:bg-white/10 rounded w-1/4 animate-pulse" />}
        <div className="h-32 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className={cn('my-8', className)}>
      {label && (
        <label htmlFor={id} className="flex items-start gap-2 mb-3 text-base font-medium text-gray-700 dark:text-gray-200">
          <span className="flex-shrink-0" aria-hidden="true">✏️</span>
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder || 'Type your answer here...'}
        aria-label={label || `Free response answer for ${id}`}
        className={cn(
          'w-full min-h-[120px] p-4 rounded-xl',
          'bg-gray-100 dark:bg-white/[0.08]',
          'border border-gray-300 dark:border-white/15',
          'text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-coinbase-blue/50 focus:border-coinbase-blue/40',
          'resize-none overflow-hidden',
          'font-sans text-base leading-relaxed',
          'transition-colors duration-200'
        )}
      />
      {isSaved && value.length > 0 && (
        <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
          <span>✓</span> Saved
        </p>
      )}
    </div>
  )
}

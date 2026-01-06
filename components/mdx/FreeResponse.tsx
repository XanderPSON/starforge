'use client'

import { useEffect, useRef } from 'react'
import { useInteractive, getStorageKey } from '@/lib/storage'
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

  // Validate required props
  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ FreeResponse Error: Missing required prop <code>id</code>
      </div>
    )
  }

  // Use new useInteractive hook with codelab-scoped key
  const storageKey = getStorageKey(slug, id)
  const [value, setValue, isSaved] = useInteractive<string>(storageKey, '')

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current && value !== undefined) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  // Show skeleton during hydration
  if (value === undefined) {
    return (
      <div className={cn('my-8', className)}>
        {label && <div className="mb-2 h-5 bg-white/10 rounded w-1/4 animate-pulse" />}
        <div className="h-32 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className={cn('my-8', className)}>
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <div className="glass-effect rounded-xl border-coinbase-blue/30 p-1 glow-blue-hover transition-all duration-300">
        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || 'Type your answer here...'}
          aria-label={label || `Free response answer for ${id}`}
          className={cn(
            'w-full min-h-[120px] p-4 bg-coinbase-space/50 rounded-lg',
            'text-gray-200 placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-coinbase-blue/50',
            'resize-none overflow-hidden',
            'font-sans text-base leading-relaxed',
            'backdrop-blur-sm'
          )}
        />
      </div>
      {isSaved && value.length > 0 && (
        <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
          <span>✓</span> Saved
        </p>
      )}
    </div>
  )
}

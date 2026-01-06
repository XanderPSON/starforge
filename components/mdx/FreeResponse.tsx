'use client'

import { useEffect, useRef } from 'react'
import { useLocalStorage } from '@/lib/storage'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface FreeResponseProps {
  id: string
  className?: string
  placeholder?: string
}

// Track used IDs to detect duplicates
const usedIds = new Set<string>()

export function FreeResponse({ id, className, placeholder }: FreeResponseProps) {
  const params = useParams()
  const slug = params.slug as string
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check for duplicate IDs
  useEffect(() => {
    if (usedIds.has(id)) {
      console.warn(`[FreeResponse] Duplicate ID detected: "${id}". Each FreeResponse must have a unique ID within the codelab.`)
    } else {
      usedIds.add(id)
    }

    return () => {
      usedIds.delete(id)
    }
  }, [id])

  // Check localStorage availability
  const [isStorageAvailable, setIsStorageAvailable] = useLocalStorage<boolean>(
    '__storage_test__',
    true,
    0
  )

  useEffect(() => {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      setIsStorageAvailable(true)
    } catch (error) {
      setIsStorageAvailable(false)
      console.warn('[FreeResponse] localStorage is not available. Responses will not be persisted.')
    }
  }, [setIsStorageAvailable])

  // Composite key pattern: codelab:{slug}:{id}
  const storageKey = `codelab:${slug}:${id}`

  // Use localStorage hook with 500ms debounce
  const [value, setValue] = useLocalStorage<string>(storageKey, '', 500)

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className={cn('my-8', className)}>
      {!isStorageAvailable && (
        <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300 backdrop-blur-sm">
          ⚠️ localStorage is disabled. Your responses will not be saved.
        </div>
      )}
      <div className="glass-effect rounded-xl border-coinbase-blue/30 p-1 glow-blue-hover transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || 'Type your answer here...'}
          aria-label={`Free response answer for ${id}`}
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
    </div>
  )
}

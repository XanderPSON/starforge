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
    <div className={cn('my-6', className)}>
      {!isStorageAvailable && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ localStorage is disabled. Your responses will not be saved.
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || 'Type your answer here...'}
        aria-label={`Free response answer for ${id}`}
        className={cn(
          'w-full min-h-[100px] p-4 border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'resize-none overflow-hidden',
          'font-sans text-base leading-relaxed'
        )}
      />
    </div>
  )
}

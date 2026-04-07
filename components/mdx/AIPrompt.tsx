'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent, LEARNING_EVENT_TYPES, usePageIndex } from '@/lib/event-tracking'

interface AIPromptProps {
  prompt: string
  className?: string
}

export function AIPrompt({ prompt, className }: AIPromptProps) {
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const pageIndex = usePageIndex()

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    // Prevent double firing if clicking the button vs the container
    e.stopPropagation()
    
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)

      const slug = params?.slug 
        ? Array.isArray(params.slug) 
          ? params.slug.join('/') 
          : params.slug 
        : 'unknown'

      trackEvent(LEARNING_EVENT_TYPES.REVEAL_TOGGLE, {
        slug,
        pageIndex,
        metadata: {
          componentId: 'ai-prompt',
          action: 'copy',
          promptPreview: prompt.slice(0, 100)
        }
      })

      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard errors gracefully
    }
  }, [prompt, params, pageIndex])

  if (!prompt) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ AIPrompt Error: Missing required prop: <code>prompt</code>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "my-6 max-w-2xl relative group rounded-xl overflow-hidden shadow-sm dark:shadow-lg dark:shadow-purple-900/20 border border-purple-200 dark:border-purple-800/60",
        "cursor-pointer transition-all duration-300",
        "hover:ring-2 hover:ring-purple-400/40 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
      onClick={handleCopy}
    >
      <div className="px-4 pt-3 pb-0 bg-purple-50/50 dark:bg-[#130d1c] flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 dark:text-purple-500 shrink-0" />
        <span className="text-xs font-medium tracking-wide text-purple-500 dark:text-purple-400 uppercase">AI Prompt</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'p-1 rounded-md',
            'text-purple-400 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50',
            copied && 'text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300'
          )}
          aria-label="Copy prompt"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12a1.5 1.5 0 0 1 .439 1.061V14.5A1.5 1.5 0 0 1 15.5 16H8.5A1.5 1.5 0 0 1 7 14.5V3.5Z" />
              <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-2h-4.5A2.5 2.5 0 0 1 6 12V6H4.5Z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="px-4 pt-2 pb-4 bg-purple-50/50 dark:bg-[#130d1c] text-gray-800 dark:text-purple-100/90 leading-relaxed font-sans whitespace-pre-wrap">
        {prompt}
      </div>
    </div>
  )
}

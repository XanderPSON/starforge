'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent, LEARNING_EVENT_TYPES } from '@/lib/event-tracking'

interface HybridStepProps {
  instruction: string
  className?: string
}

export function HybridStep({ instruction, className }: HybridStepProps) {
  const params = useParams()

  useEffect(() => {
    if (!instruction) return
    const slug = params?.slug 
      ? Array.isArray(params.slug) 
        ? params.slug.join('/') 
        : params.slug 
      : 'unknown'

    trackEvent(LEARNING_EVENT_TYPES.PAGE_VIEW, {
      slug,
      metadata: {
        componentId: 'hybrid-step',
        action: 'view',
        instructionPreview: instruction.slice(0, 100)
      }
    })
  }, [instruction, params])

  if (!instruction) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ HybridStep Error: Missing required prop: <code>instruction</code>
      </div>
    )
  }

  return (
    <div 
      role="region"
      aria-label="Human and AI step instruction"
      className={cn(
        "my-6 max-w-2xl relative group rounded-xl overflow-hidden shadow-sm dark:shadow-lg dark:shadow-amber-900/20 border border-amber-200 dark:border-amber-800/60",
        className
      )}
    >
      <div className="flex items-center px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-900/90 dark:to-orange-900/90 text-white gap-3 border-b border-amber-700/50 dark:border-amber-950">
        <div className="flex items-center gap-2 font-semibold text-sm tracking-wide">
          <Users className="w-4 h-4 text-amber-300" />
          <span>Human + AI</span>
        </div>
      </div>
      
      <div className="p-6 bg-amber-50/50 dark:bg-[#1a150d] text-gray-800 dark:text-amber-100/90 leading-relaxed font-sans whitespace-pre-wrap">
        {instruction}
      </div>
    </div>
  )
}

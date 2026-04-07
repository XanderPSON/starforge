'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent, LEARNING_EVENT_TYPES, usePageIndex } from '@/lib/event-tracking'

interface HumanStepProps {
  instruction: string
  className?: string
}

export function HumanStep({ instruction, className }: HumanStepProps) {
  const params = useParams()
  const pageIndex = usePageIndex()

  useEffect(() => {
    if (!instruction) return
    const slug = params?.slug 
      ? Array.isArray(params.slug) 
        ? params.slug.join('/') 
        : params.slug 
      : 'unknown'

    trackEvent(LEARNING_EVENT_TYPES.PAGE_VIEW, {
      slug,
      pageIndex,
      metadata: {
        componentId: 'human-step',
        action: 'view',
        instructionPreview: instruction.slice(0, 100)
      }
    })
  }, [instruction, params, pageIndex])

  if (!instruction) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ HumanStep Error: Missing required prop: <code>instruction</code>
      </div>
    )
  }

  return (
    <div 
      role="region"
      aria-label="Human step instruction"
      className={cn(
        "my-6 max-w-2xl relative group rounded-xl overflow-hidden shadow-sm dark:shadow-lg dark:shadow-blue-900/20 border border-blue-200 dark:border-blue-800/60",
        className
      )}
    >
      <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-900/90 dark:to-teal-900/90 text-white gap-3 border-b border-blue-700/50 dark:border-blue-950">
        <div className="flex items-center gap-2 font-semibold text-sm tracking-wide">
          <User className="w-4 h-4 text-blue-300" />
          <span>Human Step</span>
        </div>
      </div>
      
      <div className="p-6 bg-blue-50/50 dark:bg-[#0d1520] text-gray-800 dark:text-blue-100/90 leading-relaxed font-sans whitespace-pre-wrap">
        {instruction}
      </div>
    </div>
  )
}

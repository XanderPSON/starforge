'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { trackEvent, LEARNING_EVENT_TYPES } from '@/lib/event-tracking'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MultipleChoiceProps {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  className?: string
}

export function MultipleChoice({
  id,
  question,
  options,
  correctAnswer,
  className
}: MultipleChoiceProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'

  // ALL hooks must be called unconditionally (React Rules of Hooks)
  const storageKey = getStorageKey(slug, id || '__placeholder__')
  const [selectedAnswer, setSelectedAnswer, isSaved] = useInteractive<string | null>(
    storageKey,
    null
  )

  const isCorrect = selectedAnswer === correctAnswer
  const isAnswered = selectedAnswer !== null

  // Validate required props (after all hooks)
  const missingProps: string[] = []
  if (!id) missingProps.push('id')
  if (!question) missingProps.push('question')
  if (!options || options.length === 0) missingProps.push('options')
  if (!correctAnswer) missingProps.push('correctAnswer')

  if (missingProps.length > 0) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ MultipleChoice Error: Missing required props: <code>{missingProps.join(', ')}</code>
      </div>
    )
  }

  if (selectedAnswer === undefined) {
    return (
      <div className={cn('my-8', className)}>
        <div className="mb-4 h-6 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const handleSelect = (option: string) => {
    setSelectedAnswer(option)
    trackEvent(LEARNING_EVENT_TYPES.MULTIPLE_CHOICE, {
      slug,
      metadata: {
        componentId: id,
        question,
        selectedAnswer: option,
        isCorrect: option === correctAnswer,
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent, option: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(option)
    }
  }

  return (
    <div className={cn('my-8', className)}>
      <h4
        id={`question-${id}`}
        className="mb-4 text-base font-medium text-gray-800 dark:text-gray-200"
      >
        🤔 {question}
      </h4>
      <div
        role="radiogroup"
        aria-labelledby={`question-${id}`}
        className="space-y-3"
      >
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const showFeedback = isAnswered && isSelected

          return (
            <button
              key={option}
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(option)}
              onKeyDown={(e) => handleKeyDown(e, option)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border transition-all',
                'bg-gray-50 dark:bg-white/5 backdrop-blur-sm',
                'hover:bg-gray-100 dark:hover:bg-white/10 hover:border-blue-500/30',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                'font-sans text-base',
                // Feedback styling
                showFeedback && isCorrect && 'border-green-500/50 bg-green-500/10',
                showFeedback && !isCorrect && 'border-red-500/50 bg-red-500/10',
                !showFeedback && isSelected && 'border-blue-500/50 bg-blue-500/10',
                !isSelected && 'border-gray-200 dark:border-white/10'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected ? 'border-blue-400' : 'border-gray-300 dark:border-white/30'
                  )}
                >
                  {isSelected && (
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        showFeedback && isCorrect && 'bg-green-400',
                        showFeedback && !isCorrect && 'bg-red-400',
                        !showFeedback && 'bg-blue-400'
                      )}
                    />
                  )}
                </div>
                <span className="text-gray-800 dark:text-gray-200">{option}</span>
              </div>
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <div className="mt-4 flex items-center gap-2">
          {isCorrect ? (
            <p className="text-sm text-green-400 flex items-center gap-1">
              <span>✓</span> Correct!
            </p>
          ) : (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <span>✗</span> Incorrect. Try again!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

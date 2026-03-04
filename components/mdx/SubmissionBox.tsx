'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SubmissionBoxProps {
  id: string
  label?: string
  placeholder?: string
}

interface SubmissionState {
  draft: string
  isSubmitted: boolean
}

export function SubmissionBox({ id, label, placeholder }: SubmissionBoxProps) {
  const params = useParams()
  const slug = (params.slug as string) || 'default'

  if (!id) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ SubmissionBox Error: Missing required prop <code>id</code>
      </div>
    )
  }

  const storageKey = getStorageKey(slug, id)
  const [state, setState, isSaved] = useInteractive<SubmissionState>(storageKey, {
    draft: '',
    isSubmitted: false,
  })

  if (state === undefined) {
    return (
      <div className="my-8">
        {label && <div className="mb-2 h-5 bg-white/10 rounded w-1/4 animate-pulse" />}
        <div className="h-32 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
      </div>
    )
  }

  const handleSubmit = () => {
    if (!state.draft.trim()) return
    setState({ ...state, isSubmitted: true })
  }

  const handleEdit = () => {
    setState({ ...state, isSubmitted: false })
  }

  return (
    <div className="my-8">
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-200">
          {label}
        </label>
      )}

      <div className="glass-effect rounded-xl border-coinbase-blue/30 p-1 glow-blue-hover transition-all duration-300">
        <textarea
          id={id}
          value={state.draft}
          onChange={(e) => setState({ ...state, draft: e.target.value })}
          readOnly={state.isSubmitted}
          placeholder={placeholder || 'Write your response here...'}
          aria-label={label || `Submission for ${id}`}
          className={cn(
            'w-full min-h-[120px] p-4 bg-coinbase-space/50 rounded-lg',
            'text-gray-200 placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-coinbase-blue/50',
            'resize-none',
            'font-sans text-base leading-relaxed',
            'backdrop-blur-sm',
            state.isSubmitted && 'opacity-70 cursor-not-allowed'
          )}
        />
      </div>

      <div className="mt-3 flex items-center gap-4">
        {!state.isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!state.draft.trim()}
            className={cn(
              'px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
              state.draft.trim()
                ? 'bg-coinbase-gradient text-white hover:scale-105 glow-blue'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            )}
          >
            Submit
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-400 flex items-center gap-1 font-medium">
              <span>✓</span> Submitted
            </span>
            <button
              onClick={handleEdit}
              className="text-xs text-coinbase-cyan hover:underline"
            >
              Edit submission
            </button>
          </div>
        )}

        {!state.isSubmitted && isSaved && state.draft.length > 0 && (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span>✓</span> Draft saved
          </p>
        )}
      </div>
    </div>
  )
}

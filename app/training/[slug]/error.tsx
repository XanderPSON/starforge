'use client'

import { useEffect } from 'react'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Training error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <ErrorMessage
        title="Invalid MDX Syntax"
        message="There was an error parsing this training. Please check the Markdown syntax."
        details={error.message}
        action={{
          label: 'Try Again',
          onClick: reset,
        }}
      />
    </div>
  )
}

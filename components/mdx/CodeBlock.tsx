'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
}

interface PreProps {
  children: React.ReactNode
  className?: string
  raw?: string
}

/**
 * Inline code component
 * Used for short code snippets within paragraphs
 */
export function Code({ children, className }: CodeBlockProps) {
  // Check if this code element is inside a pre element
  // If so, it's part of a code block, not inline code
  const isInlineCode = typeof children === 'string' || !className?.includes('language-')

  if (!isInlineCode) {
    // This is a code block child, just render the content
    return <>{children}</>
  }

  // Inline code styling
  return (
    <code className={cn(
      'bg-coinbase-space text-coinbase-cyan',
      'px-2 py-0.5',
      'rounded-md',
      'text-sm font-mono font-medium',
      'whitespace-nowrap',
      'border border-coinbase-blue/30',
      className
    )}>
      {children}
    </code>
  )
}

/**
 * Code block component (pre element)
 * Hover to reveal a copy chip in the top-right corner.
 */
export function Pre({ children, className, raw }: PreProps) {
  const [copied, setCopied] = useState(false)

  const textToCopy =
    typeof raw === 'string'
      ? raw
      : typeof children === 'string'
        ? children
        : (Array.isArray(children) ? children : [children])
            .map((c) => (typeof c === 'string' ? c : (c as React.ReactElement)?.props?.children ?? ''))
            .join('')

  const handleCopy = useCallback(async () => {
    if (!textToCopy) return
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }, [textToCopy])

  return (
    <div className="my-6 relative group">
      <pre
        className={cn(
          'bg-coinbase-dark text-gray-200',
          'p-6',
          'rounded-xl',
          'overflow-x-auto',
          'font-mono text-sm leading-relaxed',
          'border border-coinbase-blue/30',
          'shadow-lg shadow-coinbase-blue/10',
          'whitespace-pre',
          'scroll-smooth',
          copied && 'ring-2 ring-emerald-400/50',
          className
        )}
      >
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'absolute top-3 right-3',
          'px-2.5 py-1 rounded-md',
          'text-xs font-medium',
          'bg-coinbase-space/80 text-gray-300 border border-coinbase-blue/30',
          'backdrop-blur-sm',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-coinbase-blue',
          'cursor-pointer',
          copied && 'text-emerald-400 border-emerald-400/40'
        )}
        aria-label="Copy code"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

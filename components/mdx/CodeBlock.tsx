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
      'bg-hub-surface-alt dark:bg-white/[0.1] text-hub-primary dark:text-blue-300',
      'px-2 py-0.5',
      'rounded-md',
      'text-sm font-mono font-medium',
      'whitespace-nowrap',
      'border border-hub-primary/20 dark:border-white/15',
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
            .map((c) => (typeof c === 'string' ? c : (c as React.ReactElement<{children?: string}>)?.props?.children ?? ''))
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
        onClick={handleCopy}
        className={cn(
          'bg-gray-900 dark:bg-coinbase-dark text-gray-200',
          'p-6 pl-12',
          'rounded-xl',
          'overflow-x-auto',
          'font-mono text-sm leading-relaxed',
          'border border-gray-700/50 dark:border-coinbase-blue/20',
          'shadow-sm dark:shadow-lg dark:shadow-coinbase-blue/10',
          'whitespace-pre',
          'scroll-smooth',
          'cursor-pointer',
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
          'absolute top-3 left-3',
          'p-1.5 rounded-md',
          'text-gray-400 hover:text-gray-200',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-coinbase-blue',
          'cursor-pointer',
          copied && 'text-emerald-400'
        )}
        aria-label="Copy code"
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
  )
}

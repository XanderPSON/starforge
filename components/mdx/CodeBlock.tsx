'use client'

import React, { useState, useCallback, useContext, createContext } from 'react'
import { cn } from '@/lib/utils'

// Context that tells Code it's being rendered inside a Pre block
const InPreContext = createContext(false)

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
 * Inline code component (used for `backtick` spans in prose).
 * When rendered inside a Pre, just passes through as a plain <code> element.
 */
export function Code({ children, className }: CodeBlockProps) {
  const inPre = useContext(InPreContext)

  if (inPre) {
    // Block code child — no extra styling, let the <pre> control appearance
    return <code className={className}>{children}</code>
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

function CopyPre({ children, className, raw }: PreProps) {
  const text = typeof raw === 'string' ? raw : extractTextContent(children)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }, [text])

  return (
    <InPreContext.Provider value={true}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopy() } }}
        className={cn(
          'my-6 group flex items-stretch cursor-pointer',
          'bg-gray-900 dark:bg-coinbase-dark text-gray-200',
          'rounded-xl',
          'border border-gray-700/50 dark:border-coinbase-blue/20',
          'shadow-sm dark:shadow-lg dark:shadow-coinbase-blue/10',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-coinbase-blue',
          copied && 'ring-2 ring-emerald-400/50',
        )}
        aria-label="Copy code"
      >
        <div className="flex items-center pl-4 shrink-0">
          <CopyIndicator copied={copied} />
        </div>
        <pre
          className={cn(
            'flex-1 min-w-0',
            'p-6 pl-3',
            'overflow-x-auto',
            'font-mono text-sm leading-relaxed',
            'whitespace-pre',
            'scroll-smooth',
            className
          )}
        >
          {children}
        </pre>
      </div>
    </InPreContext.Provider>
  )
}

function extractTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractTextContent).join('')
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return extractTextContent(props.children)
  }
  return ''
}

function CopyIndicator({ copied }: { copied: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 shrink-0 self-center',
        'text-gray-400',
        'opacity-0 group-hover:opacity-100',
        'transition-all duration-150',
        copied && 'text-emerald-400 opacity-100'
      )}
      aria-hidden
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
    </div>
  )
}

function StandardPre({ children, className, raw }: PreProps) {
  const text = typeof raw === 'string' ? raw : extractTextContent(children)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }, [text])

  return (
    <InPreContext.Provider value={true}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopy() } }}
        className={cn(
          'my-6 group flex items-stretch cursor-pointer',
          'bg-gray-900 dark:bg-coinbase-dark text-gray-200',
          'rounded-xl',
          'border border-gray-700/50 dark:border-coinbase-blue/20',
          'shadow-sm dark:shadow-lg dark:shadow-coinbase-blue/10',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-coinbase-blue',
          copied && 'ring-2 ring-emerald-400/50',
        )}
        aria-label="Copy code"
      >
        <div className="flex items-center pl-4 shrink-0">
          <CopyIndicator copied={copied} />
        </div>
        <pre
          className={cn(
            'flex-1 min-w-0',
            'p-6 pl-3',
            'overflow-x-auto',
            'font-mono text-sm leading-relaxed',
            'whitespace-pre-wrap',
            'break-words',
            className
          )}
        >
          {children}
        </pre>
      </div>
    </InPreContext.Provider>
  )
}

export function Pre({ children, className, raw }: PreProps) {
  // Detect ```copy blocks by inspecting the code child's className
  const childrenArray = React.Children.toArray(children)
  const firstChild = childrenArray[0]
  const isCopyBlock =
    React.isValidElement(firstChild) &&
    typeof (firstChild.props as { className?: string }).className === 'string' &&
    (firstChild.props as { className?: string }).className!.includes('language-copy')

  if (isCopyBlock) {
    return <CopyPre className={className} raw={raw}>{children}</CopyPre>
  }

  return <StandardPre className={className} raw={raw}>{children}</StandardPre>
}

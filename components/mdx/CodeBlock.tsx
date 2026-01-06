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
 * Handles multi-line code with syntax highlighting support
 */
export function Pre({ children, className }: PreProps) {
  return (
    <div className="my-6">
      <pre className={cn(
        'bg-coinbase-dark text-gray-200',
        'p-6',
        'rounded-xl',
        'overflow-x-auto',
        'font-mono text-sm leading-relaxed',
        'border border-coinbase-blue/30',
        'shadow-lg shadow-coinbase-blue/10',
        // Ensure long lines scroll horizontally
        'whitespace-pre',
        // Smooth scrolling
        'scroll-smooth',
        className
      )}>
        <code>{children}</code>
      </pre>
    </div>
  )
}

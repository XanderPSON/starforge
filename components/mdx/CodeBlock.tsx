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
      'bg-gray-900 text-gray-100',
      'px-1.5 py-0.5',
      'rounded',
      'text-sm font-mono',
      'whitespace-nowrap',
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
    <pre className={cn(
      'bg-gray-900 text-gray-100',
      'p-4',
      'rounded-lg',
      'overflow-x-auto',
      'mb-4',
      'font-mono text-sm leading-relaxed',
      // Ensure long lines scroll horizontally
      'whitespace-pre',
      // Smooth scrolling
      'scroll-smooth',
      className
    )}>
      <code>{children}</code>
    </pre>
  )
}

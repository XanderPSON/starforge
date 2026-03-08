import { cn } from '@/lib/utils'

interface HeadingProps {
  children: React.ReactNode
  className?: string
}

export function H1({ children, className }: HeadingProps) {
  return (
    <h1 className={cn(
      'text-3xl font-bold mt-0 mb-6',
      'text-hub-text dark:text-gray-100',
      className
    )}>
      {children}
    </h1>
  )
}

export function H2({ children, className }: HeadingProps) {
  return (
    <h2 className={cn(
      'text-2xl font-bold mt-10 mb-4 pb-2',
      'text-hub-text dark:text-gray-100 border-b border-gray-200 dark:border-gray-700',
      className
    )}>
      {children}
    </h2>
  )
}

export function H3({ children, className }: HeadingProps) {
  return (
    <h3 className={cn('text-xl font-semibold mt-8 mb-3 text-hub-text dark:text-gray-200', className)}>
      {children}
    </h3>
  )
}

export function H4({ children, className }: HeadingProps) {
  return (
    <h4 className={cn('text-lg font-semibold mt-6 mb-3 text-hub-text dark:text-gray-200', className)}>
      {children}
    </h4>
  )
}

export function H5({ children, className }: HeadingProps) {
  return (
    <h5 className={cn('text-base font-semibold mt-4 mb-2 text-hub-muted dark:text-gray-300', className)}>
      {children}
    </h5>
  )
}

export function H6({ children, className }: HeadingProps) {
  return (
    <h6 className={cn('text-sm font-semibold uppercase tracking-wide mt-4 mb-2 text-hub-muted dark:text-gray-400', className)}>
      {children}
    </h6>
  )
}

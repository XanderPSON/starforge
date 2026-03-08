import { cn } from '@/lib/utils'

interface BlockquoteProps {
  children: React.ReactNode
  className?: string
}

export function Blockquote({ children, className }: BlockquoteProps) {
  return (
    <blockquote className={cn(
      'border-l-4 border-hub-primary/60 dark:border-coinbase-blue/50 pl-6 pr-4 py-4 my-6',
      'bg-hub-surface-alt dark:bg-white/[0.08] rounded-r-lg',
      'text-gray-600 dark:text-gray-300',
      className
    )}>
      {children}
    </blockquote>
  )
}

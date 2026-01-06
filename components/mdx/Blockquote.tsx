import { cn } from '@/lib/utils'

interface BlockquoteProps {
  children: React.ReactNode
  className?: string
}

export function Blockquote({ children, className }: BlockquoteProps) {
  return (
    <blockquote className={cn(
      'border-l-4 border-coinbase-blue pl-6 pr-4 py-4 italic my-6',
      'bg-coinbase-dark/50 rounded-r-lg',
      'text-gray-300',
      'backdrop-blur-sm',
      className
    )}>
      {children}
    </blockquote>
  )
}

import { cn } from '@/lib/utils'

interface BlockquoteProps {
  children: React.ReactNode
  className?: string
}

export function Blockquote({ children, className }: BlockquoteProps) {
  return (
    <blockquote className={cn('border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4', className)}>
      {children}
    </blockquote>
  )
}

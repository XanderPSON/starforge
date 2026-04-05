import { cn } from '@/lib/utils'

interface ParagraphProps {
  children: React.ReactNode
  className?: string
}

export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p className={cn('leading-relaxed mb-5 text-gray-700 dark:text-gray-200', className)}>
      {children}
    </p>
  )
}

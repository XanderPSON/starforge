import { cn } from '@/lib/utils'

interface ParagraphProps {
  children: React.ReactNode
  className?: string
}

export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p className={cn('max-w-[65ch] leading-7 mb-4', className)}>
      {children}
    </p>
  )
}

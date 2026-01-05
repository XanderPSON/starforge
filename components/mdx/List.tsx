import { cn } from '@/lib/utils'

interface ListProps {
  children: React.ReactNode
  className?: string
}

export function UnorderedList({ children, className }: ListProps) {
  return (
    <ul className={cn('list-disc list-outside ml-6 mb-4 space-y-2', className)}>
      {children}
    </ul>
  )
}

export function OrderedList({ children, className }: ListProps) {
  return (
    <ol className={cn('list-decimal list-outside ml-6 mb-4 space-y-2', className)}>
      {children}
    </ol>
  )
}

export function ListItem({ children, className }: ListProps) {
  return (
    <li className={cn('leading-7', className)}>
      {children}
    </li>
  )
}

import { cn } from '@/lib/utils'

interface ListProps {
  children: React.ReactNode
  className?: string
}

export function UnorderedList({ children, className }: ListProps) {
  return (
    <ul className={cn('list-disc list-outside ml-6 mb-6 space-y-2 marker:text-coinbase-blue dark:marker:text-blue-400', className)}>
      {children}
    </ul>
  )
}

export function OrderedList({ children, className }: ListProps) {
  return (
    <ol className={cn('list-decimal list-outside ml-6 mb-6 space-y-2 marker:text-coinbase-blue dark:marker:text-blue-400 marker:font-semibold', className)}>
      {children}
    </ol>
  )
}

export function ListItem({ children, className }: ListProps) {
  return (
    <li className={cn('leading-7 text-gray-700 dark:text-gray-200', className)}>
      {children}
    </li>
  )
}

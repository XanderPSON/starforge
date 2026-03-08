import { cn } from '@/lib/utils'

interface TableElementProps {
  children: React.ReactNode
  className?: string
}

/**
 * Table wrapper — rounded container with thick border and subtle glow.
 * Gives markdown tables a solid, structured grid feel.
 */
export function Table({ children, className }: TableElementProps) {
  return (
    <div className="my-8 overflow-x-auto rounded-xl border-2 border-hub-primary/20 dark:border-coinbase-blue/30 shadow-sm dark:shadow-lg dark:shadow-coinbase-blue/5">
      <table className={cn(
        'w-full border-collapse text-sm',
        className
      )}>
        {children}
      </table>
    </div>
  )
}

/**
 * Table head — bold header row with colored background.
 */
export function THead({ children, className }: TableElementProps) {
  return (
    <thead className={cn(
      'bg-hub-primary/[0.08] dark:bg-coinbase-blue/[0.12]',
      className
    )}>
      {children}
    </thead>
  )
}

/**
 * Table body — alternating row stripes for readability.
 */
export function TBody({ children, className }: TableElementProps) {
  return (
    <tbody className={cn(
      '[&>tr:nth-child(even)]:bg-hub-surface-alt/50 dark:[&>tr:nth-child(even)]:bg-white/[0.03]',
      className
    )}>
      {children}
    </tbody>
  )
}

/**
 * Table row — thick grid lines between rows with hover highlight.
 */
export function TR({ children, className }: TableElementProps) {
  return (
    <tr className={cn(
      'border-b-2 border-hub-primary/10 dark:border-coinbase-blue/15',
      'transition-colors duration-100',
      'hover:bg-hub-primary/[0.04] dark:hover:bg-coinbase-blue/[0.06]',
      className
    )}>
      {children}
    </tr>
  )
}

/**
 * Table header cell — uppercase label with thick right dividers between columns.
 */
export function TH({ children, className }: TableElementProps) {
  return (
    <th className={cn(
      'px-5 py-3.5 text-left',
      'text-xs font-bold uppercase tracking-wider',
      'text-hub-primary dark:text-coinbase-blue',
      'border-r-2 border-hub-primary/10 dark:border-coinbase-blue/15 last:border-r-0',
      className
    )}>
      {children}
    </th>
  )
}

/**
 * Table data cell — thick right dividers to complete the grid.
 */
export function TD({ children, className }: TableElementProps) {
  return (
    <td className={cn(
      'px-5 py-3.5',
      'text-hub-text dark:text-gray-300',
      'border-r-2 border-hub-primary/10 dark:border-coinbase-blue/15 last:border-r-0',
      className
    )}>
      {children}
    </td>
  )
}

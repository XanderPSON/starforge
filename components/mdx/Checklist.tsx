'use client'

import { useInteractive, getStorageKey } from '@/lib/storage'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ChecklistProps {
  id: string
  items: string[]
  className?: string
}

export function Checklist({ id, items, className }: ChecklistProps) {
  const params = useParams()
  const slug = params.slug as string || 'default'

  // Validate required props
  const missingProps: string[] = []
  if (!id) missingProps.push('id')
  if (!items || items.length === 0) missingProps.push('items')

  if (missingProps.length > 0) {
    return (
      <div className="my-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
        ❌ Checklist Error: Missing required props: <code>{missingProps.join(', ')}</code>
      </div>
    )
  }

  // Use useInteractive hook with codelab-scoped key
  const storageKey = getStorageKey(slug, id)
  const defaultValue = Array(items.length).fill(false)
  const [checkedItems, setCheckedItems, isSaved] = useInteractive<boolean[]>(
    storageKey,
    defaultValue
  )

  // Show skeleton during hydration
  if (checkedItems === undefined) {
    return (
      <div className={cn('my-8', className)}>
        <div className="space-y-3">
          {items.map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded flex-1 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleToggle = (index: number) => {
    const newCheckedItems = [...checkedItems]
    newCheckedItems[index] = !newCheckedItems[index]
    setCheckedItems(newCheckedItems)
  }

  const completedCount = checkedItems.filter(Boolean).length
  const totalCount = items.length

  return (
    <div className={cn('my-8', className)}>
      <div className="space-y-3">
        {items.map((item, index) => {
          const isChecked = checkedItems[index] || false

          return (
            <label
              key={index}
              htmlFor={`${id}-item-${index}`}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
                'hover:bg-white/5',
                isChecked && 'bg-green-500/5'
              )}
            >
              <input
                type="checkbox"
                id={`${id}-item-${index}`}
                checked={isChecked}
                onChange={() => handleToggle(index)}
                className={cn(
                  'mt-0.5 w-5 h-5 rounded border-2 transition-all',
                  'focus:ring-2 focus:ring-blue-500/50 focus:outline-none',
                  'cursor-pointer',
                  isChecked
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white/5 border-white/30'
                )}
              />
              <span
                className={cn(
                  'flex-1 text-base transition-all',
                  isChecked
                    ? 'text-gray-400 line-through'
                    : 'text-gray-200'
                )}
              >
                {item}
              </span>
            </label>
          )
        })}
      </div>

      {totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-400">
            {completedCount} of {totalCount} completed
          </p>
          {completedCount === totalCount && (
            <p className="text-green-400 flex items-center gap-1">
              <span>✓</span> All done!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

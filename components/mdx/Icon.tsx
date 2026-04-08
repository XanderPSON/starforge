import { icons, type LucideProps } from 'lucide-react'

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof icons
}

/**
 * Renders a Lucide icon by name. Use in MDX like:
 *   <Icon name="Package" size={18} />
 *   <Icon name="Send" className="text-blue-400" />
 */
export function Icon({ name, size = 18, className, ...props }: IconProps) {
  const LucideIcon = icons[name]

  if (!LucideIcon) {
    return (
      <span className="text-red-600 dark:text-red-400 text-xs font-mono">
        [unknown icon: {name}]
      </span>
    )
  }

  return (
    <LucideIcon
      size={size}
      className={className ?? 'inline-block align-text-bottom'}
      aria-hidden="true"
      {...props}
    />
  )
}

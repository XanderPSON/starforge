import { Children, isValidElement } from 'react'
import { cn } from '@/lib/utils'

interface HeadingProps {
  children: React.ReactNode
  className?: string
}

const DURATION_RE = /\((\d+)\s*min\)\s*$/

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return extractText(props.children)
  }
  return ''
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
    .replace(DURATION_RE, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function extractDuration(children: React.ReactNode): { content: React.ReactNode; minutes: number | null } {
  if (typeof children === 'string') {
    const match = children.match(DURATION_RE)
    if (match) {
      return { content: children.replace(DURATION_RE, '').trimEnd(), minutes: parseInt(match[1]!, 10) }
    }
    return { content: children, minutes: null }
  }

  if (Array.isArray(children) || typeof children === 'object') {
    const arr = Children.toArray(children)
    const last = arr[arr.length - 1]
    if (typeof last === 'string') {
      const match = last.match(DURATION_RE)
      if (match) {
        const trimmed = last.replace(DURATION_RE, '').trimEnd()
        const newArr = [...arr.slice(0, -1), ...(trimmed ? [trimmed] : [])]
        return { content: newArr, minutes: parseInt(match[1]!, 10) }
      }
    }
    if (isValidElement(last)) {
      const props = last.props as { children?: React.ReactNode }
      if (typeof props.children === 'string') {
        const match = props.children.match(DURATION_RE)
        if (match) {
          const trimmed = props.children.replace(DURATION_RE, '').trimEnd()
          const newArr = [...arr.slice(0, -1), ...(trimmed ? [trimmed] : [])]
          return { content: newArr, minutes: parseInt(match[1]!, 10) }
        }
      }
    }
  }

  return { content: children, minutes: null }
}

function AnchorLink({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      className="!float-left -ml-[1em] w-[1em] opacity-0 group-hover:opacity-100 text-gray-400 hover:text-coinbase-blue dark:hover:text-coinbase-cyan transition-opacity !no-underline select-none"
      aria-label="Link to this section"
    >
      #
    </a>
  )
}

function DurationBadge({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1 ml-2.5 align-middle text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 3.5V6L7.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {minutes} min
    </span>
  )
}

export function H1({ children, className }: HeadingProps) {
  const id = slugify(extractText(children))
  return (
    <h1 id={id} className={cn(
      'group relative text-3xl font-bold mt-0 mb-6',
      'text-hub-text dark:text-gray-100',
      'scroll-mt-16',
      className
    )}>
      <AnchorLink id={id} />
      {children}
    </h1>
  )
}

export function H2({ children, className }: HeadingProps) {
  const { content, minutes } = extractDuration(children)
  const id = slugify(extractText(children))
  return (
    <h2 id={id} className={cn(
      'group relative text-2xl font-bold mt-10 mb-4 pb-2',
      'text-hub-text dark:text-gray-100 border-b border-gray-200 dark:border-gray-700',
      'scroll-mt-16',
      className
    )}>
      <AnchorLink id={id} />
      {content}
      {minutes !== null && <DurationBadge minutes={minutes} />}
    </h2>
  )
}

export function H3({ children, className }: HeadingProps) {
  const { content, minutes } = extractDuration(children)
  const id = slugify(extractText(children))
  return (
    <h3 id={id} className={cn('group relative text-xl font-semibold mt-8 mb-3 text-hub-text dark:text-gray-200 scroll-mt-16', className)}>
      <AnchorLink id={id} />
      {content}
      {minutes !== null && <DurationBadge minutes={minutes} />}
    </h3>
  )
}

export function H4({ children, className }: HeadingProps) {
  const id = slugify(extractText(children))
  return (
    <h4 id={id} className={cn('group relative text-lg font-semibold mt-6 mb-3 text-hub-text dark:text-gray-200 scroll-mt-16', className)}>
      <AnchorLink id={id} />
      {children}
    </h4>
  )
}

export function H5({ children, className }: HeadingProps) {
  const id = slugify(extractText(children))
  return (
    <h5 id={id} className={cn('group relative text-base font-semibold mt-4 mb-2 text-hub-muted dark:text-gray-300 scroll-mt-16', className)}>
      <AnchorLink id={id} />
      {children}
    </h5>
  )
}

export function H6({ children, className }: HeadingProps) {
  const id = slugify(extractText(children))
  return (
    <h6 id={id} className={cn('group relative text-sm font-semibold uppercase tracking-wide mt-4 mb-2 text-hub-muted dark:text-gray-400 scroll-mt-16', className)}>
      <AnchorLink id={id} />
      {children}
    </h6>
  )
}

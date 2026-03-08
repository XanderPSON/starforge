import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ACRONYMS: Record<string, string> = { ai: 'AI', nho: 'NHO', grpc: 'gRPC' }

export function toTitleCase(str: string): string {
  return str
    .replace(/-/g, ' ')
    .split(' ')
    .map((w) => ACRONYMS[w.toLowerCase()] ?? w.replace(/^\w/, (c) => c.toUpperCase()))
    .join(' ')
}

export function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

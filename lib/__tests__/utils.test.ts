import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cn, slugify, toTitleCase } from '@/lib/utils'

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('cn', () => {
    it('merges classes and resolves Tailwind conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
      expect(cn('text-sm', 'font-medium', 'text-lg')).toBe('font-medium text-lg')
    })

    it('handles empty and undefined inputs', () => {
      expect(cn('', undefined, null, false)).toBe('')
      expect(cn(undefined, 'mt-4')).toBe('mt-4')
    })

    it('supports conditional classes', () => {
      const isActive = true
      const isDisabled = false

      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
    })
  })

  describe('toTitleCase', () => {
    it('capitalizes basic words', () => {
      expect(toTitleCase('hello world')).toBe('Hello World')
    })

    it('handles hyphenated strings', () => {
      expect(toTitleCase('build-ai-workflows')).toBe('Build AI Workflows')
    })

    it('applies acronym mappings', () => {
      expect(toTitleCase('ai nho grpc')).toBe('AI NHO gRPC')
      expect(toTitleCase('Ai NhO GrPc')).toBe('AI NHO gRPC')
    })

    it('handles mixed case words not in acronym map', () => {
      expect(toTitleCase('mIxEd cAsE words')).toBe('MIxEd CAsE Words')
    })
  })

  describe('slugify', () => {
    it('slugifies basic strings', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('converts spaces and underscores to hyphens', () => {
      expect(slugify('hello__world  from_starforge')).toBe('hello-world-from-starforge')
    })

    it('removes special characters', () => {
      expect(slugify('Hello! @World# $2026%')).toBe('hello-world-2026')
    })

    it('collapses consecutive hyphens and trims whitespace', () => {
      expect(slugify('  hello---world  ')).toBe('hello-world')
    })

    it('keeps already-slugified strings stable', () => {
      expect(slugify('already-slugified-string')).toBe('already-slugified-string')
    })
  })
})

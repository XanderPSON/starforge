import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Code, Pre } from '@/components/mdx/CodeBlock'

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-training' }),
}))

vi.mock('@/lib/storage', () => ({
  useInteractive: vi.fn(),
  getStorageKey: vi.fn(() => 'codelab:test-training:code-1'),
}))

vi.mock('@/lib/event-tracking', () => ({
  trackEvent: vi.fn(),
  LEARNING_EVENT_TYPES: {
    TEMPERATURE_CHECK: 'temperature_check',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('CodeBlock components', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  const originalNavigator = globalThis.navigator

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...originalNavigator,
        clipboard: { writeText },
      },
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
  })

  it('Code component renders inline code with correct classes', () => {
    render(<Code>npm test</Code>)

    const code = screen.getByText('npm test')
    expect(code.tagName).toBe('CODE')
    expect(code).toHaveClass('rounded-md', 'font-mono', 'whitespace-nowrap')
  })

  it('Pre component renders code block', () => {
    render(<Pre>const a = 1;</Pre>)

    expect(screen.getByText('const a = 1;')).toBeInTheDocument()
    expect(document.querySelector('pre')).toBeInTheDocument()
  })

  it('copy button exists with aria-label', () => {
    render(<Pre>console.log("x")</Pre>)

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  it('click on pre copies text to clipboard', async () => {
    render(<Pre raw="const copied = true;">const copied = true;</Pre>)

    const pre = document.querySelector('pre')
    expect(pre).toBeTruthy()
    if (pre) {
      await act(async () => {
        fireEvent.click(pre)
      })
    }

    expect(writeText).toHaveBeenCalledWith('const copied = true;')
  })

  it('copy button click copies text', async () => {
    render(<Pre raw="return 42;">return 42;</Pre>)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    })

    expect(writeText).toHaveBeenCalledWith('return 42;')
  })
})

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

  it('Pre renders a normal (non-copy) code block with no copy button', () => {
    render(<Pre><code>{'line one\nline two'}</code></Pre>)

    expect(document.querySelector('pre')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy code' })).not.toBeInTheDocument()
  })

  it('normal Pre wraps long lines (whitespace-pre-wrap)', () => {
    render(<Pre><code>{'some long text'}</code></Pre>)

    const pre = document.querySelector('pre')
    expect(pre).toBeTruthy()
    expect(pre?.className).toContain('whitespace-pre-wrap')
  })

  it('copy block (language-copy) renders copy button', () => {
    render(
      <Pre>
        <code className="language-copy">{'console.log("x")'}</code>
      </Pre>
    )

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  it('click on copy pre copies text to clipboard', async () => {
    render(
      <Pre raw="const copied = true;">
        <code className="language-copy">{'const copied = true;'}</code>
      </Pre>
    )

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
    render(
      <Pre raw="return 42;">
        <code className="language-copy">{'return 42;'}</code>
      </Pre>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    })

    expect(writeText).toHaveBeenCalledWith('return 42;')
  })
})

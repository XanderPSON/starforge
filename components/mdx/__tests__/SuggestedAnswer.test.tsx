import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SuggestedAnswer } from '@/components/mdx/SuggestedAnswer'
import { useInteractive, getStorageKey } from '@/lib/storage'
import { trackEvent } from '@/lib/event-tracking'

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-training' }),
}))

vi.mock('@/lib/storage', () => ({
  useInteractive: vi.fn(),
  getStorageKey: vi.fn(),
}))

vi.mock('@/lib/event-tracking', () => ({
  trackEvent: vi.fn(),
  usePageIndex: () => 0,
  LEARNING_EVENT_TYPES: {
    REVEAL_TOGGLE: 'reveal_toggle',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('SuggestedAnswer', () => {
  const mockSetValue = vi.fn()
  let currentValue = ''

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = ''
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:suggested-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders with required props', () => {
    render(<SuggestedAnswer id="suggested-1">Use a queue and retry logic.</SuggestedAnswer>)

    expect(screen.getByRole('button', { name: /reveal suggested answer/i })).toBeInTheDocument()
    expect(screen.queryByText('Use a queue and retry logic.')).not.toBeInTheDocument()
  })

  it('renders error state when children prop is missing', () => {
    // @ts-expect-error testing runtime behavior for missing required children
    render(<SuggestedAnswer id="suggested-1" />)

    expect(screen.getByText(/Missing required prop/)).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    render(<SuggestedAnswer id="suggested-1">Use a queue and retry logic.</SuggestedAnswer>)

    fireEvent.click(screen.getByRole('button', { name: /reveal suggested answer/i }))
    expect(screen.getByText('Use a queue and retry logic.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /hide suggested answer/i }))
    expect(screen.queryByText('Use a queue and retry logic.')).not.toBeInTheDocument()
  })

  it('has correct ARIA attributes', () => {
    render(<SuggestedAnswer id="suggested-1">Accessible answer</SuggestedAnswer>)

    const button = screen.getByRole('button', { name: /reveal suggested answer/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(button)
    expect(screen.getByRole('button', { name: /hide suggested answer/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('tracks events on interaction', () => {
    render(<SuggestedAnswer id="suggested-1" label="hint">Track me</SuggestedAnswer>)

    fireEvent.click(screen.getByRole('button', { name: /reveal hint/i }))
    fireEvent.click(screen.getByRole('button', { name: /hide hint/i }))

    expect(trackEvent).toHaveBeenNthCalledWith(1, 'reveal_toggle', {
      slug: 'test-training',
      pageIndex: 0,
      metadata: {
        componentId: 'suggested-1',
        action: 'reveal',
        label: 'hint',
      },
    })

    expect(trackEvent).toHaveBeenNthCalledWith(2, 'reveal_toggle', {
      slug: 'test-training',
      pageIndex: 0,
      metadata: {
        componentId: 'suggested-1',
        action: 'hide',
        label: 'hint',
      },
    })
  })
})

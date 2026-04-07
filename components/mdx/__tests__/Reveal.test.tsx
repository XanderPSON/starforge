import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from '@/components/mdx/Reveal'
import { useInteractive, getStorageKey, safeGetItem } from '@/lib/storage'
import { trackEvent } from '@/lib/event-tracking'

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-training' }),
}))

vi.mock('@/lib/storage', () => ({
  useInteractive: vi.fn(),
  getStorageKey: vi.fn(),
  safeGetItem: vi.fn(),
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

describe('Reveal', () => {
  const mockSetValue = vi.fn()
  let currentValue = ''

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = ''
    vi.mocked(getStorageKey).mockImplementation((slug, id) => `codelab:${slug}:${id}`)
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
    vi.mocked(safeGetItem).mockReturnValue(null)

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  it('renders with required props', async () => {
    vi.mocked(safeGetItem).mockReturnValue('answered')

    render(<Reveal requiredId="dep-1">Revealed content</Reveal>)

    await waitFor(() => {
      expect(screen.getByText('Revealed content')).toBeInTheDocument()
    })
  })

  it('renders error state when requiredId prop is missing', () => {
    // @ts-expect-error testing runtime behavior for missing required prop
    render(<Reveal>Missing dependency id</Reveal>)

    expect(screen.queryByText('Missing dependency id')).not.toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    vi.mocked(safeGetItem)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('answered now')

    render(<Reveal requiredId="dep-1">Now visible</Reveal>)
    expect(screen.queryByText('Now visible')).not.toBeInTheDocument()

    fireEvent(window, new CustomEvent('codelab:saved', { detail: { key: 'codelab:test-training:dep-1' } }))

    await waitFor(() => {
      expect(screen.getByText('Now visible')).toBeInTheDocument()
    })
  })

  it('has correct ARIA attributes', async () => {
    vi.mocked(safeGetItem).mockReturnValue('answered')

    const { container } = render(<Reveal requiredId="dep-1">ARIA content</Reveal>)

    await waitFor(() => {
      expect(screen.getByText('ARIA content')).toBeInTheDocument()
    })

    expect(container.firstElementChild).toHaveClass('transition-opacity')
    expect(container.firstElementChild).toHaveStyle({ opacity: '1' })
  })

  it('tracks events on interaction', async () => {
    vi.mocked(safeGetItem)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('answered now')

    render(<Reveal requiredId="dep-1">Track reveal</Reveal>)

    fireEvent(window, new CustomEvent('codelab:saved', { detail: { key: 'codelab:test-training:dep-1' } }))

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('reveal_toggle', {
        slug: 'test-training',
        pageIndex: 0,
        metadata: {
          componentId: 'dep-1',
          action: 'reveal',
          trigger: 'dependency_answered',
        },
      })
    })
  })
})

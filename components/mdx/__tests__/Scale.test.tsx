import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Scale } from '@/components/mdx/Scale'
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
  LEARNING_EVENT_TYPES: {
    SCALE_RATING: 'scale_rating',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('Scale', () => {
  const mockSetValue = vi.fn()
  let currentValue: number | null

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = null
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:scale-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders with required props', () => {
    render(<Scale id="scale-1" max={5} label="Rate confidence" />)

    expect(screen.getByText('Rate confidence')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rate 1 out of 5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rate 5 out of 5' })).toBeInTheDocument()
  })

  it('renders error state when id prop is missing', () => {
    // @ts-expect-error testing runtime guard for missing required prop
    render(<Scale label="Missing id" />)

    expect(screen.getByText(/Scale Error: Missing required prop/i)).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const { rerender } = render(<Scale id="scale-1" max={5} />)

    fireEvent.click(screen.getByRole('button', { name: 'Rate 3 out of 5' }))
    expect(mockSetValue).toHaveBeenCalledWith(3)

    currentValue = 3
    rerender(<Scale id="scale-1" max={5} />)

    expect(screen.getByText('3 / 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rate 3 out of 5' })).toHaveAttribute('aria-current', 'true')
  })

  it('supports keyboard interaction', () => {
    render(<Scale id="scale-1" max={5} />)

    const button = screen.getByRole('button', { name: 'Rate 2 out of 5' })
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(mockSetValue).toHaveBeenCalledTimes(2)
  })

  it('has correct ARIA attributes', () => {
    render(<Scale id="scale-1" max={4} label="Difficulty" />)

    const group = screen.getByRole('group', { name: 'Difficulty' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rate 4 out of 4' })).toBeInTheDocument()
  })

  it('tracks events on interaction', () => {
    render(<Scale id="scale-1" max={5} label="Difficulty" />)

    fireEvent.click(screen.getByRole('button', { name: 'Rate 4 out of 5' }))

    expect(trackEvent).toHaveBeenCalledWith('scale_rating', {
      slug: 'test-training',
      metadata: {
        componentId: 'scale-1',
        value: 4,
        max: 5,
        label: 'Difficulty',
      },
    })
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FreeResponse } from '@/components/mdx/FreeResponse'
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
    FREE_RESPONSE: 'free_response',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('FreeResponse', () => {
  const mockSetValue = vi.fn()
  let currentValue: string

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = ''
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:free-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders with required props', () => {
    render(<FreeResponse id="free-1" label="Your answer" placeholder="Type here" />)

    expect(screen.getByLabelText('Your answer')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })

  it('renders error state when id prop is missing', () => {
    // @ts-expect-error testing runtime guard for missing required prop
    render(<FreeResponse label="Missing id" />)

    expect(screen.getByText(/FreeResponse Error: Missing required prop/i)).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const { rerender } = render(<FreeResponse id="free-1" label="Prompt" />)

    const textarea = screen.getByLabelText('Prompt')
    fireEvent.change(textarea, { target: { value: 'My response' } })
    expect(mockSetValue).toHaveBeenCalledWith('My response')

    currentValue = 'My response'
    rerender(<FreeResponse id="free-1" label="Prompt" />)

    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('has correct ARIA attributes', () => {
    render(<FreeResponse id="free-1" label="Accessible free response" />)

    expect(screen.getByRole('textbox', { name: 'Accessible free response' })).toBeInTheDocument()
  })

  it('tracks events on interaction', () => {
    const { rerender } = render(<FreeResponse id="free-1" label="Track me" />)

    currentValue = 'Tracked response'
    rerender(<FreeResponse id="free-1" label="Track me" />)

    fireEvent.blur(screen.getByLabelText('Track me'))

    expect(trackEvent).toHaveBeenCalledWith('free_response', {
      slug: 'test-training',
      pageIndex: 0,
      metadata: expect.objectContaining({
        componentId: 'free-1',
        responseText: 'Tracked response',
        responseLength: 16,
        label: 'Track me',
      }),
    })
  })
})

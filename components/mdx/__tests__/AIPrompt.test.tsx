import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AIPrompt } from '@/components/mdx/AIPrompt'
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
    REVEAL_TOGGLE: 'reveal_toggle',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('AIPrompt', () => {
  const mockSetValue = vi.fn()
  let currentValue = ''
  const mockWriteText = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = ''
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:ai-prompt')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])

    Object.defineProperty(global.navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    })
  })

  it('renders with required props', () => {
    render(<AIPrompt prompt="Explain event-driven architecture" />)

    expect(screen.getByText('AI Prompt')).toBeInTheDocument()
    expect(screen.getByText('Explain event-driven architecture')).toBeInTheDocument()
  })

  it('renders error state when prompt prop is missing', () => {
    // @ts-expect-error testing runtime behavior for missing required prop
    render(<AIPrompt />)

    expect(screen.getByText(/Missing required prop/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Copy prompt')).not.toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    render(<AIPrompt prompt="Copy this prompt" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }))

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Copy this prompt')
    })
  })

  it('has correct ARIA attributes', () => {
    render(<AIPrompt prompt="Accessibility check" />)

    expect(screen.getByRole('button', { name: 'Copy prompt' })).toBeInTheDocument()
  })

  it('tracks events on interaction', async () => {
    render(<AIPrompt prompt="Track copy event" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }))

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('reveal_toggle', {
        slug: 'test-training',
        metadata: expect.objectContaining({
          componentId: 'ai-prompt',
          action: 'copy',
          promptPreview: 'Track copy event',
        }),
      })
    })
  })
})

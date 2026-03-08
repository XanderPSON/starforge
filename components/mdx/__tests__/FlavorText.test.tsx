import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FlavorText } from '@/components/mdx/FlavorText'
import { useInteractive, getStorageKey } from '@/lib/storage'

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
    TEMPERATURE_CHECK: 'temperature_check',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('FlavorText', () => {
  const mockSetValue = vi.fn()
  let currentValue: { checked: boolean; timestamp: number | null }

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = { checked: false, timestamp: null }
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:flavor-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders error state when id prop is missing', () => {
    // @ts-expect-error testing runtime guard for missing required prop
    render(<FlavorText text="Missing id" />)

    expect(screen.getByText(/FlavorText Error: Missing required prop/i)).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
  })

  it('renders error state when text prop is missing', () => {
    // @ts-expect-error testing runtime guard for missing required prop
    render(<FlavorText id="flavor-1" />)

    expect(screen.getByText(/FlavorText Error: Missing required prop/i)).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('renders unchecked state with emoji and text', () => {
    render(<FlavorText id="flavor-1" emoji="✨" text="Unleash the flow" />)

    const checkbox = screen.getByRole('checkbox', { name: 'Unleash the flow' })
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('✨')).toBeInTheDocument()
    expect(screen.getByText('Unleash the flow')).toBeInTheDocument()
  })

  it('toggles to checked state on click and shows green checkbox', () => {
    const { rerender } = render(<FlavorText id="flavor-1" text="Click me" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Click me' })

    fireEvent.click(checkbox)

    expect(mockSetValue).toHaveBeenCalledWith(
      expect.objectContaining({ checked: true, timestamp: expect.any(Number) }),
    )

    currentValue = { checked: true, timestamp: Date.now() }
    rerender(<FlavorText id="flavor-1" text="Click me" />)

    expect(screen.getByRole('checkbox', { name: 'Click me' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('checkbox', { name: 'Click me' }).querySelector('.bg-emerald-500')).toBeTruthy()
  })

  it('toggles back to unchecked on second click', () => {
    currentValue = { checked: true, timestamp: Date.now() }
    const { rerender } = render(<FlavorText id="flavor-1" text="Toggle twice" />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Toggle twice' }))
    expect(mockSetValue).toHaveBeenCalledWith({ checked: false, timestamp: null })

    currentValue = { checked: false, timestamp: null }
    rerender(<FlavorText id="flavor-1" text="Toggle twice" />)

    expect(screen.getByRole('checkbox', { name: 'Toggle twice' })).toHaveAttribute('aria-checked', 'false')
  })

  it('supports keyboard accessibility with Enter and Space', () => {
    render(<FlavorText id="flavor-1" text="Keyboard toggle" />)
    const checkbox = screen.getByRole('checkbox', { name: 'Keyboard toggle' })

    fireEvent.keyDown(checkbox, { key: 'Enter' })
    fireEvent.keyDown(checkbox, { key: ' ' })

    expect(mockSetValue).toHaveBeenCalledTimes(2)
  })

  it('has correct ARIA attributes', () => {
    render(<FlavorText id="flavor-1" text="ARIA check" />)

    const checkbox = screen.getByRole('checkbox', { name: 'ARIA check' })
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    expect(checkbox).toHaveAttribute('role', 'checkbox')
  })

  it('respects max-w-lg constraint', () => {
    const { container } = render(<FlavorText id="flavor-1" text="Width check" />)

    expect(container.firstElementChild).toHaveClass('max-w-lg')
  })
})

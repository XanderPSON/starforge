import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TemperatureCheck } from '@/components/mdx/TemperatureCheck'
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

describe('TemperatureCheck', () => {
  const mockSetValue = vi.fn()
  let currentValue: number | null

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = null
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:temp-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders error state when id prop is missing', () => {
    // @ts-expect-error testing runtime guard for missing required prop
    render(<TemperatureCheck />)

    expect(screen.getByText(/TemperatureCheck Error: Missing required prop/i)).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
  })

  it('renders all 5 temperature options', () => {
    render(<TemperatureCheck id="temp-1" />)

    expect(screen.getByRole('button', { name: 'Confused' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Uncertain' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Neutral' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confident' })).toBeInTheDocument()
  })

  it('renders custom label text', () => {
    render(<TemperatureCheck id="temp-1" label="How clear was this chapter?" />)

    expect(screen.getByText('How clear was this chapter?')).toBeInTheDocument()
  })

  it('renders default label when no label prop', () => {
    render(<TemperatureCheck id="temp-1" />)

    expect(screen.getByText('How are you feeling about this section?')).toBeInTheDocument()
  })

  it('selecting an option marks it as pressed', () => {
    const { rerender } = render(<TemperatureCheck id="temp-1" />)

    fireEvent.click(screen.getByRole('button', { name: 'Content' }))
    expect(mockSetValue).toHaveBeenCalledWith(4)

    currentValue = 4
    rerender(<TemperatureCheck id="temp-1" />)

    expect(screen.getByRole('button', { name: 'Content' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Neutral' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('has correct group role and aria-label', () => {
    render(<TemperatureCheck id="temp-1" label="Confidence check" />)

    const group = screen.getByRole('group', { name: 'Confidence check' })
    expect(group).toBeInTheDocument()
    expect(group).toHaveAttribute('aria-label', 'Confidence check')
  })
})

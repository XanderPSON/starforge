import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Checklist } from '@/components/mdx/Checklist'
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
    CHECKLIST_TOGGLE: 'checklist_toggle',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('Checklist', () => {
  const mockSetValue = vi.fn()
  let currentValue: boolean[]

  const baseProps = {
    id: 'check-1',
    items: ['Install dependencies', 'Run tests'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = [false, false]
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:check-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders with required props', () => {
    render(<Checklist {...baseProps} />)

    expect(screen.getByLabelText('Install dependencies')).toBeInTheDocument()
    expect(screen.getByLabelText('Run tests')).toBeInTheDocument()
  })

  it('renders error state when required props are missing', () => {
    render(<Checklist id="" items={[]} />)

    expect(screen.getByText(/Checklist Error: Missing required props/i)).toBeInTheDocument()
    expect(screen.getByText('id, items')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const { rerender } = render(<Checklist {...baseProps} />)

    fireEvent.click(screen.getByLabelText('Install dependencies'))

    expect(mockSetValue).toHaveBeenCalledWith([true, false])

    currentValue = [true, false]
    rerender(<Checklist {...baseProps} />)

    expect(screen.getByText('1 of 2 completed')).toBeInTheDocument()
  })

  it('has correct ARIA attributes', () => {
    render(<Checklist {...baseProps} />)

    const firstCheckbox = screen.getByRole('checkbox', { name: 'Install dependencies' })
    expect(firstCheckbox).toHaveAttribute('id', 'check-1-item-0')
    expect(firstCheckbox).not.toBeChecked()
  })

  it('tracks events on interaction', () => {
    render(<Checklist {...baseProps} />)

    fireEvent.click(screen.getByLabelText('Install dependencies'))

    expect(trackEvent).toHaveBeenCalledWith('checklist_toggle', {
      slug: 'test-training',
      pageIndex: 0,
      metadata: {
        componentId: 'check-1',
        itemIndex: 0,
        itemText: 'Install dependencies',
        checked: true,
        completedCount: 1,
        totalCount: 2,
        allComplete: false,
      },
    })
  })
})

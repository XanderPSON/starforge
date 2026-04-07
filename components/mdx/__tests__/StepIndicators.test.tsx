import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HumanStep } from '@/components/mdx/HumanStep'
import { HybridStep } from '@/components/mdx/HybridStep'
import { trackEvent } from '@/lib/event-tracking'

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-training' }),
}))

vi.mock('@/lib/event-tracking', () => ({
  trackEvent: vi.fn(),
  usePageIndex: () => 0,
  LEARNING_EVENT_TYPES: {
    PAGE_VIEW: 'page_view',
  },
}))

describe('HumanStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders instruction text', () => {
    const instruction = 'Follow these steps carefully'
    render(<HumanStep instruction={instruction} />)

    expect(screen.getByText(instruction)).toBeInTheDocument()
  })

  it('renders header label', () => {
    render(<HumanStep instruction="Test instruction" />)

    expect(screen.getByText('Human Step')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const { container } = render(
      <HumanStep instruction="Test" className="custom-class" />
    )

    const rootDiv = container.firstElementChild
    expect(rootDiv).toHaveClass('custom-class')
  })

  it('is not clickable/interactive', () => {
    const { container } = render(<HumanStep instruction="Test instruction" />)

    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(0)

    const rootDiv = container.firstElementChild
    expect(rootDiv).not.toHaveClass('cursor-pointer')
  })

  it('applies correct color theme', () => {
    const { container } = render(<HumanStep instruction="Test instruction" />)

    const headerDiv = container.querySelector('.bg-gradient-to-r')
    expect(headerDiv).toHaveClass('from-blue-600')
    expect(headerDiv).toHaveClass('to-teal-600')
  })

  it('tracks view event on mount', () => {
    render(<HumanStep instruction="Test instruction" />)

    expect(trackEvent).toHaveBeenCalledWith(
      'page_view',
      expect.objectContaining({
        slug: 'test-training',
        metadata: expect.objectContaining({
          componentId: 'human-step',
          action: 'view',
        }),
      })
    )
  })
})

describe('HybridStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders instruction text', () => {
    const instruction = 'Use AI assistance for this step'
    render(<HybridStep instruction={instruction} />)

    expect(screen.getByText(instruction)).toBeInTheDocument()
  })

  it('renders header label', () => {
    render(<HybridStep instruction="Test instruction" />)

    expect(screen.getByText('Human + AI')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const { container } = render(
      <HybridStep instruction="Test" className="custom-class" />
    )

    const rootDiv = container.firstElementChild
    expect(rootDiv).toHaveClass('custom-class')
  })

  it('is not clickable/interactive', () => {
    const { container } = render(<HybridStep instruction="Test instruction" />)

    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(0)

    const rootDiv = container.firstElementChild
    expect(rootDiv).not.toHaveClass('cursor-pointer')
  })

  it('applies correct color theme', () => {
    const { container } = render(<HybridStep instruction="Test instruction" />)

    const headerDiv = container.querySelector('.bg-gradient-to-r')
    expect(headerDiv).toHaveClass('from-amber-600')
    expect(headerDiv).toHaveClass('to-orange-600')
  })

  it('tracks view event on mount', () => {
    render(<HybridStep instruction="Test instruction" />)

    expect(trackEvent).toHaveBeenCalledWith(
      'page_view',
      expect.objectContaining({
        slug: 'test-training',
        metadata: expect.objectContaining({
          componentId: 'hybrid-step',
          action: 'view',
        }),
      })
    )
  })
})

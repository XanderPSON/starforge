import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MultipleChoice } from '@/components/mdx/MultipleChoice'
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
    MULTIPLE_CHOICE: 'multiple_choice',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('MultipleChoice', () => {
  const mockSetValue = vi.fn()
  let currentValue: string | null

  const baseProps = {
    id: 'mc-1',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5'],
    correctAnswer: '4',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = null
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:mc-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders with required props', () => {
    render(<MultipleChoice {...baseProps} />)

    expect(screen.getByText('🤔 What is 2 + 2?')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '4' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '5' })).toBeInTheDocument()
  })

  it('renders error state when required props are missing', () => {
    render(<MultipleChoice id="" question="" options={[]} correctAnswer="" />)

    expect(screen.getByText(/MultipleChoice Error: Missing required props/i)).toBeInTheDocument()
    expect(screen.getByText('id, question, options, correctAnswer')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const { rerender } = render(<MultipleChoice {...baseProps} />)

    fireEvent.click(screen.getByRole('radio', { name: '4' }))
    expect(mockSetValue).toHaveBeenCalledWith('4')

    currentValue = '4'
    rerender(<MultipleChoice {...baseProps} />)

    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    render(<MultipleChoice {...baseProps} />)

    const option = screen.getByRole('radio', { name: '3' })
    fireEvent.keyDown(option, { key: 'Enter' })
    fireEvent.keyDown(option, { key: ' ' })

    expect(mockSetValue).toHaveBeenCalledTimes(2)
  })

  it('has correct ARIA attributes', () => {
    render(<MultipleChoice {...baseProps} />)

    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('aria-labelledby', 'question-mc-1')
    expect(screen.getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'false')
  })

  it('tracks events on interaction', () => {
    render(<MultipleChoice {...baseProps} />)

    fireEvent.click(screen.getByRole('radio', { name: '3' }))

    expect(trackEvent).toHaveBeenCalledWith('multiple_choice', {
      slug: 'test-training',
      pageIndex: 0,
      metadata: {
        componentId: 'mc-1',
        question: 'What is 2 + 2?',
        selectedAnswer: '3',
        isCorrect: false,
      },
    })
  })
})

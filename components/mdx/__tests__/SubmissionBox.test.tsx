import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubmissionBox } from '@/components/mdx/SubmissionBox'
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
    SUBMISSION: 'submission',
  },
}))

vi.mock('@/components/ComponentRegistryProvider', () => ({
  useComponentRegistry: () => ({ activeIds: new Set() }),
}))

describe('SubmissionBox', () => {
  const mockSetValue = vi.fn()
  let currentValue: { draft: string; isSubmitted: boolean }

  beforeEach(() => {
    vi.clearAllMocks()
    currentValue = { draft: '', isSubmitted: false }
    vi.mocked(getStorageKey).mockReturnValue('codelab:test-training:submit-1')
    vi.mocked(useInteractive).mockImplementation(() => [currentValue, mockSetValue, true])
  })

  it('renders with required props', () => {
    render(<SubmissionBox id="submit-1" label="Final answer" />)

    expect(screen.getByLabelText('Final answer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })

  it('renders error state when id prop is missing', () => {
    // @ts-expect-error testing runtime guard for missing required prop
    render(<SubmissionBox label="Missing id" />)

    expect(screen.getByText(/SubmissionBox Error: Missing required prop/i)).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const { rerender } = render(<SubmissionBox id="submit-1" label="Final answer" />)

    fireEvent.change(screen.getByLabelText('Final answer'), { target: { value: 'Draft response' } })
    expect(mockSetValue).toHaveBeenCalledWith({ draft: 'Draft response', isSubmitted: false })

    currentValue = { draft: 'Draft response', isSubmitted: false }
    rerender(<SubmissionBox id="submit-1" label="Final answer" />)
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(mockSetValue).toHaveBeenCalledWith({ draft: 'Draft response', isSubmitted: true })

    currentValue = { draft: 'Draft response', isSubmitted: true }
    rerender(<SubmissionBox id="submit-1" label="Final answer" />)

    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByLabelText('Final answer')).toHaveAttribute('readonly')
  })

  it('has correct ARIA attributes', () => {
    render(<SubmissionBox id="submit-1" />)

    expect(screen.getByRole('textbox', { name: 'Submission for submit-1' })).toBeInTheDocument()
  })

  it('tracks events on interaction', () => {
    const { rerender } = render(<SubmissionBox id="submit-1" label="Final answer" />)

    currentValue = { draft: 'Ready to submit', isSubmitted: false }
    rerender(<SubmissionBox id="submit-1" label="Final answer" />)
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(trackEvent).toHaveBeenCalledWith('submission', {
      slug: 'test-training',
      pageIndex: 0,
      metadata: expect.objectContaining({
        componentId: 'submit-1',
        action: 'submit',
        responseText: 'Ready to submit',
      }),
    })

    currentValue = { draft: 'Ready to submit', isSubmitted: true }
    rerender(<SubmissionBox id="submit-1" label="Final answer" />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit submission' }))

    expect(trackEvent).toHaveBeenCalledWith('submission', {
      slug: 'test-training',
      pageIndex: 0,
      metadata: {
        componentId: 'submit-1',
        action: 'edit',
      },
    })
  })
})

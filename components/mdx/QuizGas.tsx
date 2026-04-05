'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizGas({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Why does gas exist on blockchain networks like Base and Ethereum?"
      options={[
        "To make contract storage faster than RAM",
        "To prevent spam/DoS by pricing computation",
        "To hide transaction details from explorers",
        "To guarantee every transaction succeeds"
      ]}
      correctAnswer="To prevent spam/DoS by pricing computation"
    />
  )
}

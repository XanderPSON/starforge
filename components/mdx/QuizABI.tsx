'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizABI({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="In encoded calldata, what do the first 4 bytes represent?"
      options={[
        "The chain ID of the destination network",
        "The gas limit chosen by the wallet",
        "The function selector derived from the function signature hash",
        "The first argument passed into the function"
      ]}
      correctAnswer="The function selector derived from the function signature hash"
    />
  )
}

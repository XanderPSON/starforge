'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizBlockExplorer({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="On BaseScan, a transaction's Input Data shows '0x54888f55...' on a verified contract. What does this hex data represent?"
      options={[
        "The sender's wallet address in compressed format",
        "The encoded function call — a 4-byte selector plus ABI-encoded arguments",
        "The gas price the sender chose for this transaction",
        "A hash of the contract's full source code"
      ]}
      correctAnswer="The encoded function call — a 4-byte selector plus ABI-encoded arguments"
    />
  )
}

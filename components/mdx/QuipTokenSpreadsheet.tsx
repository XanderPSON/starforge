'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipTokenSpreadsheet({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="When Alice 'sends' 100 tokens to Bob, what actually happens onchain?"
      options={[
        "A digital coin flies from Alice's wallet to Bob's wallet",
        "Two rows in a mapping update: Alice −100, Bob +100",
        "The token contract mints 100 new tokens for Bob",
        "Alice's wallet emails Bob's wallet"
      ]}
      correctAnswer="Two rows in a mapping update: Alice −100, Bob +100"
    />
  )
}

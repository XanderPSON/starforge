'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizTokenMentalModel({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="When Alice 'sends' 100 tokens to Bob, what actually happens onchain?"
      options={[
        "A token object moves from Alice's wallet to Bob's wallet",
        "The contract updates two storage entries: Alice's balance decreases, Bob's increases",
        "A new contract is deployed with Bob as the owner of those tokens",
        "The tokens are burned from Alice and re-minted to Bob at a new address"
      ]}
      correctAnswer="The contract updates two storage entries: Alice's balance decreases, Bob's increases"
    />
  )
}

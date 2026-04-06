'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipBlockchainAsDB({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="In the 'blockchain as database' mental model, what replaces your ORM?"
      options={[
        "GraphQL",
        "Viem",
        "A really long SQL query",
        "Stack Overflow"
      ]}
      correctAnswer="Viem"
    />
  )
}

'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizGasMechanics({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="You submit a transaction with a gas limit of 100,000, but execution requires 120,000 gas. What happens?"
      options={[
        "The transaction completes but you're charged the extra 20,000 gas as a penalty",
        "The transaction reverts and you lose the gas consumed up to the limit",
        "The network automatically increases your gas limit to cover the difference",
        "The transaction is held in the mempool until gas prices drop low enough"
      ]}
      correctAnswer="The transaction reverts and you lose the gas consumed up to the limit"
    />
  )
}

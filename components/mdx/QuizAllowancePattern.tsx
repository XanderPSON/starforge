'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizAllowancePattern({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Why must a user call approve() before a market contract can use transferFrom()?"
      options={[
        "approve() lowers gas fees for all future transactions",
        "approve() grants explicit permission for that spender to move tokens",
        "approve() transfers tokens immediately to the spender",
        "approve() verifies the token contract source code"
      ]}
      correctAnswer="approve() grants explicit permission for that spender to move tokens"
    />
  )
}

'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizReadsVsWrites({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Your API route calls a contract's markets(0) function to fetch prediction market data. Does this cost gas?"
      options={[
        "Yes — every interaction with a smart contract requires gas",
        "No — read-only calls are free; only state-changing transactions cost gas",
        "It depends on how many times you call the function per minute",
        "No — gas is only charged when deploying new contracts"
      ]}
      correctAnswer="No — read-only calls are free; only state-changing transactions cost gas"
    />
  )
}

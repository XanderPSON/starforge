'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizPariMutuel({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="In a pari-mutuel market with yesPool = 100 tokens and noPool = 50 tokens, what happens when a YES voter wins?"
      options={[
        "They get exactly 1x their stake back",
        "They split the losing pool proportionally, plus get their stake back",
        "They get a fixed 2x payout regardless of pool sizes",
        "The contract owner decides their payout amount"
      ]}
      correctAnswer="They split the losing pool proportionally, plus get their stake back"
    />
  )
}

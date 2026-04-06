'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizAsyncUX({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="A user clicks 'Vote' on your dApp and receives a transaction hash. What does this mean?"
      options={[
        "The vote is confirmed and the contract state has been updated",
        "The transaction was submitted but hasn't been included in a block yet",
        "The gas fee was calculated and deducted from the user's wallet",
        "The smart contract has validated and accepted the vote"
      ]}
      correctAnswer="The transaction was submitted but hasn't been included in a block yet"
    />
  )
}

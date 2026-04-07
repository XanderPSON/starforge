'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizPariMutuel({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="You deploy a prediction market contract and discover a bug in the payout logic. What can you do?"
      options={[
        "Push a hotfix to the contract and redeploy to the same address",
        "Nothing — deployed contract code is immutable; you must deploy a new contract",
        "Ask the network validators to approve an emergency patch",
        "Use an admin function to swap out the contract bytecode"
      ]}
      correctAnswer="Nothing — deployed contract code is immutable; you must deploy a new contract"
    />
  )
}

'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizSmartContractBasics({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="What makes smart contracts fundamentally different from typical Web2 services?"
      options={[
        "They can be patched in production without redeploying",
        "They execute deterministically and deployed code is immutable",
        "They rely on centralized databases for final state",
        "They are always free to write and update"
      ]}
      correctAnswer="They execute deterministically and deployed code is immutable"
    />
  )
}

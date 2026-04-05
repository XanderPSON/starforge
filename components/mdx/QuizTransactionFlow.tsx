'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizTransactionFlow({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="What is the correct high-level order when a user submits an onchain vote?"
      options={[
        "Send to node → prepare calldata → finality → sign",
        "Prepare calldata → sign in wallet → send transaction → wait for inclusion/finality",
        "Sign in wallet → wait for finality → prepare calldata → send",
        "Prepare calldata → finality → sign → send"
      ]}
      correctAnswer="Prepare calldata → sign in wallet → send transaction → wait for inclusion/finality"
    />
  )
}

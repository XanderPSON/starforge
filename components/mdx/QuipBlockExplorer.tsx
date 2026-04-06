'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipBlockExplorer({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Which of these blockchain operations is free?"
      options={[
        "Deploying a contract",
        "Sending tokens to a friend",
        "Reading contract state",
        "Everything — it's decentralized, man"
      ]}
      correctAnswer="Reading contract state"
    />
  )
}

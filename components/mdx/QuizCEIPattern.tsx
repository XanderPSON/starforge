'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizCEIPattern({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Which order correctly applies the CEI security pattern in a state-changing function?"
      options={[
        "Interactions → Checks → Effects",
        "Effects → Checks → Interactions",
        "Checks → Effects → Interactions",
        "Checks → Interactions → Effects"
      ]}
      correctAnswer="Checks → Effects → Interactions"
    />
  )
}

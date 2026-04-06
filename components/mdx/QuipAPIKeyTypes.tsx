'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipAPIKeyTypes({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Why does CDP have both Client and Secret API keys?"
      options={[
        "Client keys are for frontend code (safe to expose); Secret keys are server-side only",
        "They're the same thing with different names",
        "Client keys are free; Secret keys cost money",
        "Client keys only work on weekdays"
      ]}
      correctAnswer="Client keys are for frontend code (safe to expose); Secret keys are server-side only"
    />
  )
}

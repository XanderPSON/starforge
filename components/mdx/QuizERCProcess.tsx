'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizERCProcess({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="What is the relationship between EIPs and ERCs?"
      options={[
        "They are the same thing — just different names for Ethereum standards",
        "EIPs cover core protocol changes; ERCs standardize application-level patterns like token interfaces",
        "ERCs must be approved by the Ethereum Foundation before anyone can use them",
        "EIPs are for tokens only; ERCs are for smart contract security"
      ]}
      correctAnswer="EIPs cover core protocol changes; ERCs standardize application-level patterns like token interfaces"
    />
  )
}

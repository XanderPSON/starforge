'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipERCProcess({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="How is a new ERC standard proposed?"
      options={[
        "Vitalik writes it and everyone follows",
        "Anyone opens a pull request on the public ethereum/EIPs repo",
        "A secret committee votes behind closed doors",
        "You have to own at least 32 ETH to submit one"
      ]}
      correctAnswer="Anyone opens a pull request on the public ethereum/EIPs repo"
    />
  )
}

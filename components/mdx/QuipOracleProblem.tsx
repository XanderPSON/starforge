'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipOracleProblem({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="In your PredictionMarket contract, who is the oracle that decides who won?"
      options={[
        "Chainlink — it's always Chainlink",
        "You. You literally made yourself the single source of truth.",
        "The Ethereum Foundation",
        "Nobody — blockchains already know everything"
      ]}
      correctAnswer="You. You literally made yourself the single source of truth."
    />
  )
}

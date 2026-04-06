'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizOracleProblem({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="What is the main risk of using a single owner address as the oracle to resolve prediction markets?"
      options={[
        "The owner pays higher gas fees than other users",
        "The owner can resolve markets dishonestly and steal all funds",
        "The owner's transactions take longer to confirm on the network",
        "The owner cannot create new markets after resolving one"
      ]}
      correctAnswer="The owner can resolve markets dishonestly and steal all funds"
    />
  )
}

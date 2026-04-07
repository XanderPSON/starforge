'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizTokenStandards({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="You're building a game where players can own both fungible gold coins AND unique legendary weapons in a single contract. Which token standard fits best?"
      options={[
        "ERC-20 — it handles any kind of token with balances",
        "ERC-721 — each item needs a unique ID",
        "ERC-1155 — it manages multiple token types (fungible and non-fungible) in one contract",
        "Deploy separate ERC-20 and ERC-721 contracts and link them"
      ]}
      correctAnswer="ERC-1155 — it manages multiple token types (fungible and non-fungible) in one contract"
    />
  )
}

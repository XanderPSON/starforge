'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizTokenStandards({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Which token standard is best for a fungible currency like USDC?"
      options={["ERC-20", "ERC-721", "ERC-1155", "ERC-4626"]}
      correctAnswer="ERC-20"
    />
  )
}

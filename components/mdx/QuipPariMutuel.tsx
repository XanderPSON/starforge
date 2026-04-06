'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipPariMutuel({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="If yesPool has 100 tokens and noPool has 50, which side gives a BETTER payout if it wins?"
      options={[
        "Yes — bigger pool means bigger prize",
        "No — fewer bettors means a larger share of the pot",
        "Both sides pay the same regardless",
        "Neither — the house always wins"
      ]}
      correctAnswer="No — fewer bettors means a larger share of the pot"
    />
  )
}

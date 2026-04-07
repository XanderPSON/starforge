'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizOnchainErrors({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Your wallet shows 'Unable to estimate network fee' when you try to call createMarket(). What is the most likely cause?"
      options={[
        "You don't have enough ETH to pay for gas",
        "The Base Sepolia network is congested and fees are too high",
        "A require/revert in the contract is failing, and the wallet misreports it as a gas error",
        "The contract hasn't been verified on BaseScan yet"
      ]}
      correctAnswer="A require/revert in the contract is failing, and the wallet misreports it as a gas error"
    />
  )
}

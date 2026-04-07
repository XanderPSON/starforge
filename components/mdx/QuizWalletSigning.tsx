'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizWalletSigning({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="When you click 'Vote' and your wallet pops up, what happens to your private key?"
      options={[
        "It's sent to the dApp so it can submit the transaction on your behalf",
        "It never leaves your device — the wallet signs the transaction locally and sends only the signature",
        "It's temporarily shared with the blockchain node to verify your identity",
        "It's encrypted and stored in the smart contract for future transactions"
      ]}
      correctAnswer="It never leaves your device — the wallet signs the transaction locally and sends only the signature"
    />
  )
}

'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipProxyPattern({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="How do production teams 'upgrade' an immutable smart contract?"
      options={[
        "They edit the bytecode directly on the blockchain",
        "They deploy a Proxy that delegates to a replaceable Implementation contract",
        "They ask Ethereum validators to approve a hotfix",
        "They redeploy and hope everyone switches"
      ]}
      correctAnswer="They deploy a Proxy that delegates to a replaceable Implementation contract"
    />
  )
}

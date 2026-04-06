'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipJSONRPC({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Under the hood, every useReadContract call becomes which JSON-RPC method?"
      options={[
        "eth_sendRawTransaction",
        "eth_call",
        "eth_getBalance",
        "eth_vibeCheck"
      ]}
      correctAnswer="eth_call"
    />
  )
}

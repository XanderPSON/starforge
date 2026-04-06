'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuipMulticall({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Why use useReadContracts (multicall) instead of separate RPC calls for each market?"
      options={[
        "It makes the code look fancier",
        "It batches reads into one request, avoiding rate limits and reducing latency",
        "Individual read calls cost gas",
        "JavaScript can only make one fetch() at a time"
      ]}
      correctAnswer="It batches reads into one request, avoiding rate limits and reducing latency"
    />
  )
}

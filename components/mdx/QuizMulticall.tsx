'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizMulticall({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="Your dashboard aggregates 8 pod markets. Without multicall, how many RPC requests do you need vs. with multicall?"
      options={[
        "8 vs. 8 — multicall doesn't reduce requests",
        "8 vs. 1 — multicall batches all reads into a single request",
        "1 vs. 8 — multicall splits reads across more requests for reliability",
        "8 vs. 0 — multicall eliminates RPC calls entirely by caching"
      ]}
      correctAnswer="8 vs. 1 — multicall batches all reads into a single request"
    />
  )
}

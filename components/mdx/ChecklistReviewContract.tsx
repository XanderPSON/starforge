'use client'

import { Checklist } from './Checklist'
import { Code } from './CodeBlock'

export function ChecklistReviewContract({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        <>All 12 tests pass (<Code>forge test</Code>)</>,
        <><Code>vote()</Code> follows the CEI pattern (Checks first, then state updates, then external calls)</>,
        <><Code>resolveMarket()</Code> is restricted to <Code>onlyOwner</Code></>,
        <><Code>createMarket</Code> emits a <Code>MarketCreated</Code> event</>,
        <>Custom errors used (not <Code>require</Code> strings)</>,
      ]}
    />
  )
}

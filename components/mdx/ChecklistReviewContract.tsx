'use client'

import { Checklist } from './Checklist'

export function ChecklistReviewContract({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        <>All 12 tests pass (<code>forge test</code>)</>,
        <><code>vote()</code> follows the CEI pattern (Checks first, then state updates, then external calls)</>,
        <><code>resolveMarket()</code> is restricted to <code>onlyOwner</code></>,
        <><code>createMarket</code> emits a <code>MarketCreated</code> event</>,
        <>Custom errors used (not <code>require</code> strings)</>,
      ]}
    />
  )
}

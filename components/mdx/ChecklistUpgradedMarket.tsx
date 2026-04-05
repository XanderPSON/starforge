'use client'

import { Checklist } from './Checklist'

export function ChecklistUpgradedMarket({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        <>Constructor accepts both <code>owner_</code> and <code>token_</code> addresses</>,
        <><code>vote()</code> still follows the CEI pattern (<code>transferFrom</code> should be <em>after</em> state updates)</>,
        <>Allowance check before the transfer</>,
        <><code>forge build</code> succeeds</>,
      ]}
    />
  )
}

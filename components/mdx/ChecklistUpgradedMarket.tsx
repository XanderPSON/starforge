'use client'

import { Checklist } from './Checklist'
import { Code } from './CodeBlock'

export function ChecklistUpgradedMarket({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        <>Constructor accepts both <Code>owner_</Code> and <Code>token_</Code> addresses</>,
        <><Code>vote()</Code> still follows the CEI pattern (<Code>transferFrom</Code> should be <em>after</em> state updates)</>,
        <>Allowance check before the transfer</>,
        <><Code>forge build</Code> succeeds</>,
      ]}
    />
  )
}

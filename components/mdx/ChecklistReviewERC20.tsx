'use client'

import { Checklist } from './Checklist'
import { Code } from './CodeBlock'

export function ChecklistReviewERC20({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        <>Implements all 9 required functions (<Code>name</Code>, <Code>symbol</Code>, <Code>decimals</Code>, <Code>totalSupply</Code>, <Code>balanceOf</Code>, <Code>transfer</Code>, <Code>approve</Code>, <Code>allowance</Code>, <Code>transferFrom</Code>)</>,
        <><Code>transfer</Code> checks that the sender has sufficient balance</>,
        <>Emits <Code>Transfer</Code> and <Code>Approval</Code> events</>,
        <><Code>forge build</Code> succeeds</>,
      ]}
    />
  )
}

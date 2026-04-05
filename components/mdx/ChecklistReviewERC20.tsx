'use client'

import { Checklist } from './Checklist'

export function ChecklistReviewERC20({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        <>Implements all 9 required functions (<code>name</code>, <code>symbol</code>, <code>decimals</code>, <code>totalSupply</code>, <code>balanceOf</code>, <code>transfer</code>, <code>approve</code>, <code>allowance</code>, <code>transferFrom</code>)</>,
        <><code>transfer</code> checks that the sender has sufficient balance</>,
        <>Emits <code>Transfer</code> and <code>Approval</code> events</>,
        <><code>forge build</code> succeeds</>,
      ]}
    />
  )
}

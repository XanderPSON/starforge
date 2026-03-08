'use client'

import { Checklist } from './Checklist'

export function ChecklistWorkshopActivity({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        "App running on localhost:3000",
        "Wallet connected on Base Sepolia",
        "Can view odds for all pod markets",
        "Successfully voted on a pod-mate's market",
        "Odds updated after voting",
        "App deployed to Vercel",
        "Shared deployment URL with pod"
      ]}
    />
  )
}

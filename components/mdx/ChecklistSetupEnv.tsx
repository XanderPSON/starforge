'use client'

import { Checklist } from './Checklist'

export function ChecklistSetupEnv({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        "Coinbase Wallet installed",
        "Switched to Base Sepolia",
        "Got testnet ETH",
        "Node.js v18+ installed",
        "Foundry installed",
        "Wallet imported to Foundry",
        "Etherscan API key saved",
        "WalletConnect Project ID saved"
      ]}
    />
  )
}

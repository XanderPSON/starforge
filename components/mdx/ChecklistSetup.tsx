'use client'

import { Checklist } from './Checklist'

export function ChecklistSetup({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        "Coinbase Wallet installed and switched to Base Sepolia",
        "Testnet ETH acquired from faucet",
        "Node.js v18+ and npm working",
        "Foundry installed (forge, cast, anvil all verified)",
        "Wallet private key imported into Foundry (cast wallet import dev)",
        "Etherscan API key saved",
        "WalletConnect Project ID saved"
      ]}
    />
  )
}

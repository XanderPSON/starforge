# 🧠 Intro to Onchain Development

_Learn the fundamentals of EVM-based onchain development through a Decentralized Prediction Market_

## 📚 Workshop Overview

This hands-on workshop introduces L3/L4 engineers to smart contract and onchain development through a **highly interactive paradigm**: a **Decentralized Prediction Market** with a custom token economy and an aggregator dashboard. You'll build real contracts, deploy your own tokens, and create a fullstack app that aggregates data from your entire pod.

### 🎯 Why This Workshop?

On-chain development is core to Coinbase's mission and products. This workshop builds real, transferable understanding of the technology — not just conceptual awareness, but hands-on experience with the same patterns used in production.

By the end, you'll have deployed a full-stack prediction market with custom tokens and an aggregator dashboard. The patterns you'll use — CEI (Checks-Effects-Interactions), the ERC-20 Allowance Pattern, multicall data aggregation, transaction batching — are the exact same architecture behind Uniswap, Aave, Polymarket, and Coinbase's own products.

You don't need prior blockchain experience. If you can write code and use a CLI, you have everything you need to start.

## 🧩 Learning Philosophy

- 🛠️ **Learn by Building** – Every concept is immediately applied in code
- 🤝 **Pod-Powered** – Work in pods; your code depends on your neighbors' deployments (the **Cross-Wire** mechanic)
- 📈 **Progressive Complexity** – Each module builds on the last
- 🤖 **AI-Driven Development** – Prompt AI to generate code from architectural requirements, review the output, then deploy — the same workflow used in production
- 🌐 **Real-World Application** – Deploy actual contracts, tokens, and UIs to Base Sepolia

> [!TIP]
> This workshop is designed so each module builds on the last. Complete them in order — your Part 1 contract is used in Part 2, and both feed into Part 3.

## 🗂️ Workshop Structure

### 🛠️ Pre-Workshop: Environment Setup

🎯 **Goal**: Get everyone's development environment ready.
- Wallet setup (Coinbase Wallet) and testnet ETH acquisition via faucets.
- Development tool verification (Foundry, Node.js).
- AI Assistant setup (Cursor / Copilot).

### 🔐 Part 1: Smart Contracts
🎯 **Goal**: Understand, write, and deploy your own Prediction Market.
- **Solidity Fundamentals:** Structs, nested mappings, and the Checks-Effects-Interactions pattern.
- **BaseScan Radar:** Navigate the block explorer to read raw onchain state and "spy" on transaction payloads.
- **The Oracle Problem:** Understand how blockchains handle external real-world data and access control.

### 🪙 Part 2: Token Standards
🎯 **Goal**: Create an ERC-20 token and integrate it into your market.
- **Interface Implementation:** Build an ERC-20 token from scratch.
- **The Allowance Pattern:** Master the crucial two-step `approve` and `transferFrom` flow to handle Web3 payments securely.
- **Token Economies:** Airdrop your custom currency to your pod-mates and require it for placing wagers.

### 🌐 Part 3: Onchain Fullstack
🎯 **Goal**: Build a React dashboard that aggregates your pod's deployed infrastructure.
- **Data Aggregation:** Use Wagmi's `useReadContracts` to fetch state from the entire table's smart contracts simultaneously.
- **Writing State:** Use OnchainKit's `<Transaction>` components to batch approvals and votes into a single user action.
- **Modern Web3 UX:** Handle real-time blockchain data updates, wallet connections, and block confirmations gracefully.

## 📏 Success Metrics

By workshop completion, you will be able to:

- ✅ Read, write, and understand Solidity fundamentals
- ✅ Deploy and verify contracts to Base Sepolia with the BaseScan block explorer
- ✅ Create ERC-20 tokens and understand the allowance flow
- ✅ Build web apps that read from multiple contracts

## 💻 Technical Requirements

- Basic familiarity with CLI
- Familiarity with TypeScript/React or AI-driven development
- A Web3 wallet installed in your browser (Coinbase Wallet extension recommended).

## 🚦 Before We Get Started

Please remember to:

> [!IMPORTANT]
> Your code **depends on your pod-mates' deployments** (the Cross-Wire mechanic). Communicate constantly — share addresses, swap tokens, and debug together.

- ⏰ **Be Prompt** – Be ready to start each session on time
- 🤝 **Talk to Your Pod** – Your code depends on your pod-mates' deployments, so communicate constantly
- 🙌 **Help Each Other** – Share knowledge, swap testnet tokens, and debug errors together

## 🆘 Getting Help

1. 👥 **Pod Members** – Ask your pod first
2. 🧑‍🏫 **Mentors** – Raise your hand for assistance
3. 🤖 **AI** – A great way to get custom-tailored explanations
4. 🛠️ **[Troubleshooting Guide](./troubleshooting.md)** – Check out the guide for common issues

> [!NOTE]
> Everyone gets stuck sometimes. The important thing is getting unstuck together!

---

🛠️ _Ready to build onchain? Start with **[⚙️ Environment Setup](./00-setup.md)**_

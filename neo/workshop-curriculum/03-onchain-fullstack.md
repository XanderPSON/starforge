---
description: Build a React dashboard that reads from and writes to your pod's smart contracts using Wagmi, Viem, and OnchainKit.
duration: 105
---

# 🌐 Part 3: Onchain Fullstack (105 min)

_Build an Aggregated Prediction Market Dashboard_

### 🎯 Learning Goals

By the end of this part, you'll be able to:

- ✅ Build a server-side API route that reads smart contract data using Viem
- ✅ Build a React component that fetches onchain data using Wagmi hooks
- ✅ Batch multiple contract calls (approve + vote) into a single user action
- ✅ Handle real-time blockchain data updates in a modern React app

### 🏗️ Module Blueprint: What We Provide vs. What You Build

* **📦 Pre-Built (scaffold — don't rewrite these):**
    - Next.js boilerplate with Tailwind CSS, OnchainKit, and Wagmi providers
    - Wallet connection UI (`<Wallet>` + `<ConnectWallet>`)
    - Chain auto-switching to Base Sepolia
    - Contract ABIs in `lib/contracts.ts`
    - Pod configuration type in `lib/podConfig.ts`
    - Page layout with card grid in `app/page.tsx`
* **🛠️ What You Will Build:**
    1. **Backend** — A Next.js API route that reads market data from the blockchain using Viem
    2. **Frontend** — The `MarketCard` component that displays live odds and vote status using Wagmi
    3. **Transactions** — Vote buttons that batch `approve` + `vote` using OnchainKit's `<Transaction>`
* **🤖 AI-Driven Development:** You will prompt AI to generate the API route, React component, and transaction wiring, then review the output against the app's architecture.
* **🤝 Pod Collaboration:** **The Cross-Wire.** The app aggregates your entire pod's markets. Start with your own addresses — the dashboard works with any number of markets — but it gets more interesting as you add pod-mates' contracts.

> [!TIP]
> When you first run the app, you'll see a setup checklist on screen. As you complete each task, the app progressively comes to life — from checklist → placeholder cards → live data → working vote buttons.

### 🆘 Need Help?

Check out the **[Troubleshooting Guide](./troubleshooting)** for wallet connections, multicall issues, and **[Module 3](./troubleshooting#module-3-app-issues)** specific issues.

---

## 🔌 The Cross-Wire: Aggregate Your Pod (5 min)

### 🤝 What is the Cross-Wire?

Instead of building an app that only shows **your** contract, you'll build an **Aggregator Dashboard** that shows **all markets** from your pod. The app works with just your own addresses — each market renders as its own card, and you can add more at any time. The more you add, the richer the dashboard.

**You need from each podmate:**

1. **Market contract address** (their deployed PredictionMarket)
2. **Token contract address** (their custom ERC-20)



---

## ⚙️ Quick Setup (10 min)

### 🚀 Get the App Running

1. **Clone and Install** — this is a separate repo ([**neo-workshop-fullstack**](https://github.com/XanderPSON/neo-workshop-fullstack)) from the contracts repo you used in Parts 1 & 2.

    ```copy
    git clone -b xander/prediction-market-starter https://github.com/XanderPSON/neo-workshop-fullstack.git
    cd neo-workshop-fullstack
    npm install
    ```

2. **Configure Environment**

    Create `.env.local` in the project root:

    ```copy
    # OnchainKit API Key — use the CDP **Client API Key** from Step 6 of setup.
    # (Not the Secret API Key — Client keys are safe for frontend code.)
    NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_client_api_key_here

    # Your dev wallet private key (the same one from Parts 1 & 2).
    # Used server-side only for admin operations like creating markets programmatically.
    # Get it with: cast wallet private-key "YOUR TWELVE WORD RECOVERY PHRASE"
    PRIVATE_KEY=0x..your_private_key_here..

    # RPC
    BASE_SEPOLIA_RPC=https://sepolia.base.org
    NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
    ```

    > [!CAUTION]
    > The `PRIVATE_KEY` in `.env.local` is used for server-side admin operations only. Never commit this file or expose it publicly. Add `.env.local` to `.gitignore`.

3. **Complete `podConfig.ts`**

Open `lib/podConfig.ts`. You will see an empty array. Start by adding your own addresses, then add pod-mates' as you collect them. Each entry becomes a card on the dashboard.

Your contract addresses are saved in your Part 1/2 project's `.env`. Grab them:

```copy
# Run this from your smart contracts project directory
source .env && echo "Market: $PREDICTION_MARKET_ADDRESS" && echo "Token: $WORKSHOP_TOKEN_ADDRESS"
```

Then paste them into `podConfig.ts`:

```copy
    export const POD_MARKETS = [
      {
        owner: "YourName",
        marketAddress: "0x...", // Your V2 Prediction Market
        tokenAddress: "0x...", // Your Token
      },
      // Add pod-mates as you collect their addresses!
    ];
```

> [!CAUTION]
> A typo or missing `0x` prefix in an address will cause that market card to fail. Double-check every address you paste.

4. **Start the App**

    ```copy
    npm run dev
    ```

    Visit [http://localhost:3000](http://localhost:3000)

> [!TIP]
> `npm install` can take a few minutes. Use this time to collect addresses from your pod if you haven't already.

### 🧩 What the Scaffold Gives You

When you first load the app, you'll see a **setup checklist** showing what's done and what you need to build. Once you add addresses to `podConfig.ts`, you'll see yellow **"🔧 MarketCard not implemented yet"** placeholder cards — one for each pod member. This is your starting point.

**Already built for you (don't rewrite these):**

| What | Where | Details |
|------|-------|---------|
| Wallet connection | Top-right `<Wallet>` component | OnchainKit's `ConnectWallet`, avatar, dropdown, disconnect |
| Chain auto-switching | `useEffect` in `App` | Automatically switches to Base Sepolia if on wrong network |
| Contract ABIs | `lib/contracts.ts` | PredictionMarket and ERC-20 function signatures |
| Pod config type | `lib/podConfig.ts` | `PodMarket` type with `owner`, `marketAddress`, `tokenAddress` |
| Card grid layout | `app/page.tsx` | Responsive grid that maps `POD_MARKETS` to `<MarketCard>` |
| Setup checklist | `app/page.tsx` (empty state) | Shows progress when no markets are configured |

**What you need to build (3 tasks):**

1. **`app/api/markets/route.ts`** — Backend API route that reads market data using Viem
2. **`components/MarketCard.tsx`** — Frontend component with live odds using Wagmi
3. **Vote transaction wiring** — Batched approve + vote using OnchainKit (inside MarketCard)

<FlavorText id="fs-setup-complete" emoji="⚡" text="App scaffolded. Your pod's contracts are wired in." />

# 🔙 Backend: Build the Market Data API (15 min)

_Your first server-side blockchain endpoint._

### 🧠 The Mental Model: Blockchain as Database

If you're a backend engineer, this is the paradigm shift:

- **The blockchain is your database.** Contract storage replaces Postgres tables. State lives onchain, not in your infrastructure.
- **RPC calls replace SQL queries.** Instead of `SELECT * FROM markets`, you call `client.readContract({ functionName: 'markets', args: [0n] })` over an RPC endpoint.
- **Viem is your ORM.** It handles ABI encoding, type safety, and transport — the same role Prisma or TypeORM plays in a traditional stack.
- **ABIs are your schema.** A contract's ABI defines what functions exist and what types they accept/return. The ABI is already in `lib/contracts.ts` — take a look.
- **No migrations.** Once a contract is deployed, its code is immutable. You deploy a new contract instead of altering a table.

### 🛠️ Build It: `app/api/markets/route.ts`

<QuizBlockchainAsDB id="fs-blockchain-as-db" />

Create a Next.js API route that reads market data from all contracts in your pod config and returns JSON. This is the same pattern you'd use to build any backend service that reads blockchain state — price feeds, leaderboards, analytics dashboards.

**What your API route should do:**

1. Create a Viem `publicClient` connected to Base Sepolia
2. Loop through `POD_MARKETS` and call `markets(0)` on each contract
3. Return a JSON response with each market's question, pool sizes, and resolved status

**Key APIs:**

| What | Import From | Does |
|------|------------|------|
| `createPublicClient` | `viem` | Creates a client to talk to the blockchain (like creating a DB connection) |
| `http` | `viem` | Transport layer — connects to an RPC node via HTTP |
| `baseSepolia` | `viem/chains` | Chain configuration (chain ID, RPC URLs) |
| `client.readContract()` | (method) | Reads a function from a smart contract (like a SQL SELECT) |
| `formatEther()` | `viem` | Converts BigInt pool amounts to human-readable strings |
| `NextResponse.json()` | `next/server` | Returns a JSON response from an API route |

**The contract function you're calling:**

`markets(0)` returns a tuple: `[question, yesPool, noPool, resolved, outcome]` — matching the `Market` struct you wrote in Part 1.

<AIPrompt prompt="Create a Next.js App Router API route at app/api/markets/route.ts. It should use Viem's createPublicClient with baseSepolia chain and the BASE_SEPOLIA_RPC env var to read market data from each contract in POD_MARKETS (imported from @/lib/podConfig). Call the 'markets' function with args [0n] using PredictionMarketABI from @/lib/contracts. Return JSON with each market's owner, addresses, question, formatted pool sizes, and resolved status. Handle errors with try/catch." />

**Verify it works:**

```copy
curl http://localhost:3000/api/markets | npx json
```

You should see JSON with your market's question, pool sizes, and resolved status. If you see an error, check your `.env.local` RPC URL and `podConfig.ts` addresses.

> [!NOTE]
> Reading onchain data is **free** — no gas, no wallet, no signature required. This is why your API route works without a private key. Writing data (transactions) costs gas and requires a wallet, which is what you'll do in the frontend voting section.

<Scale id="fs-backend-confidence" max={5} label="How confident are you in reading onchain data from a server?" />

<FlavorText id="fs-backend-complete" emoji="🔙" text="Backend unlocked. You can read the blockchain from Node.js." />

# 📱 Frontend: Build the MarketCard (25 min)

_A React component with live blockchain data._

### 🏗️ How the Frontend Works

In Web2, a React frontend talks to a centralized database via a REST API. In Web3, your React frontend talks directly to the blockchain via RPC. We use **Wagmi** and **OnchainKit** to make this easy.

**Key difference from the API route you just built:** Your API route used Viem directly on the server. The frontend uses **Wagmi hooks** — React wrappers around Viem that handle caching, refetching, and reactivity automatically. Think of Wagmi as "React Query for the blockchain."

**🛠️ Key Technologies:**

-   🧵 [**Wagmi**](https://wagmi.sh/) — React hooks like `useAccount()`, `useReadContracts()` for wallet and onchain state management
-   🧰 [**OnchainKit**](https://www.base.org/build/onchainkit) — Coinbase's React component library for wallet connection and transaction batching
-   🔡 [**Viem**](https://viem.sh/) — Utilities like `formatEther`, `encodeFunctionData`, `parseEther`

### 📖 Reading Data: The Multicall Pattern

**Reading onchain data is free** (same as the API route). But if you make separate RPC calls for each market, you'll get rate-limited. Instead, use `useReadContracts` (a multicall) to fetch the data for *every single market in your pod* in one single, efficient network request.

```typescript
// Example: reading a single market's data
const { data } = useReadContracts({
  contracts: [
    {
      address: pod.marketAddress,
      abi: PredictionMarketABI,
      functionName: 'markets',
      args: [0n],
    },
    {
      address: pod.marketAddress,
      abi: PredictionMarketABI,
      functionName: 'hasVoted',
      args: [0n, account.address!],
    },
  ],
});

// Results are in the same order as the contracts array:
const [marketResult, hasVotedResult] = data ?? [];
// Market result shape: [question, yesPool, noPool, resolved, outcome]
```

<QuizMulticall id="fs-multicall" />

### 🛠️ Build It: `components/MarketCard.tsx`

Open the stub at `components/MarketCard.tsx`. Right now it renders a yellow "🔧 Build me!" placeholder. Replace it with a real component that displays live market data.

**What your MarketCard should do:**

1. Use `useReadContracts` to fetch `markets(0)` and `hasVoted(0, address)` from the pod's contract
2. Display the market question, an odds bar (green for Yes, red for No), and pool sizes in tokens
3. Show conditional status: "Market Resolved" / "Already voted" / "Connect wallet" / vote buttons

**Props already defined for you:** `{ pod: PodMarket, account: ReturnType<typeof useAccount> }`

**Key APIs:**

| What | Import From | Does |
|------|------------|------|
| `useReadContracts` | `wagmi` | Batches multiple contract reads into one RPC call (multicall) |
| `formatEther()` | `viem` | Converts BigInt (e.g., `10000000000000000000n`) → `"10.0"` |
| `PredictionMarketABI` | `@/lib/contracts` | ABI for the PredictionMarket — defines `markets`, `hasVoted`, `vote` |

**Odds calculation:**

```typescript
const totalPool = yesPool + noPool;
const yesPercent = totalPool > 0n ? Number((yesPool * 100n) / totalPool) : 50;
const noPercent = 100 - yesPercent;
```

<AIPrompt prompt="Rewrite the MarketCard component in components/MarketCard.tsx. It receives {pod, account} props (types already imported). Use useReadContracts from wagmi to batch-read markets(0) and hasVoted(0, account.address) from pod.marketAddress using PredictionMarketABI from @/lib/contracts. Display: (1) pod.owner's name, (2) the market question, (3) a green/red odds bar with percentages, (4) pool sizes formatted with formatEther from viem. Add conditional rendering: if resolved show 'Market Resolved', if hasVoted show 'Already voted', if no wallet show 'Connect wallet', otherwise show placeholder vote buttons for now. Use Tailwind CSS for styling. Keep 'use client' directive." />

**Verify it works:** Your app should now show live market questions and odds instead of the yellow "🔧" placeholders. If you see "Loading..." stuck, check your `podConfig.ts` addresses.

<Scale id="fs-frontend-confidence" max={5} label="How confident are you in using Wagmi hooks to read blockchain data in React?" />

<FlavorText id="fs-frontend-complete" emoji="📱" text="Frontend wired. Your MarketCard reads live data from the blockchain." />

# 🗳️ Wire Up Voting (15 min)

_Batch approve + vote into a single user action._

### ⏳ Transactions Are Asynchronous

One pattern you'll see in every onchain app is a **higher degree of asynchronicity** than you're used to in Web2. In a traditional app, you commit to your centralized database and it's done — the user clicks a button, the write happens, the UI updates. Fast enough that nobody notices.

In Web3, when a user clicks "Vote," here's what actually happens:

1. 📦 **Prepare** — The app builds the transaction data (function selector + encoded args)
2. ✍️ **Sign** — The user's wallet prompts them to sign the transaction with their private key
3. 📡 **Send** — The signed transaction is sent to a node (e.g., Base's sequencer at `sepolia.base.org`)
4. ⏳ **Wait for inclusion** — You get back a **transaction hash** immediately, but this is NOT confirmation. The transaction is in the mempool, waiting to be included in a block.
5. 🛡️ **Wait for finality** — Once included in a block, you wait for enough subsequent blocks to consider it final

This means your UI needs to handle intermediate states: signing, pending, confirmed, and potentially failed. This is exactly what OnchainKit's `<Transaction>` component handles for you — loading spinners, confirmation toasts, and error states, all out of the box.

> [!NOTE]
> On Base, transactions are typically confirmed in ~2 seconds, but designing for the async flow is still important.

<QuizTransactionFlow id="fs-transaction-flow" />

<QuizAsyncUX id="fs-async-ux" />

### 🖋️ The Two-Step Vote Pattern

In Part 2, you learned that voting requires TWO transactions: `approve` (let the market spend your tokens) and `vote` (execute the bet). We batch these into a single user click using an array of encoded calls:

```typescript
import { encodeFunctionData, parseEther } from 'viem';

const voteYesCalls = [
  {
    to: pod.tokenAddress,
    data: encodeFunctionData({
      abi: ERC20ABI,
      functionName: 'approve',
      args: [pod.marketAddress, parseEther('10')],
    }),
  },
  {
    to: pod.marketAddress,
    data: encodeFunctionData({
      abi: PredictionMarketABI,
      functionName: 'vote',
      args: [0n, true, parseEther('10')],
    }),
  },
];
```

### 🧰 OnchainKit's `<Transaction>` Component

Instead of writing complex state-management for loading spinners and error popups, you just pass your calls array into the `<Transaction>` component. It handles the wallet popup, block confirmation, and UI state automatically:

```typescript
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';

<Transaction calls={voteYesCalls}>
  <TransactionButton text="Vote Yes (10 Tokens)" />
  <TransactionSponsor />
  <TransactionStatus>
    <TransactionStatusLabel />
    <TransactionStatusAction />
  </TransactionStatus>
</Transaction>
```

### 🛠️ Build It: Add Voting to MarketCard

Update your `MarketCard` component to replace the placeholder vote buttons with real `<Transaction>` components.

**What to add:**

1. Build `voteYesCalls` and `voteNoCalls` arrays using `encodeFunctionData` (same pattern, just `true` vs `false` for the `side` argument)
2. Replace placeholder buttons with `<Transaction calls={...}>` wrapping a `<TransactionButton>`
3. Import `ERC20ABI` from `@/lib/contracts` (you already have `PredictionMarketABI`)

<QuipJSONRPC id="fs-json-rpc" />

<AIPrompt prompt="Update my MarketCard component to add voting. I need two call arrays (voteYesCalls and voteNoCalls) that each batch an ERC-20 approve call and a PredictionMarket vote call using encodeFunctionData and parseEther from viem. The approve call goes to pod.tokenAddress, approving pod.marketAddress for parseEther('10'). The vote call goes to pod.marketAddress with args [0n, true/false, parseEther('10')]. Replace the placeholder vote buttons with OnchainKit Transaction components: <Transaction calls={voteYesCalls}><TransactionButton text='Vote Yes (10 Tokens)' /><TransactionSponsor /><TransactionStatus><TransactionStatusLabel /><TransactionStatusAction /></TransactionStatus></Transaction>. Import Transaction components from @coinbase/onchainkit/transaction and ERC20ABI from @/lib/contracts." />

**Verify it works:**

1. Connect your Coinbase Wallet (Base Sepolia)
2. Click "Vote Yes" on a market
3. Your wallet should pop up asking you to confirm TWO batched transactions
4. After confirmation, refresh — the odds should update

<FreeResponse id="fs-async-mental-model" label="How does the async nature of blockchain transactions change the way you think about UX compared to Web2?" />

<FlavorText id="fs-voting-complete" emoji="🗳️" text="Voting wired. Approve + vote in one click." />

# ⚒️ Build & Deploy (35 min)

_Test your aggregator, deploy to Vercel, and enhance your app._

### 🧪 Test Your Aggregator (8 min)

1. **Visit** http://localhost:3000
2. **Connect** your Coinbase Wallet (Base Sepolia)
3. **View** odds for all pod markets
4. **Vote** on a pod-mate's market using the batch Approve & Vote button
5. **Refresh** – odds should update after votes
6. **Test your API** — `curl http://localhost:3000/api/markets` should return the same data

### 📢 Pod Challenge (7 min)

- Each person vote on at least one other pod member's market
- Verify the aggregator shows updated odds after each vote
- Compare gas costs: single `vote` vs batch `approve` + `vote`

### 🚀 Deploy Your App (10 min)

*Vercel deploys typically complete in 1–2 minutes.*

1. **Push to GitHub** – Create a repo and push your `neo-workshop-fullstack` clone
2. **Deploy to Vercel** – [vercel.com](https://vercel.com) → Import project → Add env vars (`NEXT_PUBLIC_ONCHAINKIT_API_KEY`, `NEXT_PUBLIC_RPC_URL`)

> [!WARNING]
> Only add `NEXT_PUBLIC_*` env vars to Vercel. **Never** add `PRIVATE_KEY` to a public deployment — it would be accessible to anyone.
3. **Share the URL** – Everyone in the pod can visit your deployed app and test
4. **Verify** – Connect wallet, view odds, place a vote (ensure you're on Base Sepolia)

> [!TIP]
> **Finished early?** Try the Enhance section below.

<Scale id="fs-fullstack-confidence" max={5} label="How confident are you in building a fullstack onchain app?" />

<FlavorText id="fs-deployed" emoji="🚀" text="App deployed. Your prediction market is live on the internet." />

---

## 📊 Enhance Your App (10 min)

Now that the core loop is working, choose one feature to build with AI and make the dashboard look like a professional DeFi application.

1. 💰 **Show the User's Token Balance** — Display "Your Balance: X Tokens" on the Market Card so the user knows if they have enough to bet. *(Hint: the ERC-20 ABI has a `balanceOf` function)*

2. 🏆 **The "Claim Winnings" Button** — Once a market is resolved, winners need to get paid. Add conditional rendering to show a withdraw button instead of vote buttons.

3. 🎨 **Style the Dashboard** — Make the market cards look like a professional DeFi app with gradients, hover effects, and animations.

<FlavorText id="fs-enhance-complete" emoji="✨" text="Feature shipped. Your dashboard is production-grade." />

# 🪞 Wrap-Up & Reflection (5 min)

_Celebrate what you built and plan your next steps._

### ✅ What You Accomplished

- ✅ Built a server-side API route that reads blockchain data using Viem
- ✅ Built a `MarketCard` component with live odds using Wagmi's multicall
- ✅ Batched `approve` + `vote` into a single button with OnchainKit
- ✅ Deployed a fullstack onchain app to Vercel
- ✅ Collaborated with your pod via the Cross-Wire

### 💡 Real-World Applications
The fullstack patterns you just built are the same architecture behind production onchain apps:
* **Zapper / DeBank:** Portfolio dashboards that aggregate data across dozens of DeFi protocols using the same multicall pattern you built with `useReadContracts`.
* **Uniswap Interface:** Uses Wagmi hooks and multicall to read liquidity pool data from hundreds of contracts simultaneously.
* **Coinbase Wallet:** Built with OnchainKit components for wallet connection, identity display, and transaction handling.
* **DeFi Aggregators (1inch, Paraswap):** Batch multiple token approvals and swaps into single transactions, exactly like your Approve + Vote flow.

### 🗺️ The Full Journey

Take a moment to appreciate what you've built across all three parts:

1. **Part 1** — You started with an `Echo` contract and a `cast call` command. By the end, you understood Solidity fundamentals, the CEI pattern, gas mechanics, and the Oracle Problem — and you had a deployed, verified PredictionMarket contract on Base Sepolia.
2. **Part 2** — You learned that tokens aren't objects but spreadsheets, built your own ERC-20 from scratch, and mastered the two-step Allowance Pattern that powers every DeFi protocol. You distributed a custom currency and upgraded your market to accept it.
3. **Part 3** — You connected everything to a real frontend. You built a server-side API route with Viem, a reactive MarketCard component with Wagmi hooks, and batched transactions with OnchainKit — the same stack used in production at Coinbase.

You went from zero onchain experience to a **deployed full-stack prediction market** with custom tokens and an aggregator dashboard. These aren't toy patterns — they're the exact same architecture behind Uniswap, Aave, Polymarket, and Coinbase's own products.

<TemperatureCheck id="fs-understanding-check" />

<Scale id="fs-overall-workshop" max={10} label="Rate your overall workshop experience" />



### 🚀 Keep Building

Here's where to go next:

- **[OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)** — Production-grade implementations of ERC-20, ERC-721, access control, proxies, and more
- **[ERC Specifications](https://eips.ethereum.org/)** — Read the standards themselves. Start with [ERC-20](https://eips.ethereum.org/EIPS/eip-20) and [ERC-721](https://eips.ethereum.org/EIPS/eip-721), then explore what interests you
- **[OnchainKit Docs](https://onchainkit.xyz/)** — Build production-quality onchain UIs with Coinbase's component library
- **[Wagmi Docs](https://wagmi.sh/)** — Deep dive into React hooks for wallet and contract interactions
- **[Base Docs](https://docs.base.org/)** — Learn about building on Base, including bridging, gas optimization, and mainnet deployment
- **Deploy to Mainnet** — Everything you did on Base Sepolia works identically on Base mainnet. The only difference: real money.

---

<FlavorText id="fs-part3-complete" emoji="🌐" text="Fullstack onchain engineer: certified" />

**🎉 Congratulations on completing the Intro to Onchain Development workshop!**

You've built a full-stack prediction market with custom tokens and an aggregator dashboard. You understand smart contracts, token standards, and modern Web3 frontend patterns. You're ready to build. 🧑‍💻

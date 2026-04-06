# 🌐 Part 3: Onchain Fullstack

_Build an Aggregated Prediction Market Dashboard_

### ⏱️ Time Allocation (105 min)

### 🎯 Learning Goals

By the end of this part, you'll be able to:

- ✅ Build apps that read from and write to blockchains
- ✅ Create frontend interfaces with wallet connections
- ✅ Integrate smart contracts with modern web applications
- ✅ Handle real-time blockchain data updates

### 🏗️ Module Blueprint: What We Provide vs. What You Build

* **📦 Pre-Built:** A Next.js boilerplate with Tailwind CSS, OnchainKit, and Wagmi providers already configured.
* **🛠️ What You Will Build:** The React hooks (`useReadContracts`) to fetch the betting odds, and the UI buttons (`<Transaction>`) to execute the `approve` and `vote` flow.
* **🤖 AI-Driven Development:** You will prompt AI to generate React components, Wagmi hooks, and OnchainKit integrations, then review the output against the app's architecture.
* **🤝 Pod Collaboration:** **The Cross-Wire.** The app is designed to aggregate the entire table's markets. Your UI will not work until you successfully gather the Market Addresses and Token Addresses from everyone in your pod and wire them into your config file.

> [!IMPORTANT]
> Your dashboard **will not work** until you collect every pod member's Market and Token addresses. Start gathering these now if you haven't already.


### 🆘 Need Help?

Check out the **[Troubleshooting Guide](./troubleshooting.md)** for wallet connections, multicall issues, and **[Module 3](./troubleshooting.md#module-3-app-issues)** specific issues.

---

## 🔌 The Cross-Wire: Your App Depends on Your Pod (5 min)

### 🤝 What is the Cross-Wire?

Instead of building an app that only shows **your** contract, you'll build an **Aggregator Dashboard** that shows **all markets** from your pod.

**You need from each podmate:**

1. **Market contract address** (their deployed PredictionMarket)
2. **Token contract address** (their custom ERC-20)

<FreeResponse id="fs-crosswire-expectation" label="What challenges do you anticipate with aggregating data from multiple pod members' contracts?" />

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
    # OnchainKit API Key (optional but recommended — enables Smart Wallet features).
    # Get one at https://portal.cdp.coinbase.com/ (you already have an account from the faucet step).
    NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_api_key_here

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

Open `lib/podConfig.ts`. You will see an empty array. You must ask your pod-mates for their deployed Market and Token addresses and fill this out.

```copy
    export const POD_MARKETS = [
      {
        owner: "Alice",
        marketAddress: "0x123...", // Alice's V2 Prediction Market
        tokenAddress: "0xabc...", // AliceCoin Address
      },
      {
        owner: "Bob",
        marketAddress: "0x456...", // Bob's V2 Prediction Market
        tokenAddress: "0xdef...", // BobCoin Address
      }
      // Add yourself and the rest of the table!
    ];
```

> [!CAUTION]
> A single typo or missing `0x` prefix in this array will break the **entire dashboard**. Double-check every address you paste.

4. **Start the App**

    ```copy
    npm run dev
    ```

    Visit [http://localhost:3000](http://localhost:3000)

> [!TIP]
> `npm install` can take a few minutes. Use this time to collect addresses from your pod if you haven't already.

<FlavorText id="fs-setup-complete" emoji="⚡" text="App scaffolded. Your pod's contracts are wired in." />

# 🔙 Backend: Data Layer

_Server-side patterns for reading and writing onchain data. (10 min)_

### 🏗️ How the Backend Works

The server-side data layer connects your app to the blockchain. It handles RPC configuration, contract ABIs, and admin operations like creating markets programmatically.

**🛠️ Key Technologies & Patterns:**

-   🔡 **TypeScript** – Type safety for blockchain addresses, function calls, and contract ABIs
-   ⚛️ [**Next.js**](https://nextjs.org/) – Full-stack React framework with file-based routing
-   🧵 [**Viem**](https://viem.sh/) – Utilities like `createPublicClient` and `createWalletClient` for reading and writing onchain data

**🗂️ App Structure:**
The app uses Next.js file-based routing with server-side configuration:

-   `lib/podConfig.ts` – Configuration file where you wire in your pod's contract and token addresses
-   `lib/contracts.ts` – Shared contract ABIs for the PredictionMarket and ERC-20 interfaces
-   `app/layout.tsx` – Root layout that wraps the app in providers (Wagmi, OnchainKit, WalletConnect)
-   `app/page.tsx` – Main entry point that renders the aggregator dashboard
-   `.env.local` – Server-side secrets like `PRIVATE_KEY` for admin operations (e.g., creating markets programmatically)

> [!NOTE]
> **Backend engineers:** Your mental model here is that the blockchain itself is the database. Instead of querying Postgres, you're querying smart contracts via RPC calls. Viem is your ORM — it handles ABI encoding, type safety, and transport.

### 📖 Reading Onchain Data with Viem

On the server side, you can use Viem's `createPublicClient` to read contract state directly — no wallet required. This is how you'd fetch market data in an API route or server component:

```typescript
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC),
});

const marketData = await client.readContract({
    address: POD_MARKETS[0].marketAddress,
    abi: PredictionMarketABI,
    functionName: "markets",
    args: [0n],
});
```

### 🖋️ Writing Onchain Data with Viem

For admin operations (like creating markets programmatically), use `createWalletClient` with the server-side private key:

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC),
});

const txHash = await walletClient.writeContract({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: "createMarket",
    args: ["Will it rain tomorrow?"],
});
```

### 🧬 How ABIs Work Under the Hood

You've been using ABIs throughout this workshop — they're in `lib/contracts.ts`, and Viem/Wagmi use them for every contract call. But what's actually happening when you call `encodeFunctionData`?

A smart contract receives raw bytes — it has no idea what function you're trying to call unless the data follows a specific format. The **ABI** (Application Binary Interface) is the translation layer:

1. **Function selector:** The function's name and parameter types are hashed with `keccak256`. The first 4 bytes of that hash become the **selector** — a unique ID for that function.
2. **Encoded arguments:** The function arguments are ABI-encoded (padded to 32 bytes each) and appended after the selector.

For example, `createMarket(string)` hashes to a 32-byte digest, but only the first 4 bytes (e.g., `0xa1234567`) are used as the selector. When the EVM receives a transaction, it reads those first 4 bytes to determine which function to execute.

You can verify this yourself:

```copy
## Hash the function signature and see the full digest
cast keccak "createMarket(string)"

## The first 4 bytes (8 hex chars) = the function selector
## Compare this to the "Input Data" on any createMarket transaction on BaseScan
```

This is what `encodeFunctionData` does under the hood — it looks up the function in the ABI, computes the selector, encodes the arguments, and concatenates them into the raw bytes that get sent to the contract.

> [!TIP]
> **Debugging tip:** If a transaction fails with mysterious bytecode errors, paste the input data's first 4 bytes into [openchain.xyz/signatures](https://openchain.xyz/signatures) to identify which function was called.

<QuizABI id="fs-abi-selector" />

<Scale id="fs-backend-confidence" max={5} label="How confident are you in reading/writing onchain data from a server?" />

<FlavorText id="fs-backend-complete" emoji="🔙" text="Backend unlocked. You can read and write the blockchain from Node.js." />

# 📱 Frontend: UI & Onchain Interactions

_React hooks, multicall, and OnchainKit for blockchain UX. (25 min)_

### 🏗️ How the Frontend Works

In Web2, a React frontend talks to a centralized database via a REST API. In Web3, your React frontend talks directly to the blockchain via RPC (Remote Procedure Call). We use **Wagmi** and **OnchainKit** to make this incredibly easy.

**🛠️ Key Technologies & Patterns:**

-   🔡 **TypeScript** – Type safety for blockchain addresses, function calls, and contract ABIs
-   🧩 **React** – Component-based UI library with hooks for state management
-   ⚛️ [**Next.js**](https://nextjs.org/) – Full-stack React framework with file-based routing
-   🧵 [**Wagmi**](https://wagmi.sh/) – React hooks like `useAccount()`, `useReadContracts()` for wallet and onchain state management
-   🧰 [**OnchainKit**](https://www.base.org/build/onchainkit) – Coinbase's React component library for wallet connection and transaction batching

**🗂️ App Structure:**
The app follows a component-based architecture with two core features:

-   **Odds Aggregator** – Reads all pod markets' odds using Wagmi's `useReadContracts` (multicall) and displays them in a dashboard grid
-   **Vote Interface** – Batches `approve` + `vote` into a single user action using OnchainKit's `<Transaction>` component

> [!NOTE]
> **Frontend engineers:** Think of Wagmi hooks as your data-fetching layer (like React Query for the blockchain). OnchainKit components handle the UX of wallet connection and transaction signing — similar to how a payments SDK abstracts Stripe integration.

### 📖 Reading Data (The Multicall Radar)

**Reading onchain data is free.** Unlike writing (which requires a transaction and costs gas), reading just queries the current state of the blockchain — no signature, no gas, no wallet popup. This is why BaseScan's "Read Contract" tab works instantly for free, while "Write Contract" requires connecting your wallet.

However, free doesn't mean unlimited. Node providers protect against abuse by rate-limiting read requests (since there's no gas cost to deter spam). This is where **multicall** comes in.

If you have several markets at your table, making separate RPC calls for each will cause lag and potentially hit rate limits. Instead, we use `useReadContracts` (a multicall) to fetch the data for *every single market in your pod* in one single, highly efficient network request.

```typescript
// Example: Fetching the Market Struct from Alice's contract
const { data: marketData } = useReadContract({
    address: POD_MARKETS[0].marketAddress,
    abi: PredictionMarketABI,
    functionName: "markets",
    args: [0], // Market ID 0
});

// The result maps directly to the Solidity Struct you wrote!
// [ "Will it rain?", yesPool, noPool, isResolved ]
```

<FreeResponse id="fs-multicall-benefit" label="Why is multicall more efficient than making separate RPC calls for each market?" />

### 🖋️ Writing Data (The Action)

In Part 2, you learned that voting requires TWO transactions: `approve` and `transferFrom`. We can batch these together in the UI using an array of calls!

```typescript
const voteCalls = [
    // Call 1: Approve the Market to spend 10 tokens
    {
        to: tokenAddress,
        data: encodeFunctionData({
            abi: ERC20ABI,
            functionName: "approve",
            args: [marketAddress, parseEther("10")],
        }),
    },
    // Call 2: Execute the Vote (1 = Yes)
    {
        to: marketAddress,
        data: encodeFunctionData({
            abi: PredictionMarketABI,
            functionName: "vote",
            args: [0, 1],
        }),
    },
];
```

### ⏳ Transactions Are Asynchronous

One pattern you'll see in every onchain app is a **higher degree of asynchronicity** than you're used to in Web2. In a traditional app, you commit to your centralized database and it's done — the user clicks a button, the write happens, the UI updates. Fast enough that nobody notices.

In Web3, when a user clicks "Vote," here's what actually happens:

1. **Prepare** — The app builds the transaction data (function selector + encoded args)
2. **Sign** — The user's wallet prompts them to sign the transaction with their private key
3. **Send** — The signed transaction is sent to a node (e.g., Base's sequencer at `sepolia.base.org`)
4. **Wait for inclusion** — You get back a **transaction hash** immediately, but this is NOT confirmation. The transaction is in the mempool, waiting to be included in a block.
5. **Wait for finality** — Once included in a block, you wait for enough subsequent blocks to consider it final

This means your UI needs to handle intermediate states: signing, pending, confirmed, and potentially failed. This is exactly what OnchainKit's `<Transaction>` component handles for you — loading spinners, confirmation toasts, and error states, all out of the box.

> [!NOTE]
> Setting a higher gas price incentivizes faster inclusion by the sequencer, giving your users a better experience. On Base, transactions are typically confirmed in ~2 seconds, but designing for the async flow is still important.

<QuizTransactionFlow id="fs-transaction-flow" />

<FreeResponse id="fs-async-mental-model" label="How does the async nature of blockchain transactions change the way you think about UX compared to Web2?" />

### 🧰 OnchainKit Components

[OnchainKit](https://www.base.org/build/onchainkit) is Coinbase's React component library that turns complex blockchain interactions into beautiful, one-line UI components.

**💼 Wallet Connection**:
```typescript
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";

<Wallet>
    <ConnectWallet />
</Wallet>
```

**🔁 The Transaction Button**:
Instead of writing complex state-management for loading spinners and error popups, you just pass your `voteCalls` array into the `<Transaction>` component. It handles the wallet pop-up, the block confirmation, and the UI state automatically.

```typescript
import { Transaction, TransactionButton } from "@coinbase/onchainkit/transaction";

<Transaction calls={voteCalls}>
    <TransactionButton text="Vote Yes (10 Tokens)" />
</Transaction>
```

### 🔧 Under the Hood: The JSON-RPC Layer

Viem, Wagmi, and OnchainKit are all abstractions over the [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) — a standard set of HTTP endpoints that every Ethereum node exposes. Under the hood:

- Every `readContract` / `useReadContract` call is an **`eth_call`** request — a free, read-only simulation
- Every transaction you sign and send is an **`eth_sendRawTransaction`** request
- Gas estimation uses **`eth_estimateGas`** — the same call that causes the misleading "unable to estimate network fee" errors you saw in Part 1

You'll rarely need to interact with JSON-RPC directly, but understanding this layer helps when debugging RPC errors, timeouts, or rate limits. The full method list is at [ethereum.org/developers/docs/apis/json-rpc](https://ethereum.org/en/developers/docs/apis/json-rpc/).

<Scale id="fs-frontend-confidence" max={5} label="How confident are you in using Wagmi hooks and OnchainKit components?" />

<FlavorText id="fs-frontend-complete" emoji="📱" text="Frontend wired. Wagmi reads, OnchainKit writes." />

# ⚒️ Build & Deploy

_Test your aggregator, deploy to Vercel, and enhance your app. (50 min)_

### 🧪 Test Your Aggregator (8 min)

1. **Visit** http://localhost:3000
2. **Connect** your Coinbase Wallet (Base Sepolia)
3. **View** odds for all pod markets
4. **Vote** on a pod-mate's market using the batch Approve & Vote button
5. **Refresh** – odds should update after votes

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
> **Finished early?** Add a loading skeleton for the odds, or style the market cards with a theme of your choice.

<Scale id="fs-fullstack-confidence" max={5} label="How confident are you in building a fullstack onchain app?" />

<FlavorText id="fs-deployed" emoji="🚀" text="App deployed. Your prediction market is live on the internet." />

---

## 📊 Enhance Your App (25 min)

Now that the core loop is working, choose one feature to build with AI and make the dashboard look like a professional DeFi application.

1. 🧮 **Calculate the Payout Odds (UI Polish)**:
    * Currently, the UI just shows raw token amounts (e.g., Yes: 50, No: 10).
    <AIPrompt prompt="Write a TypeScript helper function that takes yesPool and noPool as bigints and returns the yes/no percentages. Then create a React component that renders a dynamic red/green progress bar." />

2. 💰 **Show the User's Token Balance (Wagmi Read)**:
    * Display "Your Balance: X Tokens" on the Market Card so the user knows if they have enough money to bet.
    <AIPrompt prompt="Add a useReadContract hook that calls balanceOf on the ERC-20 token contract for the connected wallet address using useAccount(), and display the formatted result on the market card component." />

3. 🏆 **The "Claim Winnings" Button (Conditional Rendering)**:
    * Once a market is resolved, winners need to get paid.
    <AIPrompt prompt="Add conditional rendering to the market card: if market.isResolved is true, hide the Vote buttons and show a Claim Winnings button using OnchainKit's Transaction component that calls claimWinnings() on the smart contract." />

**🎯 Goal**: Successfully implement your chosen feature using the prompt template above!

**💬 Top Questions to Ask Your AI:**

<AIPrompt prompt="My useReadContracts hook refetches on every block. If I have 20 markets across 5 contracts, how many RPC calls is that per block? Design a caching strategy that balances freshness vs. rate limits." />

<AIPrompt prompt="My batch transaction does approve+vote in two calls. What happens if the user's wallet processes the approve but the vote fails — do they have a dangling approval? How would a production app handle this?" />

<AIPrompt prompt="Compare how Uniswap's frontend handles optimistic UI updates after a swap vs. waiting for block confirmation. Which approach should I use for my vote button, and what are the failure modes?" />

<FlavorText id="fs-enhance-complete" emoji="✨" text="Feature shipped. Your dashboard is production-grade." />

# 🪞 Wrap-Up & Reflection

_Celebrate what you built and plan your next steps. (5 min)_

### ✅ What You Accomplished

- ✅ Built an Aggregator Dashboard showing all pod markets
- ✅ Used `useReadContracts` (multicall) to fetch odds in one request
- ✅ Batched `approve` + `vote` into a single button with OnchainKit
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
3. **Part 3** — You connected everything to a real frontend. You used Viem to read onchain state, Wagmi hooks for reactive data fetching, OnchainKit for transaction UX, and multicall for efficient data aggregation across your pod's entire infrastructure.

You went from zero onchain experience to a **deployed full-stack prediction market** with custom tokens and an aggregator dashboard. These aren't toy patterns — they're the exact same architecture behind Uniswap, Aave, Polymarket, and Coinbase's own products.

<TemperatureCheck id="fs-understanding-check" />

<Scale id="fs-overall-workshop" max={10} label="Rate your overall workshop experience" />

<FreeResponse id="fs-workshop-takeaway" label="What's the most valuable thing you learned in this workshop? How might you apply it at Coinbase?" />

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

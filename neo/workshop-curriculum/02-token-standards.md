---
description: Build an ERC-20 token from scratch, master the Allowance Pattern, and upgrade your market to use token-based wagers.
duration: 60
---

# 🪙 Part 2: Token Standards (60 min)

_Create Your Own ERC-20 Token and Upgrade the Prediction Market_

### 🎯 Learning Goals

By the end of this part, you'll be able to:

- ✅ **Understand the ERC-20 standard** and why interfaces matter in Web3.
- ✅ **Build and deploy** your own custom ERC-20 token.
- ✅ **Distribute tokens** to your pod members using your wallet.
- ✅ **Master the "Allowance Pattern"** (`approve` and `transferFrom`) to integrate tokens into your Prediction Market.

### 🏗️ Module Blueprint: What We Provide vs. What You Build

* **📦 Pre-Built:** A standard `IERC20.sol` interface, an `ERC20.sol` skeleton (like Part 1's `PredictionMarket.sol`), and deployment script stubs (`DeployToken.s.sol`, `DeployV2.s.sol`).
* **🛠️ What You Will Build:** Fill in the `ERC20.sol` stub to implement the interface, then upgrade `PredictionMarket.sol` to accept custom tokens instead of testnet ETH.
* **🤖 AI-Driven Development:** You will prompt AI to generate your ERC-20 token and the upgraded PredictionMarket, then review the output against the interface spec and security requirements.
* **🤝 Pod Collaboration:** You cannot test your upgraded Prediction Market alone. You must swap custom tokens with your pod-mates and manually approve their contracts to spend your funds.

> [!IMPORTANT]
> You **cannot** complete this module alone. You need pod-mates to send you their tokens and test your upgraded market contract.

### 🆘 Need Help?
Check out the **[Troubleshooting Guide](./troubleshooting)** for solutions to common issues including deployment problems and gas errors.


---

## 📖 Understanding Token Standards (5 min)

### 🤔 Why do we need standards?
In Web2, if you want your app to talk to Stripe, you have to read Stripe's specific API documentation. If you switch to PayPal, you have to rewrite your entire backend because the API is different.

In Web3, we use **[Ethereum Requests for Comments (ERCs)](https://eips.ethereum.org/erc)** to agree on universal API shapes. Because every fungible token (USDC, UNI, cbBTC) strictly follows the **ERC-20 Standard**, a decentralized exchange like Uniswap can support a brand new token the exact second it is deployed, without writing a single line of new code.

> [!NOTE]
> This is the power of standards-based composability — any app that supports ERC-20 automatically supports every ERC-20 token, present and future.


### 📝 How Standards Are Proposed

An ERC is, at its core, **social consensus** — a group of developers getting together and agreeing: "Wouldn't it be cool if this thing worked this way, and we all built on the same interface?" ERCs are only as valuable as the adoption they get.

The process is open to anyone. **EIPs** (Ethereum Improvement Proposals) cover core protocol changes, while **ERCs** (Ethereum Request for Comments) standardize application-level patterns like token interfaces — no protocol change required. To propose one, you literally open a pull request at [ethereum/EIPs](https://github.com/ethereum/EIPs/pulls) or [ethereum/ERCs](https://github.com/ethereum/ERCs/pulls). All proposals are public at [eips.ethereum.org](https://eips.ethereum.org/).

For example, the Base team at Coinbase contributed [ERC-7846](https://eips.ethereum.org/EIPS/eip-7846) — a new wallet connection API standard. It started as a PR on a public repo and gained value as other wallets and SDKs adopted it. If you're working on the frontier of onchain development and have ideas for how things should work, you can propose a standard too.

### 🧾 Most Popular Token Standards

**📂 Token standards** structure different types of asset models as smart contracts.

**🔁 [ERC-20 (Fungible Tokens)](https://eips.ethereum.org/EIPS/eip-20)**:

- Every token is identical and interchangeable
- Examples: USDC (Stablecoin from Coinbase and Circle), cbBTC (Coinbase custodied Bitcoin), UNI (Uniswap governance token)
- Use cases: New currencies, wrapped securities, points, governance tokens

**🖼️ [ERC-721 (NFTs - Non-Fungible Tokens)](https://eips.ethereum.org/EIPS/eip-721)**:

- Each token is unique, non-interchangeable, and can have metadata
- Examples: CryptoPunks, Basenames, Uniswap Liquidity Provider Positions
- Use cases: Art, collectibles, unique assets, identity

If ERC-20 is a spreadsheet of *who has how much*, ERC-721 is a spreadsheet of *who owns which specific item*. The core storage flips: instead of `mapping(address => uint256)` (address → balance), it's `mapping(uint256 => address)` (token ID → owner). Each token can only have one owner at a time, and transferring an NFT means changing which address is mapped to that token ID.

ERC-721 also has an approval system, but with a twist: you can approve someone for a *specific* token ID, or use `setApprovalForAll` to let a spender access *all* your tokens in a collection.

**🎮 ERC-1155 (Multi-Token Standard)**:

- A single contract manages multiple token types — both fungible and non-fungible
- Examples: Game items (100 health potions + 1 unique legendary sword, all in one contract)
- Use cases: Gaming, collectible sets, any application with diverse asset types

<QuizTokenStandards id="ts-token-standards-selection" />

<QuizERCProcess id="ts-erc-process" />

---

### 💡 Mental Model: Tokens Are a Spreadsheet

A common misconception is that tokens are "objects" that move between wallets — like passing a coin from one hand to another. In reality, a token contract is more like a **spreadsheet** with two columns: *who* and *how much*.

| Address | Balance |
|---------|---------|
| Alice   | 1,000   |
| Bob     | 500     |
| Carol   | 2,000   |

When Alice "sends" 100 tokens to Bob, no object moves anywhere. The contract simply updates two rows: Alice's balance goes down by 100, Bob's goes up by 100. That's it — it's all storage at a single address on the blockchain.

This mental model matters because it explains why `transfer` and `transferFrom` are just arithmetic operations on a mapping, and why the "approve" pattern exists: you're granting another address permission to update *your* row in the spreadsheet.

<QuizTokenMentalModel id="ts-token-mental-model" />

---

### 🧱 The Minimal ERC-20 Interface

Read the [official ERC-20 specification](https://eips.ethereum.org/EIPS/eip-20). Below is `IERC20` — the **interface** that defines the required function signatures (same `I` prefix convention you saw with `IPredictionMarket`). Your job is to write a concrete `ERC20` contract that implements this interface with real logic.

```solidity
// ERC-20 Token Interface
interface IERC20 {
    // READ FUNCTIONS
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);

    // WRITE FUNCTIONS
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // EVENTS
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

**Key functions:**

| Function | Purpose |
|----------|---------|
| `balanceOf(address)` | How many tokens an address holds |
| `transfer(to, amount)` | Send tokens from your wallet to another address |
| `approve(spender, amount)` | Allow another address (e.g., a contract) to spend your tokens |
| `transferFrom(from, to, amount)` | Move tokens on behalf of another address (requires prior `approve`) |


**💡 Key Insights**:

- 🧩 **Standards enable composability** – all wallets and exchanges can support ERC-20 tokens instantly
- 🌉 **Works on Base** – These same standards work on Base (and all EVM chains), not just Ethereum mainnet
- 🔗 **Connects to your work** – You'll integrate tokens with your PredictionMarket contract from Part 1 (token wagers instead of ETH!)

# 🛠️ Build and Deploy Your Token (20 min)

_Create, deploy, and distribute your custom ERC-20 token._

### 🏗️ Implement Your Token

1. **Open the Token Stub**

    Open `src/ERC20.sol` in your repo. Like `PredictionMarket.sol` from Part 1, this is a skeleton — the state variables, constructor, and events are wired up, but the core functions (`transfer`, `approve`, `transferFrom`) return `false` or revert with "Not implemented".

    Your token **must** implement: `name`, `symbol`, `decimals`, `totalSupply`, `balanceOf`, `transfer`, `approve`, `allowance`, `transferFrom`

    Reference the [official ERC-20 spec](https://eips.ethereum.org/EIPS/eip-20), then prompt AI (replace `[YourName]` with your name and `[YNC]` with your coin's acronym):

    <AIPrompt prompt="Write a Solidity ERC-20 token contract implementing the IERC20 interface with name [YourName]Coin, symbol [YNC], 18 decimals, and 1,000,000 initial supply minted to msg.sender. Include Transfer and Approval events." />

    **✅ Review Checklist:**

    <ChecklistReviewERC20 id="checklist-review-erc20" />

    **💬 Top Questions to Ask Your AI:**

    <AIPrompt prompt="What happens if two contracts both have active approvals to spend my tokens, and they both call transferFrom in the same block? Can I get double-spent?" />

    <AIPrompt prompt="Why does OpenZeppelin's ERC-20 implementation have an _update() internal function instead of directly modifying balances in transfer()? What design problem does this solve?" />

3. **Open Deployment Script**:

    Open `script/DeployToken.s.sol` — this stub is ready for you to fill in your token deployment logic:

    ```copy
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.13;

    import {Script, console} from "forge-std/Script.sol";
    import {ERC20} from "../src/ERC20.sol";

    contract DeployToken is Script {
        function run() external {
            vm.startBroadcast();

            // TODO: Deploy your token (ERC20, etc.)

            vm.stopBroadcast();
        }
    }
    ```

4. **Deploy**

    ```copy
    forge script script/DeployToken.s.sol \
      --rpc-url https://sepolia.base.org \
      --account dev \
      --sender $WALLET_ADDRESS \
      --broadcast \
      --verify \
      --verifier etherscan \
      --etherscan-api-key $ETHERSCAN_API_KEY
    ```

    > [!TIP]
    > If you're in a new terminal, run `source .env` to reload all your keys and addresses.

5. **Save your token address**

    Copy the `deployed to:` address from the output and save it to your `.env`:

    ```copy
    # ✏️ Replace 0xYOUR_TOKEN_ADDRESS with the address from the deploy output
    sed -i '' 's/^WORKSHOP_TOKEN_ADDRESS=.*/WORKSHOP_TOKEN_ADDRESS=0xYOUR_TOKEN_ADDRESS/' .env
    source .env && echo "✅ Saved: $WORKSHOP_TOKEN_ADDRESS"
    ```

6. **Verify Token in Wallet**

    Open Coinbase Wallet → "Assets" → "Testnets" tab. Your token should appear automatically. If it doesn't, try refreshing the extension or closing and reopening it — Coinbase Wallet auto-detects ERC-20 tokens once they're deployed.

> [!CAUTION]
> **Production warning:** Building an ERC-20 from scratch is a great learning exercise, but you should **never ship a hand-written token implementation** to production. Instead, use audited libraries like [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts), which provide battle-tested implementations of ERC-20, access control, and dozens of other patterns. These libraries have been through rigorous security audits and are used by virtually every major DeFi protocol. Check out their [ERC-20 implementation](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol) — it includes edge cases and protections you'd never think to add yourself.

<FlavorText id="ts-token-deployed" emoji="🪙" text="Minted your first token. The mint is warm." />

## 🤝 Distribute & Trade (5 min)

You are about to upgrade your Prediction Market to require tokens, but a market is no fun if you are the only one with the money.

**📢 Pod Activity Flow**:

1. **Find your two addresses.** You need both:
   - **Wallet Address** (your personal address that holds tokens): run `echo $WALLET_ADDRESS`
   - **Token Contract Address** (the deployed contract): this was printed when you ran `forge script` in the previous step (look for `"Token deployed to: 0x..."` in the output)

2. **Share with your pod.** Post both addresses in your pod's Slack channel or group chat. Format it so others can easily copy-paste:
   > *"I'm Alice — Wallet: `0xabc...` / AliceCoin: `0xdef...`"*

3. **Send tokens to each pod member.** For each person at your table:
   - Open **Coinbase Wallet** browser extension
   - Click **"Send"** at the top
   - Select **your token** (e.g., "AliceCoin") from the asset list
   - Enter **1,000** as the amount
   - Paste their **Wallet Address** (not their token contract) as the recipient
   - Confirm the transaction

   Repeat for every person at your table. You're airdropping your custom currency to build a shared economy.

> [!TIP]
> After everyone sends, each person should hold 1,000 of every pod member's token. Reminder, Coinbase Wallet auto-detects ERC-20 tokens — check the "Testnets" tab under "Assets". If a token doesn't appear, try refreshing the extension.

**✅ Success**: Everyone at your table has 1,000 of each other's tokens.

<FlavorText id="ts-airdrop-complete" emoji="💸" text="Token airdrop complete. Your pod has a shared economy." />

# 🔄 Upgrade Your Prediction Market (20 min)

_Integrate your token using the Allowance Pattern._

You are going to integrate `IERC20` into your `PredictionMarket.sol` from Part 1 so that users must wager custom tokens instead of testnet ETH.

### 🛑 The Allowance Pattern: Web3's Two-Step Payment Flow

In Web2, when you buy something on Amazon, Amazon reaches into your bank account and *pulls* the money.
In Web3, smart contracts **cannot** reach into your wallet and pull your tokens unless you explicitly give them permission first. This is called the **Allowance Pattern**.

1. **Step 1:** User calls `approve(marketContract, amount)` on the **Token** contract
2. **Step 2:** User calls `vote(...)` on the **Market** contract, which internally calls `transferFrom(user, market, amount)` — the Token contract checks the allowance and moves tokens

```
User Wallet  --approve-->  Token Contract  (allowance[user][market] = 1000)
User Wallet  --vote-->    Market Contract --transferFrom--> Token Contract
                          (Token checks allowance, then moves tokens)
```

> [!WARNING]
> **Why two steps?** Security. The user explicitly authorizes each spender. If the Market could pull tokens without prior approval, it could drain wallets. Never grant unlimited approvals to contracts you don't trust.

<QuizAllowancePattern id="ts-allowance-pattern" />

### 🧩 The Upgrade

Prompt AI to upgrade your `PredictionMarket.sol`:

<AIPrompt prompt="Upgrade this PredictionMarket contract to accept an ERC-20 token instead of ETH. Add an IERC20 token variable set in the constructor. Change vote() to accept an amount parameter and use transferFrom instead of msg.value. Add an allowance check before the transfer. Keep the CEI pattern." />

**Key changes AI should make:**
1. Add `IERC20 public token` and set it in the constructor
2. Change `vote(uint256 marketId, bool side)` to `vote(uint256 marketId, bool side, uint256 amount)`
3. Remove the `msg.value` (ETH) logic
4. Add an allowance check and use `transferFrom` to pull tokens

**✅ Review Checklist:**

<ChecklistUpgradedMarket id="checklist-upgraded-market" />

**💬 Top Questions to Ask Your AI:**

<AIPrompt prompt="If a malicious ERC-20 token has a transferFrom() that calls back into my PredictionMarket contract, can it exploit the vote() function? Show me the exact call sequence." />

<AIPrompt prompt="My contract uses token.transferFrom() after updating state. But what if the token's transferFrom returns false instead of reverting on failure? Does my contract handle that?" />

<AIPrompt prompt="Uniswap V2 uses a 'pull' pattern where users transfer tokens first, then call the contract. My contract uses approve+transferFrom. Compare the tradeoffs of each approach." />

### 🚀 Deploy the Upgraded Contract

> [!IMPORTANT]
> **Do I need to deploy a whole new contract?** Yes. Smart contracts are **immutable** — once deployed, their bytecode cannot change. Your V1 PredictionMarket (from Part 1) still lives at its original address, unchanged. The "upgrade" means deploying a **brand new contract** with the new ERC-20 logic to a **new address**. Your V1 markets and votes still exist on V1 — they don't carry over. You'll create fresh markets on V2.
>
> (Want to learn how production teams like Circle *actually* upgrade contracts in-place? See [Beyond This Workshop: Contract Upgradability](#beyond-this-workshop-contract-upgradability) at the bottom of this page.)

1. **Open the V2 Deploy Script**

    Open `script/DeployV2.s.sol`. The upgraded constructor takes two parameters: `owner_` (you) and `token_` (your ERC-20 address from earlier).

    ```copy
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.13;

    import {Script, console} from "forge-std/Script.sol";
    import {PredictionMarket} from "../src/PredictionMarket.sol";

    contract DeployV2 is Script {
        function run() external {
            vm.startBroadcast();

            // TODO: Deploy with your wallet as owner and your token address
            // PredictionMarket market = new PredictionMarket(msg.sender, IERC20(YOUR_TOKEN_ADDRESS));
            // console.log("PredictionMarket V2 deployed to:", address(market));

            vm.stopBroadcast();
        }
    }
    ```

2. **Deploy**

    ```copy
    forge script script/DeployV2.s.sol \
      --rpc-url https://sepolia.base.org \
      --account dev \
      --sender $WALLET_ADDRESS \
      --broadcast \
      --verify \
      --verifier etherscan \
      --etherscan-api-key $ETHERSCAN_API_KEY
    ```

    > [!TIP]
    > If you're in a new terminal, run `source .env` to reload all your keys and addresses.

3. **Save your V2 contract address**

    This is the address you'll use in Part 3. Save it to `.env` (overwriting the V1 address):

    ```copy
    # ✏️ Replace 0xYOUR_V2_ADDRESS with the V2 address from the deploy output
    sed -i '' 's/^PREDICTION_MARKET_ADDRESS=.*/PREDICTION_MARKET_ADDRESS=0xYOUR_V2_ADDRESS/' .env
    source .env && echo "✅ Saved: $PREDICTION_MARKET_ADDRESS"
    ```

4. **Create a Market & Test**

    - Go to your **new** V2 contract on [sepolia.basescan.org](https://sepolia.basescan.org) → "Write Contract" → Connect wallet
    - Call `createMarket("Will Base hit 100M txns?")` (or your own question)
    - Don't try to vote yet — you'll hit the allowance wall. That's the next section!

    > [!WARNING]
    > This is a **new contract address** — don't confuse it with your V1 address from Part 1. Save this V2 address; you'll need it for Part 3.

---

## 💥 Test the Allowance Flow (5 min)

It's time to test the V2 markets. This is where you will experience the two-step Web3 payment flow firsthand.

1. **The Trap:** Go to BaseScan, load your pod-mate's V2 Prediction Market, and try to call the `vote()` function.
   * **Result:** The transaction will fail/revert. Why? Because the Market contract tried to `transferFrom` your wallet, but you never gave it permission.
2. **The Fix (`approve`):** Go to the **Token Contract** on BaseScan (e.g., AliceCoin).
   * Go to "Write Contract" and call `approve(spender, amount)`.
   * **Spender** = The V2 Prediction Market Address.
   * **Amount** = A large number (e.g., `1000000000000000000000`).
3. **The Success (`transferFrom`):**
   * Go *back* to the V2 Prediction Market on BaseScan.
   * Call `vote()` again.
   * **Result:** Success! You just executed a decentralized token wager.

> [!CAUTION]
> **Common mistake:** Forgetting to call `approve` before `vote`. The transaction will revert with an allowance error. Always approve first!

| Step | Contract | Function | Purpose |
|------|----------|----------|---------|
| 1 | **Token** | `approve(market, amount)` | User authorizes Market to spend tokens |
| 2 | **Market** | `vote(..., amount)` | Market calls `token.transferFrom(user, market, amount)` |

<Scale id="ts-allowance-confidence" max={5} label="🤝 How well do you understand the approve → transferFrom flow?" />

<FlavorText id="ts-allowance-unlocked" emoji="🔓" text="Allowance pattern mastered. You control the flow of tokens." />

# 🪞 Wrap-Up & Reflection (5 min)

_Review what you built and prepare for Part 3._

### ✅ What You Accomplished

- ✅ Built and deployed your own ERC-20 token
- ✅ Distributed a custom currency to your pod.
- ✅ Upgraded a smart contract to accept ERC-20 tokens.
- ✅ Mastered the crucial two-step Allowance Pattern (`approve` and `transferFrom`) Web3 payment flow.

### 💡 Real-World Applications
The `approve/transferFrom` pattern you just built is the exact same underlying architecture used by:
* **Uniswap:** Approving your tokens so the router can swap them.
* **OpenSea:** Approving your tokens so the marketplace can buy the NFT for you.
* **Aave:** Approving your tokens so the lending pool can deposit your collateral.

### 🔄 Beyond This Workshop: Contract Upgradability

You learned in Part 1 that smart contracts are **immutable** — the bytecode at an address cannot change. So how do production teams fix bugs or add features?

The answer is the **Proxy pattern** ([ERC-1967](https://eips.ethereum.org/EIPS/eip-1967)). Instead of deploying a single contract, you deploy two:

1. **Proxy** — The address users interact with. It holds all the state (balances, mappings) but contains no logic.
2. **Implementation** — A separate contract with all the business logic. The Proxy forwards every function call to it using `delegatecall`.

To "upgrade," the owner deploys a new Implementation contract and points the Proxy to it. Users keep interacting with the same address, but the logic behind it changes.

**Real-world example:** [USDC on BaseScan](https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913#readProxyContract) — notice the "Read as Proxy" and "Write as Proxy" tabs. USDC is upgradeable because Circle operates under evolving regulatory requirements and needs the ability to update the contract's logic over time. [OpenZeppelin's proxy contracts](https://docs.openzeppelin.com/contracts/5.x/api/proxy) provide the standard implementations.

<QuipProxyPattern id="ts-proxy-pattern" />

### 📢 Share with Your Pod

**Before Part 3, collect from each pod member:**

- **Market contract address** (your upgraded PredictionMarket)
- **Token contract address** (your custom ERC-20)

> [!IMPORTANT]
> You'll need these addresses for the Aggregator Dashboard in Part 3. Collect them now — a missing or wrong address will break the entire dashboard!

---

<TemperatureCheck id="ts-understanding-check" />

<FlavorText id="ts-part2-complete" emoji="🪙" text="Token economist: certified" />

**🎉 Part 2: Token Standards Complete!**

You've built a token economy and upgraded your prediction market. Now let's build an Aggregated Prediction Market Dashboard that shows all of your pod's markets at once.


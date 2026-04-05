# 🛠️ Troubleshooting Guide

_Solutions to Common Issues in the Prediction Market Workshop_

## ⚡ Quick Reference

**🔥 Most Common Issues**:

1. ⚙️ [Environment Setup Issues](#-environment-setup)
2. 🚀 [Deployment Issues](#-deployment-issues)
3. 👛 [Wallet Issues](#-wallet-issues)
4. ⛽ [Gas and Transaction Errors](#-gas-and-transaction-errors)
5. 🔌 [Prediction Market & Token Issues](#-prediction-market--token-issues)
6. 📊 [Aggregator & Multicall Issues](#-aggregator--multicall-issues)

_How are you feeling right now?_

<TemperatureCheck id="debug-frustration-check" />

---

## ⚙️ Environment Setup

### 🧱 Node.js and npm Issues

**❌ "node: command not found"**

```bash
## Check if Node is installed
which node

## If not found, install Node.js
## macOS with Homebrew:
brew install node

## Or use nvm (see 00-setup.md)
```

**❌ "npm install fails with permission errors"**

```bash
## Fix npm permissions (macOS/Linux)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

**❌ "Wrong Node version"**

```bash
node --version  # Check current
nvm install 20
nvm use 20
```

### 🧰 Foundry Installation Issues

**❌ "foundryup command not found"**

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.zshrc  # or ~/.bashrc
foundryup
```

**❌ "Permission denied" during installation**

```bash
## Ensure PATH includes ~/.foundry/bin
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 🔗 WalletConnect Project ID

**❌ "WalletConnect Project ID is required"**

- Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Create a project and copy the **Project ID**
- Add to `.env.local`: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id`

---

## 🚀 Deployment Issues

### 🧨 Contract Deployment Failures

**❌ "Failed to get EIP-1559 fees"**

```bash
## RPC endpoint issue - the default RPC might be rate-limited.
## Try alternative RPC or legacy mode:
export RPC_URL="https://base-sepolia.blockpi.network/v1/rpc/public"
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --account dev --broadcast

## Or use the default with legacy:
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --legacy
```

**❌ "Insufficient funds for gas"**

```bash
## Check balance
cast balance YOUR_WALLET --rpc-url https://sepolia.base.org

## Get testnet ETH using the CDP faucet (see Step 1b-1c in 00-setup.md)
curl -X POST https://api.cdp.coinbase.com/platform/v2/evm/faucet \
  -H "Authorization: Bearer YOUR_CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"network":"base-sepolia","address":"YOUR_WALLET_ADDRESS","token":"eth"}'
```

**❌ "Contract creation failed"**

```bash
## Verify build first
forge build

## Debug with verbose output
forge script script/Deploy.s.sol:Deploy --rpc-url https://sepolia.base.org -vvvv
```

**❌ "Private key format error"**

> [!IMPORTANT]
> Private keys must have the `0x` prefix. `abc123...` will fail — use `0xabc123...` instead.

### 🧾 Contract Verification Issues

**❌ "Contract verification failed" on BaseScan**

```bash
## 1. Did you source your .env file?
source .env

## 2. Check your API key is correct
echo $ETHERSCAN_API_KEY

## 3. Ensure you are using the correct verifier flag
forge script script/Deploy.s.sol:Deploy --rpc-url https://sepolia.base.org --broadcast --verify
```

**❌ "Contract verification failed" (general)**

```bash
## Try manual verification on BaseScan:
## Contract address → "Verify and Publish"
```

# ⛽ Wallet & Transaction Issues

_Fixing wallet connections, network problems, and gas errors._

### 🔐 General Wallet Issues

**❌ "Wallet not connecting to app"**

1. Ensure wallet extension is installed and unlocked
2. Check you're on **Base Sepolia** network
3. Refresh the page and try again
4. Clear browser cache or try incognito
5. If the OnchainKit button spins forever, check your `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`

**❌ "Wrong network in wallet"**

1. Open Coinbase Wallet extension
2. Click network dropdown → "Show testnets"
3. Select "Base Sepolia"
4. Refresh the app

**❌ "Transaction stuck/pending"**

1. Look up transaction hash on [sepolia.basescan.org](https://sepolia.basescan.org)
2. If stuck, try speeding up in wallet
3. If failed, check error message on BaseScan

**❌ "I don't see my custom ERC-20 token in my wallet!"**

> [!TIP]
> Tokens don't appear automatically — you must manually import them. Open Coinbase Wallet → "Assets" → "Import token" → paste your deployed Token Contract Address.

---

## ⛽ Gas and Transaction Errors

### 🚧 Understanding Gas Errors

**❌ "Transaction reverted"**

> [!NOTE]
> In Web3, a "revert" means your `require` or `if (...) revert` statements failed. The transaction is cancelled and any gas spent is lost.

Common causes:

1. **Function requirements not met** – Check parameters, caller permissions
2. **Insufficient balance/allowance** – See [Prediction Market & Token Issues](#-prediction-market--token-issues)
3. **Market already resolved** – Cannot vote on resolved markets
4. **Already voted** – Each address can vote once per market
5. **Voting:** Did you send `msg.value > 0`? (Part 1)
6. **Allowance:** Did you call `approve` before voting? (Part 2)
7. **Access Control:** Did you try to call `resolveMarket` on a contract you don't own?

**🔍 How to Debug Failed Transactions**:

1. Copy the transaction hash.
2. Look it up on [sepolia.basescan.org](https://sepolia.basescan.org).
3. Look at the "Overview" tab for the exact red text error message.

**❌ "Gas estimation failed"**

Usually means the transaction would revert. Debug:

```bash
## Simulate the call
cast call MARKET_ADDRESS "vote(uint256,bool,uint256)" 0 true 1000000000000000000 \
  --rpc-url https://sepolia.base.org
```

# 🔌 Smart Contract & Token Issues

_Debugging prediction market contracts and ERC-20 token interactions._

### 📦 Module 1: Smart Contract Issues

**❌ "I created a market but I can't see it on BaseScan"**

```solidity
// Did you use the 'public' keyword on your mapping/array?
// WRONG: mapping(uint256 => Market) markets;
// RIGHT: mapping(uint256 => Market) public markets;

// If you don't use 'public', Solidity will not generate a getter function for BaseScan to read!
```

**❌ "NotOwner" when creating market**

- Only the `owner` (set in constructor) can call `createMarket`
- Verify you deployed with your address as owner
- Check: `cast call CONTRACT "owner()" --rpc-url https://sepolia.base.org`

**❌ "Execution Reverted: Not the owner" when calling resolveMarket**

```solidity
// Check who actually deployed the contract!
// The 'owner' is set to msg.sender in the constructor.
// If you used 'cast wallet import dev' but are using a different wallet in your browser to call the function, the transaction will fail.
```

**❌ "AlreadyVoted" when voting**

- Each address can vote only once per market
- Check: `cast call CONTRACT "hasVoted(uint256,address)" 0 YOUR_ADDRESS --rpc-url https://sepolia.base.org`
- If `true`, you've already voted

**❌ "MarketResolved" when voting**

- Market has been resolved; no more votes allowed

### 🪙 Module 2: Token Issues

**❌ "Transaction reverted because you forgot to call approve" / "transferFrom failed" when trying to Vote**

> [!CAUTION]
> This is the **#1 mistake** with ERC-20 + contracts. You must call `approve` on the **Token** contract **before** calling `vote` on the **Market** contract.

```
Step 1: Token.approve(marketAddress, amount)  ← Do this first!
Step 2: Market.vote(marketId, side, amount)
```

On BaseScan:

1. Go to your **Token** contract → "Write Contract"
2. Call `approve(spender: MARKET_ADDRESS, amount: AMOUNT_IN_WEI)`
3. Or use max: `115792089237316195423570985008687907853269984665640564039457584007913129639935` (Max Uint256 – infinite approval)
4. Then go to your **Market** contract and call `vote`

**❌ "InsufficientAllowance" or "ERC20: insufficient allowance"**

- You didn't call `approve`, or the approved amount is too low
- Check current allowance: `cast call TOKEN "allowance(address,address)" YOUR_ADDRESS MARKET_ADDRESS --rpc-url https://sepolia.base.org`
- Call `approve` with an amount >= what you're trying to vote with

**❌ "ERC-20 decimal math errors" / "ERC20: transfer amount exceeds balance"**

> [!WARNING]
> ERC-20 uses 18 decimals by default. `1000` in raw units is actually 0.000000000000001 tokens. For 1000 tokens, use `1000000000000000000000` (1000 * 10^18).

```javascript
// In JavaScript/TypeScript:
const amount = 1000n * 10n ** 18n;  // 1000 tokens
```

```bash
## In cast:
cast send TOKEN "transfer(address,uint256)" RECIPIENT 1000000000000000000000 --rpc-url ...
```

**❌ "Token transfers fail"**

- Insufficient balance: check `balanceOf` on the Token contract
- Transfer to zero address will revert
- Amount must be > 0

# 📊 App Issues & Reference

_Dashboard debugging, performance tips, and quick-fix lookup table._

### 🌐 Module 3: App Issues

**❌ "Wagmi multicall failing because a pod-mate gave you a bad 0x address"**

Symptoms: `useReadContracts` returns errors, or some results are null.

**Fix:**

1. Verify every address in `podConfig.ts` is a valid `0x` + 40 hex chars (42 chars total)
2. Ensure each Market and Token contract is **deployed** on Base Sepolia
3. Test each address on BaseScan: paste address → confirm contract exists and is verified
4. Ask pod-mates to double-check they shared the correct addresses (Market vs Token – don't mix them up!)

**❌ "The Next.js Dashboard is completely blank or throwing a React error"**

```typescript
// 1. Check your podConfig.ts!
// If even ONE person at your table gave you a bad contract address, Wagmi's multicall will fail and the whole dashboard will break.

// 2. Double check that every address is properly formatted with "0x"
export const POD_MARKETS = [
  {
    owner: "Alice",
    marketAddress: "0x123...abc", // Must start with 0x!
    tokenAddress: "0xdef...456",
  }
]
```

**❌ "API returns empty or undefined for some markets"**

- One or more addresses in `podConfig` may be wrong or not deployed
- Check browser console for RPC errors
- Temporarily remove markets one-by-one to isolate the bad address

**❌ "Wallet connection not working"**

```typescript
// Ensure Wagmi config has correct chain and project ID
import { getDefaultConfig } from '@coinbase/onchainkit/wagmi';

const config = getDefaultConfig({
  appName: 'Prediction Market',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [baseSepolia],
});
```

**❌ "My TransactionButton does nothing when I click it" / "Transaction button not working"**

```typescript
// Check your Wagmi useWriteContract or OnchainKit <Transaction> calls array.
// Are you passing BigInts? Web3 math requires BigInt, not standard Javascript Numbers!

// WRONG: args: [0, 1000000000000000000]
// RIGHT: args: [BigInt(0), parseEther("1")]
```

- Verify `calls` array has correct `to` and `data`
- Ensure user has enough token balance for the vote amount
- Ensure user has enough ETH for gas
- Check that `approve` is the first call and `vote` is the second (order matters)

**❌ "Batch approve + vote: first succeeds, second fails"**

- If `approve` succeeds but `vote` fails, the issue is with the Market contract (e.g., already voted, market resolved)
- If both are in one transaction and it reverts, check the revert reason on BaseScan

**❌ "CORS error when fetching RPC data"**

```typescript
// If you see CORS errors in your browser console, your RPC endpoint is rejecting your browser.
// Ensure your .env.local NEXT_PUBLIC_RPC_URL is exactly:
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

---

## ⚡️ Performance and Optimization

### 🐢 Slow Transaction Confirmation

**⏳ Transactions taking too long**

- Check network status: [sepolia.basescan.org/blocks](https://sepolia.basescan.org/blocks)
- Use slightly higher gas if needed (wallet settings)

### 🏗️ Large Contract Deployment Costs

**💰 High deployment costs**

```bash
## Check contract size
forge build --sizes

## Optimize: remove debug code, use libraries
```

---

## 📦 Quick Fixes by Symptom

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "insufficient allowance" | Forgot `approve` | Call `approve` on Token before `vote` |
| "AlreadyVoted" | Voted before | Each address votes once per market |
| Multicall returns null/error | Bad address in podConfig | Verify all addresses on BaseScan |
| Token amount too small | Decimal mistake | Use 18 decimals: 1000 * 10^18 |
| "NotOwner" | Wrong caller | Only owner can create/resolve markets |

---

> [!TIP]
> Still stuck? Ask your pod first — they have the addresses and context. Then raise your hand for a mentor!

---

## 🧑‍💻 Going Solo?

If you're working through this workshop on your own (no pod), you'll hit a wall in Parts 2–3 where the curriculum asks you to swap contract addresses with pod-mates. You can use the instructor's pre-deployed contracts instead.

> [!IMPORTANT]
> **Complete Parts 1 and 2 yourself first.** Deploy your own PredictionMarket and Token — that's where the learning happens. Only use the instructor contracts below for the _other_ entries in your `podConfig.ts` so your dashboard has something to display.

### Instructor Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| PredictionMarket V2 (ERC-20) | `0xc90423d6221145C717BE8ec5B4674edB3355DDbF` |
| Workshop Token (WKSP) | `0x339653AF501d32bf558d88a1A950a69b0c734bD1` |

### Example `podConfig.ts` for Solo Mode

After you've deployed your own V2 market and token, your `podConfig.ts` might look like:

```typescript
export const POD_MARKETS: PodMarket[] = [
  {
    owner: "You",
    marketAddress: "0xYOUR_DEPLOYED_V2_MARKET",
    tokenAddress: "0xYOUR_DEPLOYED_TOKEN",
  },
  {
    owner: "Instructor",
    marketAddress: "0xc90423d6221145C717BE8ec5B4674edB3355DDbF",
    tokenAddress: "0x339653AF501d32bf558d88a1A950a69b0c734bD1",
  },
];
```

### Limitations in Solo Mode

- You can **view** the instructor's markets and odds, but you won't be able to **vote** on them unless you hold WKSP tokens and approve the instructor's market contract.
- The "pod cross-play" sections (voting on each other's contracts, resolving markets) won't fully apply — skip those and focus on building and deploying your own contracts.
- You can mint yourself WKSP tokens by asking the instructor, or focus on your own token for the approve→vote flow.

<FreeResponse id="debug-resolution-feedback" label="What issue brought you here, and did you find a solution? If not, describe what you tried." />

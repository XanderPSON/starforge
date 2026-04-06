---
description: Install Foundry, set up your wallet, get testnet ETH, and configure your AI coding assistant.
duration: 15
---

# ⚙️ Part 0: Environment Setup

_Get Your Development Environment Ready_

## 📋 Overview

This quick setup ensures everyone has the necessary tools, API keys, and wallets ready. You'll create one dev wallet that works in both your terminal (for deploying contracts) and your browser (for the frontend in Part 3).

## 🤖 AI-First Development

_This workshop is AI-first — just like Coinbase._

You're professional engineers, and AI coding tools are part of your toolkit. Use them like the pros you are — generate boilerplate, ask questions, debug errors, explain concepts. That's the workflow, not a shortcut.

**Set up your AI coding tool of choice before anything else:**

- **[Cursor](https://cursor.com/)** — AI-native IDE with inline diffs and chat (recommended for this workshop)
- **cbcode (Claude Code)** — Coinbase's internal Claude Code wrapper for terminal-based AI development
- **OpenCode** — Open-source terminal AI coding tool

> [!IMPORTANT]
> **We recommend Cursor for this workshop.** Onchain code is often surprisingly short and elegant. Seeing the inline diffs in Cursor is more conducive to learning a new language. Claude Code works great, but if you accept changes without reading them, Day 3 Build Day will be tougher.

💡 **A note on learning with AI:** Learning feels different when you're using AI. You may not feel the same sense of mastery as if you'd coded everything by hand, and that's okay. Knowing a language in 2026 is less about how well you perform on a quiz and more about how well you can use the tools available to you to develop and debug in that framework — to get yourself unstuck and learn enough to do the next thing.

The goal by the end of this workshop is to be able to read a contract, spot what's off, and evaluate whether the AI got it right. You get there by reading the diffs and asking your AI questions along the way: "What does this function do?", "Why this pattern?", "What if I changed this?"

---

> [!WARNING]
> **Environment setup issues?** See our **[Environment Setup Troubleshooting Guide](./troubleshooting#environment-setup)** for solutions.

# 💻 Developer Tools

_Install the development tools you'll need for the workshop._

## 💻 Step 1: Install Node.js and npm

1. **Check if Already Installed**

    ```copy
    node --version  # Should show v18.x.x or higher (prefer LTS like v20)
    npm --version   # Should show 9.x.x or higher
    ```

    If Node is v18+ (prefer LTS like v20), skip to Step 2.

2. **Install Node.js using nvm**

    ```copy
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

    # Restart your terminal, or source your shell profile (see below)

    # Install and use Node.js LTS
    nvm install --lts
    nvm use --lts
    ```

3. **Verify Installation**
    ```copy
    command -v nvm  # Should print 'nvm'
    node --version  # Should show v18.x.x or higher (prefer LTS like v20)
    npm --version   # Should show 9.x.x or higher
    ```

> [!TIP]
> If commands don't work, restart your terminal or run `source ~/.zshrc` (zsh) / `source ~/.bashrc` (bash). Ensure your PATH includes `~/.nvm`. With nvm, switch Node versions using `nvm use <version>`.

---

## 🔨 Step 2: Install Foundry

Foundry is the toolkit for smart contract development.

1. **Install Foundryup**

    ```copy
    curl -L https://foundry.paradigm.xyz | bash
    ```

2. **Restart Terminal** (or run `source ~/.zshrc` (zsh) or `source ~/.bashrc` (bash))

3. **Install Foundry Toolchain**

    ```copy
    foundryup
    ```

4. **Verify Installation**
    ```copy
    forge --version
    cast --version
    anvil --version
    ```

> [!TIP]
> If Foundry commands aren't found, ensure your PATH includes `~/.foundry/bin`. Restart your terminal or run `source ~/.zshrc`.

---

# 🔐 Wallet Setup

_Create a single dev wallet that works in your terminal and browser._

> [!CAUTION]
> This wallet is for **testing only**. Never send real funds to it or reuse it in production.

## 🔑 Step 3: Create your dev wallet

You'll create a wallet directly in your terminal using Foundry, then import it into your browser extension. One wallet, two interfaces.

1. **Generate a new wallet with a recovery phrase**

    ```copy
    cast wallet new-mnemonic
    ```

    This outputs a **12-word recovery phrase**, an **Address**, and a **Private key**. You'll save all three in the next sub-step.

2. **Save your wallet info to a `.env` file**

    Create a `.env` file in your project root and paste in the values from the previous command. This file is your single source of truth for the entire workshop — every key and address goes here.

    ```copy
    # Wallet (from cast wallet new-mnemonic — DO NOT COMMIT)
    MNEMONIC="your twelve word recovery phrase goes here"
    WALLET_ADDRESS=0xYourAddressHere
    PRIVATE_KEY=0xYourPrivateKeyHere

    # API Keys (you'll fill these in during Steps 5 & 6)
    ETHERSCAN_API_KEY=
    NEXT_PUBLIC_ONCHAINKIT_API_KEY=

    # Deployed Contracts (you'll fill these in as you deploy in Parts 1 & 2)
    PREDICTION_MARKET_ADDRESS=
    WORKSHOP_TOKEN_ADDRESS=
    ```

    > [!CAUTION]
    > **Never commit `.env` to git.** Foundry's default `.gitignore` already excludes it. If yours doesn't, run: `echo ".env" >> .gitignore`

3. **Load your environment**

    ```copy
    source .env
    ```

    > [!TIP]
    > Run `source .env` every time you open a new terminal. All your keys and addresses load in one shot — no more re-exporting individual variables.

4. **Import the wallet into Foundry's keystore as `dev`**

    ```copy
    cast wallet private-key "$MNEMONIC"
    ```

    This should print the same private key from step 1. Now import it:

    ```copy
    cast wallet import dev --interactive
    ```

    When prompted:
    - **Paste your private key** (must start with `0x`)
    - **Enter a password** to encrypt the keystore (remember this — you'll type it when deploying contracts)

5. **Verify it worked**

    ```copy
    cast wallet address --account dev
    ```

    This should print the same address from step 1.

---

## 💰 Step 3b: Fund your wallet with testnet ETH

1. Go to the [CDP Faucet](https://portal.cdp.coinbase.com/products/faucet) and sign in (create a free account if needed).
2. Select **Base Sepolia** as the network.
3. Paste your wallet address from Step 3.
4. Click **Give me ETH**.

**✅ Verification**: Check your balance from the terminal:

```copy
cast balance $(cast wallet address --account dev) --rpc-url https://sepolia.base.org -e
```

You should see a non-zero ETH balance.

> [!TIP]
> If you need more testnet ETH later, just visit the faucet again with the same address.

---

## 📱 Step 4: Connect your wallet to Coinbase Wallet extension

Your dev wallet lives in Foundry's keystore, but you also need it in your browser for the frontend in Part 3 and for interacting with contracts on BaseScan.

1. **Install [Coinbase Wallet](https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad) Chrome extension** if you don't have it already.
2. **Import your dev wallet**:
    - Open the extension → **Settings** (⚙️ gear icon) → **Import recovery phrase**
    - Paste the **12-word recovery phrase** you saved from Step 3
    - Enter your Coinbase Wallet extension password when prompted
3. **Enable testnets**: Click **Settings** (⚙️ gear icon) → **Developer Settings** → toggle on **Testnets**
4. **Switch to Base Sepolia**: Use the network selector and pick **Base Sepolia**

**✅ Verification**: The address shown in the Coinbase Wallet extension matches the address from `cast wallet address --account dev`, and your testnet ETH balance is visible.

> [!WARNING]
> **Wallet issues?** Check our **[Wallet Troubleshooting](./troubleshooting#wallet-transaction-issues)** section for connection and network problems.

---

# 🔑 API Keys

_Get the remaining API keys for the workshop._

## 🔑 Step 5: Get Etherscan API Key

_You'll use this for verifying Smart Contracts_

1. Go to [Etherscan](https://etherscan.io/login) and create a free account.
2. Go to the [API Dashboard](https://etherscan.io/apidashboard).
3. Click "Add" to create a new API key. Name it "Onchain Workshop".
4. **Add it to your `.env` file** — open `.env` and fill in the `ETHERSCAN_API_KEY` line:

    ```copy
    ETHERSCAN_API_KEY=your_api_key_here
    ```

5. Reload your environment:

    ```copy
    source .env
    ```

> [!NOTE]
> Etherscan multichain keys work automatically on BaseScan — no separate API key needed.

---

## 🔑 Step 6: Create a CDP Client API Key

_You'll use this in Part 3 for OnchainKit (wallet connections, Smart Wallet features)._

1. Go to the [CDP Portal](https://portal.cdp.coinbase.com/) — you already have an account from the faucet step.
2. Navigate to **API Keys** in the left sidebar.
3. Click **Create API Key** and choose **Client API Key** (not Secret API Key).
4. Name it "Onchain Workshop".
5. **Add it to your `.env` file** — open `.env` and fill in the `NEXT_PUBLIC_ONCHAINKIT_API_KEY` line:

    ```copy
    NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_client_api_key_here
    ```

6. Reload: `source .env`

> [!WARNING]
> CDP has two key types — **Client** and **Secret**. You want **Client API Key**. Client keys are safe to use in frontend code (`NEXT_PUBLIC_` env vars). Secret keys are for server-side-only API calls and must never be exposed in browser code.

<QuipAPIKeyTypes id="setup-api-key-types" />

# ✅ Verification & Ready

_Confirm everything works before starting the workshop._

## ✅ Quick Verification

Let's verify everything works:

1. **Test Node.js**

    ```copy
    node --version  # Should show v18.x.x or higher
    npm --version   # Should show 9.x.x or higher
    ```

2. **Test Foundry**

    ```copy
    forge --version
    cast --version
    anvil --version
    ```

3. **Test Dev Wallet**

    ```copy
    cast wallet address --account dev
    cast balance $(cast wallet address --account dev) --rpc-url https://sepolia.base.org -e
    ```

    You should see your address and a non-zero ETH balance.

4. **Test Browser Wallet**
    - Open the Coinbase Wallet extension
    - Verify you're on Base Sepolia network
    - Confirm the address matches your CLI wallet
    - Check you have testnet ETH

5. **Check Your `.env` File**

    ```copy
    source .env && echo "WALLET=$WALLET_ADDRESS" && echo "ETHERSCAN=$ETHERSCAN_API_KEY" && echo "CDP=$NEXT_PUBLIC_ONCHAINKIT_API_KEY"
    ```

    All three values should print (no blanks).

<ChecklistSetupEnv id="setup-env-checklist" />

---

## 🚀 Ready for the Workshop!

Once your setup is complete:

1. ✅ All tools installed and verified
2. ✅ Dev wallet works in CLI (`cast wallet address --account dev`) and browser (Coinbase Wallet extension)
3. ✅ Testnet ETH funded
4. ✅ `.env` file has all keys: `WALLET_ADDRESS`, `ETHERSCAN_API_KEY`, `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

> [!IMPORTANT]
> Proceed only when **all checks are green**. Missing tools or keys will block you in later modules.

<TemperatureCheck id="setup-confidence-check" />

**Let's start [🔐 Part 1: Smart Contracts](./01-smart-contracts)**

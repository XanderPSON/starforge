# ⚙️ Environment Setup

_Get Your Development Environment Ready_

## 📋 Overview

This quick setup ensures everyone has the necessary tools, API keys, and wallets ready.

## ✅ Setup Checklist (15 minutes)

> [!WARNING]
> **Environment setup issues?** See our **[Environment Setup Troubleshooting Guide](./troubleshooting.md#-environment-setup)** for solutions.

---

### 📱 Step 1: Set up a new work wallet

> [!CAUTION]
> Use a **fresh, test-only wallet**. Never reuse this wallet in production or for real funds.

1. **Install [Coinbase Wallet](https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad) Chrome extension** and create a wallet if you don't have one already.
2. **Enable testnets**: Click **Settings** (⚙️ gear icon) → **Networks** → select the **Testnets** tab and confirm **Base Sepolia** is listed. (You won't be able to switch to it yet — the network appears in your wallet's network selector once it has funds.)
3. **Copy your wallet address** — you'll need it in Step 1b to fund your wallet.

**✅ Verification**: After funding your wallet in Step 1c, Base Sepolia will appear in your network selector with a test ETH balance.

> [!WARNING]
> **Wallet issues?** Check our **[Wallet Troubleshooting](./troubleshooting.md#-wallet-issues)** section for connection and network problems.

---

### 🔑 Step 1b: Get a CDP API Key

You'll use the [Coinbase Developer Platform (CDP)](https://portal.cdp.coinbase.com/) faucet to get free testnet ETH — no wallet connection required.

1. Go to [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/) and sign in (create a free account if needed).
2. Navigate to [API Keys](https://portal.cdp.coinbase.com/projects/api-keys).
3. Select the **Client API Key** tab and create a new key.
4. Copy the **API Key ID** — you'll use this as your bearer token to request testnet ETH.

---

### 💰 Step 1c: Fund your wallet with testnet ETH

Run this command, replacing `YOUR_WALLET_ADDRESS` with your Coinbase Wallet address and `YOUR_CDP_API_KEY` with the key from Step 1b:

```bash
curl -X POST https://api.cdp.coinbase.com/platform/v2/evm/faucet \
  -H "Authorization: Bearer YOUR_CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"network":"base-sepolia","address":"YOUR_WALLET_ADDRESS","token":"eth"}'
```

You should get a JSON response with a `transactionHash`. Your testnet ETH will arrive within seconds.

> [!TIP]
> You can also fund your Foundry CLI wallet (Step 3) using the same command — just swap in that wallet's address.

**✅ Verification**: Open Coinbase Wallet on Base Sepolia and confirm a test ETH balance.

# 💻 Developer Tools

_Install the development tools and get API keys for the workshop._

## 💻 Step 2: Install Node.js and npm

1. **Check if Already Installed**

    ```bash
    node --version  # Should show v18.x.x or higher (prefer LTS like v20)
    npm --version   # Should show 9.x.x or higher
    ```

    If Node is v18+ (prefer LTS like v20), skip to Step 3.

2. **Install Node.js using nvm**

    ```bash
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

    # Restart your terminal, or source your shell profile (see below)

    # Install and use Node.js LTS
    nvm install --lts
    nvm use --lts
    ```

3. **Verify Installation**
    ```bash
    command -v nvm  # Should print 'nvm'
    node --version  # Should show v18.x.x or higher (prefer LTS like v20)
    npm --version   # Should show 9.x.x or higher
    ```

> [!TIP]
> If commands don't work, restart your terminal or run `source ~/.zshrc` (zsh) / `source ~/.bashrc` (bash). Ensure your PATH includes `~/.nvm`. With nvm, switch Node versions using `nvm use <version>`.

---

## 🔨 Step 3: Install Foundry

Foundry is the toolkit for smart contract development.

1. **Install Foundryup**

    ```bash
    curl -L https://foundry.paradigm.xyz | bash
    ```

2. **Restart Terminal** (or run `source ~/.zshrc` (zsh) or `source ~/.bashrc` (bash))

3. **Install Foundry Toolchain**

    ```bash
    foundryup
    ```

4. **Verify Installation**
    ```bash
    forge --version
    cast --version
    anvil --version
    ```

5. **Import your Coinbase Wallet into Foundry**
    1. Copy your private key from Coinbase Wallet extension settings
    2. Run `cast wallet import dev --interactive` and input your private key when prompted (`"dev"` is now your account name for this foundry wallet)
    3. Enter a password into the prompt to encrypt your private key

6. **Fund your Foundry wallet** (if it's a different address from your browser wallet)

    Check your Foundry wallet address:
    ```bash
    cast wallet address --account dev
    ```

    Then fund it using the CDP faucet from Step 1c:
    ```bash
    curl -X POST https://api.cdp.coinbase.com/platform/v2/evm/faucet \
      -H "Authorization: Bearer YOUR_CDP_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"network":"base-sepolia","address":"YOUR_FOUNDRY_WALLET_ADDRESS","token":"eth"}'
    ```

> [!CAUTION]
> Never share your private key or paste it into websites. The `cast wallet import` command encrypts it locally — this is the safe way to use it with Foundry.

> [!TIP]
> If Foundry commands aren't found, ensure your PATH includes `~/.foundry/bin`. Restart your terminal or run `source ~/.zshrc`.

---

## 🔑 Step 5: Get Etherscan API Key

_You'll use this for verifying Smart Contracts_

1. Go to [Etherscan](https://etherscan.io/login) and create a free account.
2. Go to the [API Dashboard](https://etherscan.io/apidashboard).
3. Click "Add" to create a new API key. Name it "Onchain Workshop".
4. Copy the API key.

> [!NOTE]
> Etherscan multichain keys work automatically on BaseScan — no separate API key needed.

---

## 🔗 Step 6: Get WalletConnect Project ID

_The frontend in Part 3 uses WalletConnect for wallet connections. You need a free Project ID._

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/) and sign up for a free account.
2. Click "Create Project" and give it a name (e.g., "Prediction Market Workshop").
3. From the project dashboard, copy the **Project ID** (a long hex string). Save it for Part 3 – you'll add it to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

# ✅ Verification & Ready

_Confirm everything works before starting the workshop._

## ✅ Quick Verification

Let's verify everything works:

1. **Test Node.js**

    ```bash
    node --version  # Should show v18.x.x or higher
    npm --version   # Should show 9.x.x or higher
    ```

2. **Test Foundry**

    ```bash
    forge --version
    cast --version
    anvil --version
    ```

3. **Test Wallet and Testnet ETH**
    - Open the Coinbase Wallet extension
    - Verify you're on Base Sepolia network
    - Check you have some testnet ETH

4. **Check Your Keys**
    - You have your CDP API Key saved.
    - You have your Etherscan API Key saved.
    - You have your WalletConnect Project ID saved.

<ChecklistSetupEnv id="setup-env-checklist" />

---

## 🚀 Ready for the Workshop!

Once your setup is complete:

1. ✅ All tools installed and verified
2. ✅ Testnet ETH in wallet
3. ✅ CDP API key ready
4. ✅ Etherscan API key ready
5. ✅ WalletConnect Project ID ready

> [!IMPORTANT]
> Proceed only when **all checks are green**. Missing tools or keys will block you in later modules.

<TemperatureCheck id="setup-confidence-check" />

**Let's start [🔐 Part 1: Smart Contracts](./01-smart-contracts.md)**

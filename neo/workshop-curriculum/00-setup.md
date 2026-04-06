# ⚙️ Environment Setup

_Get Your Development Environment Ready_

## 📋 Overview

This quick setup ensures everyone has the necessary tools, API keys, and wallets ready. You'll create one dev wallet that works in both your terminal (for deploying contracts) and your browser (for the frontend in Part 3).

## ✅ Setup Checklist (15 minutes)

> [!WARNING]
> **Environment setup issues?** See our **[Environment Setup Troubleshooting Guide](./troubleshooting.md#-environment-setup)** for solutions.

# 💻 Developer Tools

_Install the development tools you'll need for the workshop._

## 💻 Step 1: Install Node.js and npm

1. **Check if Already Installed**

    ```bash
    node --version  # Should show v18.x.x or higher (prefer LTS like v20)
    npm --version   # Should show 9.x.x or higher
    ```

    If Node is v18+ (prefer LTS like v20), skip to Step 2.

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

## 🔨 Step 2: Install Foundry

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

    ```bash
    cast wallet new-mnemonic
    ```

    This outputs a **12-word recovery phrase** and an **Address**. Copy the recovery phrase — you'll need it for both the CLI and the browser extension.

    > [!CAUTION]
    > **Save your recovery phrase somewhere safe** (e.g., a password manager or a local note). You need it in Step 3 and Step 4. Do not share it or commit it to git.

2. **Get your private key from the recovery phrase**

    ```bash
    cast wallet private-key "YOUR TWELVE WORD RECOVERY PHRASE GOES HERE"
    ```

    This outputs a hex private key starting with `0x`. Copy it.

3. **Import the wallet into Foundry's keystore as `dev`**

    ```bash
    cast wallet import dev --interactive
    ```

    When prompted:
    - **Paste your private key** from the previous step (must start with `0x`)
    - **Enter a password** to encrypt the keystore (remember this — you'll type it when deploying contracts)

4. **Verify it worked**

    ```bash
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
> **Wallet issues?** Check our **[Wallet Troubleshooting](./troubleshooting.md#-wallet-issues)** section for connection and network problems.

---

# 🔑 API Keys

_Get the remaining API keys for the workshop._

## 🔑 Step 5: Get Etherscan API Key

_You'll use this for verifying Smart Contracts_

1. Go to [Etherscan](https://etherscan.io/login) and create a free account.
2. Go to the [API Dashboard](https://etherscan.io/apidashboard).
3. Click "Add" to create a new API key. Name it "Onchain Workshop".
4. Copy the API key and export it in your terminal:

    ```copy
    export ETHERSCAN_API_KEY=your_api_key_here
    export WALLET_ADDRESS=$(cast wallet address --account dev)
    ```

    > [!TIP]
    > `WALLET_ADDRESS` auto-derives your address from the `dev` keystore you created in Step 4. You'll use `$WALLET_ADDRESS` in every deploy command — no more copy-pasting addresses.

> [!NOTE]
> Etherscan multichain keys work automatically on BaseScan — no separate API key needed.

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

3. **Test Dev Wallet**

    ```bash
    cast wallet address --account dev
    cast balance $(cast wallet address --account dev) --rpc-url https://sepolia.base.org -e
    ```

    You should see your address and a non-zero ETH balance.

4. **Test Browser Wallet**
    - Open the Coinbase Wallet extension
    - Verify you're on Base Sepolia network
    - Confirm the address matches your CLI wallet
    - Check you have testnet ETH

5. **Check Your Keys**
    - You have your Etherscan API Key saved.

<ChecklistSetupEnv id="setup-env-checklist" />

---

## 🚀 Ready for the Workshop!

Once your setup is complete:

1. ✅ All tools installed and verified
2. ✅ Dev wallet works in CLI (`cast wallet address --account dev`) and browser (Coinbase Wallet extension)
3. ✅ Testnet ETH funded
4. ✅ Etherscan API key ready

> [!IMPORTANT]
> Proceed only when **all checks are green**. Missing tools or keys will block you in later modules.

<TemperatureCheck id="setup-confidence-check" />

**Let's start [🔐 Part 1: Smart Contracts](./01-smart-contracts.md)**

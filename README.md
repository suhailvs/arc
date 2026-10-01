# Arc Mutual Credit POC

A tiny LETS-style mutual-credit ledger deployed on Arc mainnet.

## Model

- The smart contract is a **zero-sum credit ledger**, not an ERC-20.
- Every member joins with a fixed credit limit of 1000.
- A member may spend into a negative balance up to that limit.
- A positive transfer increases the recipient balance and decreases the sender balance by exactly the same amount.
- No USDC is held by the contract.
- Arc is used for wallet identity, immutable settlement of the ledger, and USDC-denominated gas.

## Run frontend

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_ARC_NETWORK to testnet or mainnet.
# Configure the matching contract address after deployment.
npm run dev
```

`NEXT_PUBLIC_ARC_NETWORK` selects the Arc network at build time. Use `testnet` (the default) or `mainnet`.

## Deploy contract with Foundry

Install Foundry, then:

```bash
export ARC_MAINNET_RPC_URL=https://rpc.mainnet.arc.io
export ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.io
export PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
forge build
forge script script/Deploy.s.sol --rpc-url "$ARC_TESTNET_RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
# ~/.foundry/bin/forge script script/Deploy.s.sol --rpc-url "$ARC_TESTNET_RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

Copy the deployed `MutualCredit` address into `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

Then restart Next.js.

## Demo flow

1. Wallet A connects and joins with a fixed limit of `1000`.
2. Wallet B connects and joins with a fixed limit of `1000`.
3. A transfers `20` credit to B.
4. A becomes `-20`; B becomes `+20`.
5. B can later transfer `20` back after receiving another service.

## Important POC limitations

This is intentionally tiny. It has no exchange/group management, reputation, dispute resolution, identity layer, admin controls, credit scoring, service listings, expiry, fees, or USDC redemption. Those should be added only after the core mutual-credit flow is proven.

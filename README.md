# Arc Mutual Credit POC

A tiny LETS-style mutual-credit ledger deployed on Arc mainnet.

## Model

- The smart contract is a **zero-sum credit ledger**, not an ERC-20.
- A member joins with a positive credit limit.
- A member may spend into a negative balance up to that limit.
- A positive transfer increases the recipient balance and decreases the sender balance by exactly the same amount.
- No USDC is held by the contract.
- Arc is used for wallet identity, immutable settlement of the ledger, and USDC-denominated gas.

## Arc mainnet

- Chain ID: `5042`
- RPC: `https://rpc.mainnet.arc.io`
- Explorer: `https://explorer.arc.io`
- Native gas asset: USDC (18 decimals)
- Arc USDC ERC-20 predeploy: `0x3600000000000000000000000000000000000000` (not used by this POC)

## Run frontend

```bash
npm install
cp .env.example .env.local
# edit NEXT_PUBLIC_CONTRACT_ADDRESS after deployment
npm run dev
```

## Deploy contract with Foundry

Install Foundry, then:

```bash
export ARC_MAINNET_RPC_URL=https://rpc.mainnet.arc.io
export ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.io
export PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
forge build
forge script script/Deploy.s.sol --rpc-url "$ARC_TESTNET_RPC_URL" --private-key "$PRIVATE_KEY" --broadcast
```

Copy the deployed `MutualCredit` address into `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

Then restart Next.js.

## Demo flow

1. Wallet A connects and joins with limit `100`.
2. Wallet B connects and joins with limit `100`.
3. A transfers `20` credit to B.
4. A becomes `-20`; B becomes `+20`.
5. B can later transfer `20` back after receiving another service.

## Important POC limitations

This is intentionally tiny. It has no exchange/group management, reputation, dispute resolution, identity layer, admin controls, credit scoring, service listings, expiry, fees, or USDC redemption. Those should be added only after the core mutual-credit flow is proven.

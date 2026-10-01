'use client';

import { useEffect, useState } from 'react';
import { Address, formatUnits, isAddress, parseUnits } from 'viem';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { arc, arcTestnet } from '../lib/arc';
import { abi, CONTRACT_ADDRESS, TESTNET_CONTRACT_ADDRESS } from '../lib/contract';

const ZERO = '0x0000000000000000000000000000000000000000' as Address;

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function errorText(error: unknown) {
  if (!error) return '';
  const e = error as { shortMessage?: string; message?: string };
  return e.shortMessage || e.message || 'Transaction failed';
}

function creditToInt(value: string) {
  return parseUnits(value, 18);
}

export default function Home() {
  const { address, chainId, isConnected } = useAccount();
  const isTestnet = chainId === arcTestnet.id;
  const network = isTestnet ? arcTestnet : arc;
  const contractAddress = isTestnet ? TESTNET_CONTRACT_ADDRESS : CONTRACT_ADDRESS;
  const { connect, connectors, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('10');
  const [status, setStatus] = useState('');
  const [lastHash, setLastHash] = useState<`0x${string}` | undefined>();
  const [lastHashChainId, setLastHashChainId] = useState<number>(arc.id);

  const contractConfigured = contractAddress !== ZERO;
  const onNetwork = chainId === network.id;

  const memberQuery = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'members',
    args: address ? [address] : undefined,
    chainId: network.id,
    query: {
      enabled: isConnected && contractConfigured && onNetwork && !!address,
    },
  });

  const { writeContractAsync, isPending: walletPending, error: writeError } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: lastHash,
    chainId: lastHashChainId,
    confirmations: 1,
  });

  useEffect(() => {
    if (writeError) setStatus(`Transaction error: ${errorText(writeError)}`);
  }, [writeError]);

  useEffect(() => {
    if (!lastHash) return;
    if (receipt.isLoading) {
      setStatus(`Transaction submitted. Waiting for ${network.name} confirmation…`);
    } else if (receipt.isSuccess) {
      setStatus(`Confirmed on ${network.name}. Refreshing your exchange membership…`);
      memberQuery.refetch().then(() => {
        setStatus(`Confirmed on ${network.name}. You are now a member of the exchange.`);
      });
    } else if (receipt.isError) {
      setStatus(`Transaction reverted or could not be confirmed: ${errorText(receipt.error)}`);
    }
  }, [lastHash, receipt.isLoading, receipt.isSuccess, receipt.isError, receipt.error, memberQuery.refetch]);

  const member = memberQuery.data;
  const joined = member?.[0] === true;
  const creditLimit = member?.[1] as bigint | undefined;
  const balance = member?.[2] as bigint | undefined;

  async function prepare() {
    if (!contractConfigured) {
      setStatus(`Set ${isTestnet ? 'NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS' : 'NEXT_PUBLIC_CONTRACT_ADDRESS'} in .env.local first.`);
      return false;
    }
    if (!isConnected || !address) {
      setStatus('Connect your wallet first.');
      return false;
    }
    if (!onNetwork) {
      setStatus(`Switch MetaMask to ${network.name}.`);
      try {
        await switchChain({ chainId: network.id });
      } catch (e) {
        setStatus(`Network switch failed: ${errorText(e)}`);
        return false;
      }
      return false;
    }
    return true;
  }

  async function join() {
    if (!(await prepare())) return;

    try {
      setLastHash(undefined);
      setLastHashChainId(network.id);
      setStatus(`Confirm the Join transaction on ${network.name} in MetaMask…`);
      const hash = await writeContractAsync({
        address: contractAddress,
        abi,
        functionName: 'join',
        args: [],
        chainId: network.id,
      });
      setLastHash(hash);
      setStatus(`Transaction submitted: ${short(hash)}`);
    } catch (e) {
      setStatus(`Join failed: ${errorText(e)}`);
    }
  }

  async function send() {
    if (!(await prepare())) return;
    if (!isAddress(to)) {
      setStatus('Enter a valid recipient address.');
      return;
    }
    let value: bigint;
    try {
      value = creditToInt(amount);
    } catch {
      setStatus('Amount must be a valid number.');
      return;
    }
    if (value <= 0n) {
      setStatus('Amount must be greater than zero.');
      return;
    }

    try {
      setLastHash(undefined);
      setLastHashChainId(network.id);
      setStatus(`Confirm the credit transfer on ${network.name} in MetaMask…`);
      const hash = await writeContractAsync({
        address: contractAddress,
        abi,
        functionName: 'transferCredit',
        args: [to as Address, value],
        chainId: network.id,
      });
      setLastHash(hash);
      setStatus(`Transaction submitted: ${short(hash)}`);
    } catch (e) {
      setStatus(`Transfer failed: ${errorText(e)}`);
    }
  }

  return (
    <main className="wrap">
      <div className="row between">
        <div>
          <h1>Arc Mutual Credit</h1>
          <div className="muted">Tiny LETS-style proof of concept</div>
        </div>
        <div className="row">
          <label htmlFor="network">Network</label>
          <select id="network" className="input" style={{ width: 'auto', margin: 0 }} value={chainId === arcTestnet.id ? arcTestnet.id : arc.id} disabled={!isConnected || switching} onChange={(e) => switchChain({ chainId: Number(e.target.value) as typeof arc.id | typeof arcTestnet.id })}>
            <option value={arc.id}>Arc Mainnet</option>
            <option value={arcTestnet.id}>Arc Testnet</option>
          </select>
        {isConnected ? (
          <button className="btn" onClick={() => disconnect()}>
            Disconnect {short(address!)}
          </button>
        ) : (
          <button
            className="btn"
            disabled={connecting || !connectors[0]}
            onClick={() => connect({ connector: connectors[0] })}
          >
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        )}
        </div>
      </div>

      <div className="notice">
        {network.name} · chain {network.id} · USDC pays gas · credit balances are internal zero-sum units, not USDC.
      </div>

      {!contractConfigured && (
        <div className="card error">
          <b>{network.name} contract address not configured.</b>
          <p>Deploy the included contract and set {isTestnet ? 'NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS' : 'NEXT_PUBLIC_CONTRACT_ADDRESS'} in .env.local.</p>
        </div>
      )}

      {isConnected && !onNetwork && (
        <div className="card warning">
          <b>Wrong network</b>
          <p>MetaMask is on chain {chainId ?? 'unknown'}, but the selected network is {network.name} ({network.id}).</p>
          <button className="btn" disabled={switching} onClick={() => switchChain({ chainId: network.id })}>
            {switching ? 'Switching…' : `Switch to ${network.name}`}
          </button>
        </div>
      )}

      {!isConnected ? (
        <div className="card">
          <h2>How it works</h2>
          <p>Join the exchange with a fixed credit limit of 1000. When you provide a service, another member transfers credit to you. When you consume a service, your balance can go negative up to your limit.</p>
          <p><b>Example:</b> Alice −20, Bob +20. Total system credit remains exactly 0.</p>
        </div>
      ) : onNetwork && contractConfigured ? (
        <>
          {memberQuery.isLoading ? (
            <div className="card">Reading your membership from {network.name}…</div>
          ) : memberQuery.isError ? (
            <div className="card error">
              <b>Could not read the contract.</b>
              <p>{errorText(memberQuery.error)}</p>
            </div>
          ) : (
            <>
              <div className="grid">
                <div className="card">
                  <div className="muted">Your balance</div>
                  <div className={`big ${(balance ?? 0n) >= 0n ? 'positive' : 'negative'}`}>
                    {balance === undefined ? '—' : formatUnits(balance, 18)}
                  </div>
                </div>
                <div className="card">
                  <div className="muted">Credit limit</div>
                  <div className="big">{creditLimit === undefined ? '—' : formatUnits(creditLimit, 18)}</div>
                </div>
              </div>

              {!joined ? (
                <div className="card">
                  <h2>Join exchange</h2>
                  <p className="muted">This writes your membership to the {network.name} smart contract. It does not transfer USDC.</p>
                  <p>Every member receives a credit limit of 1000.</p>
                  <button className="btn" disabled={walletPending || receipt.isLoading} onClick={join}>
                    {walletPending ? 'Waiting for MetaMask…' : receipt.isLoading ? 'Confirming…' : 'Join exchange'}
                  </button>
                </div>
              ) : (
                <div className="card success">
                  <h2>✓ Joined exchange</h2>
                  <p>You are a member. Your balance and credit limit are stored on {network.name}.</p>
                </div>
              )}

              {joined && (
                <div className="card">
                  <h2>Record a trade</h2>
                  <p className="muted">Send positive credit to the member who provided you value. Membership and credit balances are internal; USDC is not moved.</p>
                  <label>Recipient wallet</label>
                  <input className="input" placeholder="0x…" value={to} onChange={(e) => setTo(e.target.value)} />
                  <label>Credit amount</label>
                  <input className="input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <button className="btn" disabled={walletPending || receipt.isLoading} onClick={send}>
                    {walletPending ? 'Waiting for MetaMask…' : receipt.isLoading ? 'Confirming…' : 'Transfer credit'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : null}

      {status && (
        <div className="card">
          <b>Status</b>
          <p>{status}</p>
          {lastHash && (
            <a className="link" href={`${(lastHashChainId === arcTestnet.id ? arcTestnet : arc).blockExplorers.default.url.replace(/\/$/, '')}/tx/${lastHash}`} target="_blank" rel="noreferrer">
              View transaction on {(lastHashChainId === arcTestnet.id ? arcTestnet : arc).name} Explorer ↗
            </a>
          )}
        </div>
      )}

    </main>
  );
}

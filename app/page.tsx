'use client';
import { useEffect, useState } from 'react';
import { parseUnits, formatUnits, isAddress, Address } from 'viem';
import { useAccount,useConnect,useDisconnect,useReadContract,useWriteContract,useWaitForTransactionReceipt } from 'wagmi';
import { arc } from '../lib/arc';
import { abi, CONTRACT_ADDRESS } from '../lib/contract';

function short(a:string){return a.slice(0,6)+'…'+a.slice(-4)}
export default function Home(){
 const {address,isConnected}=useAccount(); const {connect,connectors}=useConnect(); const {disconnect}=useDisconnect();
 const [limit,setLimit]=useState('100'); const [to,setTo]=useState(''); const [amount,setAmount]=useState('10'); const [status,setStatus]=useState('');
 const {data:member,refetch}=useReadContract({address:CONTRACT_ADDRESS,abi,functionName:'members',args:address?[address]:undefined,query:{enabled:isConnected&&CONTRACT_ADDRESS!=='0x0000000000000000000000000000000000000000'}});
 const {writeContract,data:hash,error}=useWriteContract(); const receipt=useWaitForTransactionReceipt({hash});
 useEffect(()=>{if(receipt.isSuccess){setStatus('Confirmed: '+hash);refetch()}},[receipt.isSuccess,hash,refetch]);
 useEffect(()=>{if(error)setStatus(error.message.slice(0,180))},[error]);
 const joined=Boolean(member?.[0]); const balance=member?.[2] as bigint|undefined; const creditLimit=member?.[1] as bigint|undefined;
 function ensure(){if(CONTRACT_ADDRESS==='0x0000000000000000000000000000000000000000') {setStatus('Set NEXT_PUBLIC_CONTRACT_ADDRESS first.');return false} return true}
 function join(){if(!ensure())return; setStatus('Waiting for wallet…');writeContract({address:CONTRACT_ADDRESS,abi,functionName:'join',args:[parseUnits(limit,2)*10000000000000000n]})}
 function send(){if(!ensure()||!isAddress(to))return setStatus('Enter a valid recipient address.'); if(Number(amount)<=0)return setStatus('Amount must be positive.'); setStatus('Waiting for wallet…'); writeContract({address:CONTRACT_ADDRESS,abi,functionName:'transferCredit',args:[to as Address,parseUnits(amount,2)*10000000000000000n]})}
 return <main className="wrap">
  <div className="row between"><div><h1>Arc Mutual Credit</h1><div className="muted">Tiny LETS-style proof of concept</div></div>{isConnected?<button className="btn" onClick={()=>disconnect()}>Disconnect {short(address!)}</button>:<button className="btn" onClick={()=>connect({connector:connectors[0]})}>Connect wallet</button>}</div>
  <div className="notice">Arc mainnet · chain {arc.id} · USDC pays gas · credit balances are internal zero-sum units, not USDC.</div>
  {!isConnected?<div className="card"><h2>How it works</h2><p>Join the exchange with a credit limit. When you provide a service, another member transfers credit to you. When you consume a service, your balance can go negative up to your limit.</p><p><b>Example:</b> Alice −20, Bob +20. Total system credit remains exactly 0.</p></div>:<>
   <div className="grid"><div className="card"><div className="muted">Your balance</div><div className={'big '+((balance||0n)>=0n?'positive':'negative')}>{balance===undefined?'—':formatUnits(balance,18)}</div></div><div className="card"><div className="muted">Credit limit</div><div className="big">{creditLimit===undefined?'—':formatUnits(creditLimit,18)}</div></div></div>
   {!joined?<div className="card"><h2>Join exchange</h2><label>Credit limit</label><input className="input" value={limit} onChange={e=>setLimit(e.target.value)} /><button className="btn" onClick={join}>Join</button></div>:<div className="card"><h2>Record a trade</h2><p className="muted">Send positive credit to the member who provided you value.</p><label>Recipient wallet</label><input className="input" placeholder="0x…" value={to} onChange={e=>setTo(e.target.value)} /><label>Credit amount</label><input className="input" value={amount} onChange={e=>setAmount(e.target.value)} /><button className="btn" onClick={send}>Transfer credit</button></div>}
   {status&&<div className="card"><b>Status</b><p>{status}</p>{hash&&<a className="link" href={'https://explorer.arc.io/tx/'+hash} target="_blank">View transaction</a>}</div>}
  </>}
  <div className="card"><h3>Contract</h3><code>{CONTRACT_ADDRESS}</code><p className="muted">Deploy the included contract, then set NEXT_PUBLIC_CONTRACT_ADDRESS.</p></div>
 </main>
}

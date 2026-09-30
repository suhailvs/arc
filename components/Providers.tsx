'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { arc } from '../lib/arc';
import { useState } from 'react';
const config=createConfig({chains:[arc],connectors:[injected()],transports:{[arc.id]:http('https://rpc.mainnet.arc.io')}});
export function Providers({children}:{children:React.ReactNode}){const [q]=useState(()=>new QueryClient());return <WagmiProvider config={config}><QueryClientProvider client={q}>{children}</QueryClientProvider></WagmiProvider>}

'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { activeArcNetwork } from '../lib/arc';
import { useState } from 'react';
// Wallet state comes from browser storage and can differ from the server render.
// Wagmi SSR mode defers that state until hydration completes.
const config=createConfig({ssr:true,chains:[activeArcNetwork],connectors:[injected()],transports:{[activeArcNetwork.id]:http()}});
export function Providers({children}:{children:React.ReactNode}){const [q]=useState(()=>new QueryClient());return <WagmiProvider config={config}><QueryClientProvider client={q}>{children}</QueryClientProvider></WagmiProvider>}

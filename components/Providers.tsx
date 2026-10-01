'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
// import { activeArcNetwork } from '../lib/arc';
import { useState } from 'react';
// Wallet state comes from browser storage and can differ from the server render.
// Wagmi SSR mode defers that state until hydration completes.
import { arc, arcTestnet, activeIsTestnet } from '../lib/arc';

const config = createConfig({
  ssr: true,
  chains: activeIsTestnet ? [arcTestnet, arc] : [arc, arcTestnet],
  connectors: [injected()],
  transports: { [arc.id]: http(), [arcTestnet.id]: http() },
});
export function Providers({children}:{children:React.ReactNode}){const [q]=useState(()=>new QueryClient());return <WagmiProvider config={config}><QueryClientProvider client={q}>{children}</QueryClientProvider></WagmiProvider>}

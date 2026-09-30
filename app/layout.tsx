import './globals.css';
import { Providers } from '../components/Providers';
export const metadata={title:'Arc Mutual Credit POC',description:'Tiny mutual-credit proof of concept on Arc mainnet'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers>{children}</Providers></body></html>}

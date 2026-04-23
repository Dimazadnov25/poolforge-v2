import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { useMemo } from 'react'
import PoolDashboard from './components/PoolDashboard'
import '@solana/wallet-adapter-react-ui/styles.css'

const RPC = import.meta.env.VITE_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=e129ef66-4dde-4f0d-bc1b-e4197604806d'

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])
  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <PoolDashboard />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

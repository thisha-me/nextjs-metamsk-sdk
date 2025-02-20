"use client";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const {
    account,
    chainId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork
  } = useWallet();

  return (
    <div>
      {account ? (
        <div>
          <p>Connected: {account}</p>
          <p>Chain ID: {chainId}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
          <button onClick={() => switchNetwork('0x1')}>Switch to Mainnet</button>
        </div>
      ) : (
        <button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

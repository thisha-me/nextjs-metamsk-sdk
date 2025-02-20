'use client';
import { createContext, useEffect, useState } from 'react';
import { MetaMaskSDK } from '@metamask/sdk';

export const WalletContext = createContext();

let MMSDK;

// Initialize SDK only on client side
if (typeof window !== 'undefined') {
  MMSDK = new MetaMaskSDK({
    dappMetadata: {
      name: "Your App Name",
      url: window.location.href,
    }
  });
}

const Web3Provider = ({ children }) => {
  const [state, setState] = useState({
    account: null,
    chainId: null,
    isConnecting: false,
    error: null,
    ethereum: null,
    sdk: MMSDK
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const ethereum = MMSDK.getProvider();
    setState(prev => ({ ...prev, ethereum }));

    const connectWallet = async () => {
      try {
        setState(prev => ({ ...prev, isConnecting: true }));
        // Request account access if needed
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          setState(prev => ({
            ...prev,
            account: accounts[0],
            chainId,
            isConnecting: false
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to connect to MetaMask',
          isConnecting: false
        }));
      }
    };

    // Check if already connected
    ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length > 0) {
          setState(prev => ({ ...prev, account: accounts[0] }));
          ethereum.request({ method: 'eth_chainId' })
            .then(chainId => setState(prev => ({ ...prev, chainId })));
        } else {
          connectWallet();
        }
      })
      .catch(() => {
        connectWallet();
      });
  }, []);

  useEffect(() => {
    if (!state.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setState(prev => ({
        ...prev,
        account: accounts.length > 0 ? accounts[0] : null
      }));
    };

    const handleChainChanged = (chainId) => {
      setState(prev => ({ ...prev, chainId }));
    };

    state.ethereum.on('accountsChanged', handleAccountsChanged);
    state.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      state.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      state.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.ethereum]);

  return (
    <WalletContext.Provider value={[state, setState]}>
      {children}
    </WalletContext.Provider>
  );
};

export default Web3Provider;

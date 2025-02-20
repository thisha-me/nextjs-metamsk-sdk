'use client';
import { useCallback, useContext } from 'react';
import { WalletContext } from '@/providers/Web3Provider';
import { MetaMaskSDK } from '@metamask/sdk';

export const useWallet = () => {
  const [state, setState] = useContext(WalletContext);

  if (!state) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  const connectWallet = useCallback(async () => {
    if (!state.ethereum) {
      setState(prev => ({
        ...prev,
        error: 'Please install MetaMask'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      const accounts = await state.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const chainId = await state.ethereum.request({
        method: 'eth_chainId'
      });

      setState(prev => ({
        ...prev,
        account: accounts[0],
        chainId,
        isConnecting: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isConnecting: false
      }));
    }
  }, [state.ethereum, setState]);

  const disconnectWallet = useCallback(async() => {
    if (!state.sdk) {
      throw new Error('MetaMask SDK not initialized');
    }
    // Use the shared SDK instance
    await state.sdk.terminate();

    setState(prev => ({
      ...prev,
      account: null,
      chainId: null
    }));
  }, [setState]);

  // Additional utility functions
  const switchNetwork = useCallback(async (chainId) => {
    try {
      await state.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.ethereum, setState]);

  return {
    account: state.account,
    chainId: state.chainId,
    isConnecting: state.isConnecting,
    error: state.error,
    ethereum: state.ethereum,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AuctionABI from '../contracts/MeetingAuction.json';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkId, setNetworkId] = useState(null);

  const contractAddress = process.env.REACT_APP_AUCTION_CONTRACT_ADDRESS;

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          await initializeWeb3(provider);
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await initializeWeb3(provider);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const initializeWeb3 = async (web3Provider) => {
    try {
      const signer = web3Provider.getSigner();
      const account = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      
      const contract = new ethers.Contract(
        contractAddress,
        AuctionABI.abi,
        signer
      );

      setProvider(web3Provider);
      setSigner(signer);
      setContract(contract);
      setAccount(account);
      setNetworkId(network.chainId);
      setIsConnected(true);

      return { success: true };
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      return { success: false, error: error.message };
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      return { 
        success: false, 
        error: 'MetaMask not installed. Please install MetaMask to continue.' 
      };
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const result = await initializeWeb3(provider);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setNetworkId(null);
    setIsConnected(false);
  };

  const placeBid = async (auctionId, bidAmount) => {
    if (!contract || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const bidAmountWei = ethers.utils.parseEther(bidAmount.toString());
      const tx = await contract.placeBid(auctionId, { value: bidAmountWei });
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      throw new Error(`Failed to place bid: ${error.message}`);
    }
  };

  const getAuctionDetails = async (auctionId) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const auction = await contract.getAuction(auctionId);
      
      return {
        id: auctionId,
        host: auction.host,
        startBlock: auction.startBlock.toString(),
        endBlock: auction.endBlock.toString(),
        reservePrice: ethers.utils.formatEther(auction.reservePrice),
        highestBid: ethers.utils.formatEther(auction.highestBid),
        highestBidder: auction.highestBidder,
        ended: auction.ended,
        meetingScheduled: auction.meetingScheduled
      };
    } catch (error) {
      throw new Error(`Failed to get auction details: ${error.message}`);
    }
  };

  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  };

  const value = {
    provider,
    signer,
    contract,
    account,
    isConnected,
    networkId,
    connect,
    disconnect,
    placeBid,
    getAuctionDetails,
    signMessage
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

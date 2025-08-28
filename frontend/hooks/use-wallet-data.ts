import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from '@getpara/react-sdk';

interface WalletData {
  balance: string;
  balanceUSD: string;
  transactionCount: number;
  lastTransaction?: string;
  gasUsed: string;
  totalValue: string;
}

// Cache for wallet data to prevent unnecessary API calls
const walletDataCache = new Map<string, { data: WalletData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useWalletData = () => {
  const account = useAccount();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: "0.00",
    balanceUSD: "0.00",
    transactionCount: 0,
    gasUsed: "0",
    totalValue: "0.00"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setLastUpdated(new Date());
  }, []);

  const isLoggedIn = useMemo(() => 
    account.isConnected && account.embedded.wallets?.length && account.embedded.wallets.length > 0,
    [account.isConnected, account.embedded.wallets]
  );

  const walletAddress = useMemo(() => 
    account.embedded.wallets?.[0]?.address,
    [account.embedded.wallets]
  );

  // Check if cached data is still valid
  const getCachedData = useCallback((address: string): WalletData | null => {
    if (!isClient) return null; // Don't access cache during SSR
    const cached = walletDataCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [isClient]);

  // Cache wallet data
  const cacheWalletData = useCallback((address: string, data: WalletData) => {
    if (!isClient) return; // Don't cache during SSR
    walletDataCache.set(address, { data, timestamp: Date.now() });
  }, [isClient]);

  // Fetch real-time wallet data with caching
  const fetchWalletData = useCallback(async (forceRefresh = false) => {
    if (!walletAddress || !isClient) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(walletAddress);
      if (cachedData) {
        setWalletData(cachedData);
        setLastUpdated(new Date());
        return;
      }
    }

    setIsLoading(true);
    try {
      // Use Promise.all to fetch data in parallel
      const [balanceResponse, txResponse, priceResponse] = await Promise.all([
        fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'demo'}`),
        fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=1&sort=desc&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'demo'}`),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      ]);

      const [balanceData, txData, priceData] = await Promise.all([
        balanceResponse.json(),
        txResponse.json(),
        priceResponse.json()
      ]);
      
      const ethPrice = priceData.ethereum?.usd || 0;
      const balanceWei = parseInt(balanceData.result || '0');
      const balanceEth = balanceWei / Math.pow(10, 18);
      const balanceUSD = (balanceEth * ethPrice).toFixed(2);
      
      const newWalletData = {
        balance: balanceEth.toFixed(4),
        balanceUSD,
        transactionCount: parseInt(txData.result?.length || '0'),
        lastTransaction: txData.result?.[0]?.timeStamp,
        gasUsed: "0.000000", // Simplified for performance
        totalValue: balanceUSD
      };

      setWalletData(newWalletData);
      cacheWalletData(walletAddress, newWalletData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, getCachedData, cacheWalletData, isClient]);

  // Auto-refresh wallet data every 60 seconds
  useEffect(() => {
    if (isLoggedIn && walletAddress && isClient) {
      fetchWalletData();
      const interval = setInterval(() => fetchWalletData(), 60000); // 60 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, walletAddress, fetchWalletData, isClient]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (isClient) {
      walletDataCache.clear();
    }
  }, [isClient]);

  return {
    walletData,
    isLoading,
    lastUpdated,
    isLoggedIn,
    walletAddress,
    fetchWalletData,
    clearCache,
    isClient
  };
};

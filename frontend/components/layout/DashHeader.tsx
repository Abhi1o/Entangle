"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useModal, useAccount } from "@getpara/react-sdk";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Wallet, User, Settings, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useCallback, useMemo } from "react";

import Container from "@/components/layout/container";

// Types for wallet data
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

const DashHeader = () => {
  const { openModal } = useModal();
  const account = useAccount();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletData, setWalletData] = useState<WalletData>({
    balance: "0.00",
    balanceUSD: "0.00",
    transactionCount: 0,
    gasUsed: "0",
    totalValue: "0.00"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
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
    const cached = walletDataCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Cache wallet data
  const cacheWalletData = useCallback((address: string, data: WalletData) => {
    walletDataCache.set(address, { data, timestamp: Date.now() });
  }, []);

  // Fetch real-time wallet data with caching
  const fetchWalletData = useCallback(async (forceRefresh = false) => {
    if (!walletAddress) return;

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
      // Don't show toast for every error to reduce UI noise
      if (forceRefresh) {
        toast.error('Failed to fetch wallet data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, getCachedData, cacheWalletData]);

  // Auto-refresh wallet data every 60 seconds (increased from 30)
  useEffect(() => {
    if (isLoggedIn && walletAddress) {
      fetchWalletData();
      const interval = setInterval(() => fetchWalletData(), 60000); // 60 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, walletAddress, fetchWalletData]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchWalletData(true);
    toast.success('Wallet data refreshed!');
  }, [fetchWalletData]);

  const handleDashboardClick = useCallback((e: React.MouseEvent): void => {
    if (!isLoggedIn) {
      e.preventDefault();
      openModal();
    }
  }, [isLoggedIn, openModal]);

  const handleLogout = useCallback(() => {
    try {
      // Clear cache
      walletDataCache.clear();
      
      // Clear all local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any Para-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('para') || key.includes('Para'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast.success('Successfully logged out!');
      
      // Refresh the page to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, []);

  const handleCopyAddress = useCallback(async () => {
    try {
      if (walletAddress) {
        await navigator.clipboard.writeText(walletAddress);
        toast.success('Wallet address copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to copy address');
    }
  }, [walletAddress]);

  const handleViewOnExplorer = useCallback(() => {
    if (walletAddress) {
      window.open(`https://etherscan.io/address/${walletAddress}`, '_blank');
    }
  }, [walletAddress]);

  const handleSettings = useCallback(() => {
    toast.info('Settings page coming soon!');
  }, []);

  const truncateAddress = useCallback((address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const getUserInitials = useCallback(() => {
    if (walletAddress) {
      return walletAddress.slice(2, 4).toUpperCase();
    }
    return 'U';
  }, [walletAddress]);

  const formatTimeAgo = useCallback((timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }, []);

  return (
    <div className="navbar-bg h-[80px] bg-surface-level4 border-b border-border-light rounded-b-[24px]">
      <Container className="h-full">
        <header className="flex items-center justify-between h-full">
          <div>
            <Link href="/">
              <Image
                src="/logos/hero_logo.svg"
                alt="Logo"
                width={30}
                height={30}
                className="h-10"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6 font-[700] font-sans text-high-emphasis">
            <Link
              href="#"
              className="text-lblm hover:text-white transition-colors"
            >
              Wallet
            </Link>
            <Link
              href="/market-place"
              className="text-lblm hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/auctions"
              className="text-lblm hover:text-white transition-colors"
            >
              Auctions
            </Link>
            <Link
              href="/nfts"
              className="text-lblm hover:text-white transition-colors"
            >
              My NFTs
            </Link>
            <Link
              href={isLoggedIn ? "/dashboard" : "#"}
              onClick={handleDashboardClick}
              className="text-lblm hover:text-white transition-colors"
            >
              {isLoggedIn ? "Dashboard" : "Login"}
            </Link>
            
            {/* User Account Display */}
            {isLoggedIn && account.embedded.wallets && account.embedded.wallets.length > 0 && account.embedded.wallets[0]?.address && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2 bg-black/40 hover:bg-black/60 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-black/40 text-white text-xs font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-xs text-gray-300 font-mono">
                        {truncateAddress(account.embedded.wallets?.[0]?.address || '')}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-surface-level2 border border-border-light rounded-3xl">
                  {/* User Info Header */}
                  <div className="p-4 border-b border-border-light">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-black/50 text-white font-bold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium text-white">{account.embedded.email}</span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  

                  {/* Real-time Wallet Balance & Account Details */}
                  <div className="p-4 border-b border-border-light">
                    <div className="space-y-4">
                      {/* Balance Section with Refresh */}
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300">Wallet Balance</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <button
                              onClick={handleRefresh}
                              disabled={isLoading}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <RefreshCw className={`w-3 h-3 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            {isLoading ? '...' : walletData.balance}
                          </span>
                          <span className="text-sm text-gray-400">ETH</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ≈ ${isLoading ? '...' : walletData.balanceUSD} USD
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Real-time Account Details */}
                      <div className="space-y-3">
                        {/* Wallet Details */}
                 
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Wallet Address</span>
                        <span
                          className="text-xs text-gray-400 font-mono cursor-pointer relative group"
                          onClick={async () => {
                            const address = account.embedded.wallets?.[0]?.address || '';
                            if (!address) return;
                            try {
                              await navigator.clipboard.writeText(address);
                              setCopiedAddress(true);
                              setTimeout(() => setCopiedAddress(false), 1200);
                            } catch (e) {
                              // fallback: do nothing
                            }
                          }}
                        >
                          {truncateAddress(account.embedded.wallets?.[0]?.address || '')}
                          <span
                            className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded bg-black/80 text-white text-xs transition-opacity duration-200 pointer-events-none ${
                              copiedAddress ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            Copied!
                          </span>
                        </span>
                      </div>
              
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Total Transactions</span>
                          <span className="text-xs text-gray-400">{isLoading ? '...' : walletData.transactionCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Last Transaction</span>
                          <span className="text-xs text-gray-400">
                            {isLoading ? '...' : (walletData.lastTransaction ? formatTimeAgo(walletData.lastTransaction) : 'Never')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Total Gas Used</span>
                          <span className="text-xs text-gray-400">{isLoading ? '...' : `${walletData.gasUsed} ETH`}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-2">
                    <DropdownMenuItem 
                      onClick={handleSettings}
                      className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-yellow-500 rounded-2xl"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-yellow-500  rounded-2xl"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Address</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleViewOnExplorer}
                      className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-yellow-500  rounded-2xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Etherscan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20  rounded-2xl"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
          <div className="md:hidden">
            {/* Mobile menu button would go here */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-surface-level1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </Button>
          </div>
        </header>
      </Container>
    </div>
  );
};

export default DashHeader;

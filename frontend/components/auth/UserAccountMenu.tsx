"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Wallet, User, Settings, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useLogout, useAccount, useModal } from "@getpara/react-sdk";
import { useWalletData } from "@/hooks/use-wallet-data";
import { useAuth } from "@/hooks/use-auth";

const UserAccountMenu = () => {
  const { openModal, closeModal, isOpen } = useModal();
  const { logout, isPending: isLoggingOut } = useLogout();
  const { walletData, isLoading, lastUpdated, fetchWalletData } = useWalletData();
  const { isLoggedIn, walletAddress } = useAuth();
  const account = useAccount();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleLogout = useCallback(() => {
    try {
      logout(
        { clearPregenWallets: true },
        {
          onSuccess: () => {
            toast.success('Successfully logged out!');
            // Clear any cached data
            localStorage.clear();
            sessionStorage.clear();
            // Refresh the page to clear any remaining state
            window.location.reload();
          },
          onError: (error) => {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
          },
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [logout]);

  const handleCopyAddress = useCallback(async () => {
    try {
      if (walletAddress) {
        await navigator.clipboard.writeText(walletAddress);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 1200);
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

  const handleRefresh = useCallback(() => {
    fetchWalletData(true);
    toast.success('Wallet data refreshed!');
  }, [fetchWalletData]);

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

  if (!isLoggedIn || !walletAddress) {
    return null;
  }

  return (
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
              {truncateAddress(walletAddress)}
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
              <span className="text-sm font-medium text-white">{account.embedded.email || 'User'}</span>
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
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </div>
            </div>

            {/* Real-time Account Details */}
            <div className="space-y-3">
              {/* Wallet Details */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Wallet Address</span>
                <span
                  className="text-xs text-gray-400 font-mono cursor-pointer relative group"
                  onClick={handleCopyAddress}
                >
                  {truncateAddress(walletAddress)}
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
            onClick={() => openModal()}
            className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-yellow-500 rounded-2xl"
          >
            <Settings className="w-4 h-4" />
            <span>profile</span>
          </DropdownMenuItem>
          {isOpen && (
            <div>
              <p>Modal is currently open</p>
              <button onClick={closeModal}>Close Modal</button>
            </div>
          )}
          <DropdownMenuItem 
            onClick={handleCopyAddress}
            className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-yellow-500 rounded-2xl"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleViewOnExplorer}
            className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-yellow-500 rounded-2xl"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Etherscan</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-2xl"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountMenu;

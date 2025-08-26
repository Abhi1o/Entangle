"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useModal, useAccount } from "@getpara/react-sdk";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Wallet, User, Settings, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import Container from "@/components/layout/container";
import { useState } from "react";

const DashHeader = () => {
  const { openModal } = useModal();
  const account = useAccount();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const isLoggedIn = account.isConnected && account.embedded.wallets?.length && account.embedded.wallets.length > 0;

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openModal();
    }
  };

  const handleLogout = () => {
    try {
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
  };

  const handleCopyAddress = async () => {
    try {
      const address = account.embedded.wallets?.[0]?.address;
      if (address) {
        await navigator.clipboard.writeText(address);
        toast.success('Wallet address copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const handleViewOnExplorer = () => {
    const address = account.embedded.wallets?.[0]?.address;
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getUserInitials = () => {
    if (account.embedded.wallets && account.embedded.wallets.length > 0 && account.embedded.wallets[0]?.address) {
      const address = account.embedded.wallets[0].address;
      return address.slice(2, 4).toUpperCase();
    }
    return 'U';
  };

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
                        <p className="text-sm text-gray-300">Connected</p>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Details */}
                  <div className="p-4 border-b border-border-light">
                    <div className="space-y-3">
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
                        <span className="text-sm font-medium text-gray-300">Network</span>
                        <span className="text-xs text-gray-400">Ethereum</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Status</span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Balance & Account Details */}
                  <div className="p-4 border-b border-border-light">
                    <div className="space-y-4">
                      {/* Balance Section */}
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300">Wallet Balance</span>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">0.00</span>
                          <span className="text-sm text-gray-400">ETH</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">≈ $0.00 USD</div>
                      </div>

                      {/* Account Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Account Type</span>
                          <span className="text-xs text-gray-400">Para Embedded</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Created</span>
                          <span className="text-xs text-gray-400">Today</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Transactions</span>
                          <span className="text-xs text-gray-400">0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-2">
                    <DropdownMenuItem 
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-surface-level1 rounded"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Address</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleViewOnExplorer}
                      className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-surface-level1 rounded"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Etherscan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
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

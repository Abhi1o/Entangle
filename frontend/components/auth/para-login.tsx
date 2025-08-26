'use client';

import React, { useState, useEffect } from 'react';
import { ParaWeb } from '@getpara/web-sdk';
import { Environment } from '@getpara/core-sdk';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ChevronDown, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  profileImageUrl?: string;
  walletAddress?: string;
}

export function ParaLogin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [para, setPara] = useState<ParaWeb | null>(null);

  useEffect(() => {
    const initPara = async () => {
      try {
        const paraInstance = new ParaWeb(
          Environment.BETA,
          process.env.NEXT_PUBLIC_PARA_APP_ID || 'your-para-app-id'
        );

        await paraInstance.init();
        setPara(paraInstance);

        // Check if user is already logged in
        const isActive = await paraInstance.isSessionActive();
        if (isActive) {
          const isFullyLoggedIn = await paraInstance.isFullyLoggedIn();
          if (isFullyLoggedIn) {
            const wallets = paraInstance.wallets;
            const firstWallet = Object.values(wallets)[0];
            if (firstWallet) {
              setUser({
                walletAddress: firstWallet.address,
                name: firstWallet.name || 'User',
              });
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Para initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initPara();
  }, []);

  const handleLogin = async () => {
    if (!para) return;

    try {
      // Get OAuth URL for Twitter
      const oauthUrl = await para.getOAuthURL({ method: 'TWITTER' as any });
      
      // Open popup for OAuth
      const popup = window.open(oauthUrl, 'para-oauth', 'width=500,height=600');
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Wait for OAuth response
      const oauthResult = await para.waitForOAuth({ popupWindow: popup });
      
      if (oauthResult.isError) {
        throw new Error('OAuth login failed');
      }

      // Wait for login and setup
      const loginResult = await para.waitForLoginAndSetup({ popupWindow: popup });
      
      if (loginResult.isComplete) {
        // Get user info from wallets
        const wallets = para.wallets;
        const firstWallet = Object.values(wallets)[0];
        if (firstWallet) {
          setUser({
            walletAddress: firstWallet.address,
            name: firstWallet.name || 'User',
            email: oauthResult.email,
          });
          setIsAuthenticated(true);
          toast.success('Successfully logged in with Twitter!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login with Twitter');
    }
  };

  const handleLogout = async () => {
    if (!para) return;

    try {
      // Para doesn't have a direct logout method, so we'll clear the session
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Successfully logged out!');
      
      // Refresh the page to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={handleLogin}
        className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        Login with Para
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
            <AvatarFallback>
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground">
              {user?.walletAddress ? truncateAddress(user.walletAddress) : 'No wallet'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User Info */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {user?.email ? user.email : 'Twitter User'}
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        {user?.walletAddress && (
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Wallet Address</span>
              <span className="text-xs text-muted-foreground font-mono">
                {truncateAddress(user.walletAddress)}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

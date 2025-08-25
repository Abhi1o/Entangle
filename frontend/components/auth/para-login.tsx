'use client';

import React, { useState, useRef } from 'react';
import { 
  useVerifyOAuth, 
  useWaitForLogin, 
  useWaitForWalletCreation, 
  useLogout
} from '@getpara/react-sdk';
import { useAuthState } from '../../hooks/use-auth-state';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ChevronDown, LogOut, Wallet } from 'lucide-react';
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
  const [authState, setAuthState] = useAuthState();
  const popupWindow = useRef<Window | null>(null);

  // Para hooks
  const { verifyOAuth, status: oAuthStatus } = useVerifyOAuth();
  const { waitForLogin, status: loginStatus } = useWaitForLogin();
  const { waitForWalletCreation, status: walletStatus } = useWaitForWalletCreation();
  const { logout, status: logoutStatus } = useLogout();

  const handleTwitterLogin = async () => {
    try {
      verifyOAuth(
        {
          method: 'TWITTER',
          onOAuthPopup: (oAuthPopup) => {
            popupWindow.current = oAuthPopup;
          },
          isCanceled: () => popupWindow.current?.closed || false,
        },
        {
          onSuccess: (authState) => {
            setAuthState(authState);
            
            switch (authState.stage) {
              case 'signup':
                handleSignup(authState);
                break;
              case 'login':
                handleLogin(authState);
                break;
            }
          },
          onError: (error) => {
            console.error('OAuth error:', error);
            toast.error('Failed to login with Twitter');
          },
        }
      );
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login with Twitter');
    }
  };

  const handleSignup = (authState: any) => {
    // For new users, we'll use passkey if supported, otherwise password
    const signupUrl = authState.isPasskeySupported && authState.passkeyUrl 
      ? authState.passkeyUrl 
      : authState.passwordUrl;
    
    if (signupUrl) {
      popupWindow.current = window.open(signupUrl, 'ParaSignup');
      
      waitForWalletCreation(
        {
          isCanceled: () => popupWindow.current?.closed || false,
        },
        {
          onSuccess: (result) => {
            const { walletIds } = result;
            if (walletIds && walletIds.EVM && walletIds.EVM.length > 0) {
              const firstWalletAddress = walletIds.EVM[0];
              setUser({
                walletAddress: firstWalletAddress,
                name: 'User',
                email: authState.auth?.email,
                profileImageUrl: authState.pfpUrl,
                username: authState.username,
              });
              setIsAuthenticated(true);
              toast.success('Successfully signed up with Twitter!');
            }
          },
          onError: (error) => {
            console.error('Wallet creation error:', error);
            toast.error('Failed to create wallet');
          },
        }
      );
    }
  };

  const handleLogin = (authState: any) => {
    // For existing users, we'll use passkey if available, otherwise password
    const loginUrl = authState.passkeyUrl || authState.passwordUrl;
    
    if (loginUrl) {
      popupWindow.current = window.open(loginUrl, 'ParaLogin');
      
      waitForLogin(
        {
          isCanceled: () => popupWindow.current?.closed || false,
        },
        {
          onSuccess: (result) => {
            const { needsWallet } = result;
            
            if (needsWallet) {
              // Create wallet if needed
              waitForWalletCreation(
                {
                  isCanceled: () => popupWindow.current?.closed || false,
                },
                {
                  onSuccess: (walletResult) => {
                    const { walletIds } = walletResult;
                    if (walletIds && walletIds.EVM && walletIds.EVM.length > 0) {
                      const firstWalletAddress = walletIds.EVM[0];
                      setUser({
                        walletAddress: firstWalletAddress,
                        name: 'User',
                        email: authState.auth?.email,
                        profileImageUrl: authState.pfpUrl,
                        username: authState.username,
                      });
                      setIsAuthenticated(true);
                      toast.success('Successfully logged in with Twitter!');
                    }
                  },
                  onError: (error) => {
                    console.error('Wallet creation error:', error);
                    toast.error('Failed to create wallet');
                  },
                }
              );
            } else {
              // User already has wallet
              setUser({
                email: authState.auth?.email,
                profileImageUrl: authState.pfpUrl,
                username: authState.username,
                name: authState.displayName,
              });
              setIsAuthenticated(true);
              toast.success('Successfully logged in with Twitter!');
            }
          },
          onError: (error) => {
            console.error('Login error:', error);
            toast.error('Failed to login');
          },
        }
      );
    }
  };

  const handleLogout = async () => {
    try {
      logout(
        { clearPregenWallets: true },
        {
          onSuccess: () => {
            setUser(null);
            setIsAuthenticated(false);
            setAuthState(undefined);
            toast.success('Successfully logged out!');
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
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isLoading = oAuthStatus === 'pending' || loginStatus === 'pending' || walletStatus === 'pending' || logoutStatus === 'pending';

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
        onClick={handleTwitterLogin}
        disabled={isLoading}
        className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        Login with Twitter
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

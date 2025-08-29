'use client';

import React, { useState, useEffect } from 'react';
import { MeetingAuctionService } from '@/lib/contract';
import { NFTList } from '@/components/nft/NFTList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Gift, Wallet, ExternalLink } from 'lucide-react';

export default function NFTsPage() {
  const [service, setService] = useState<MeetingAuctionService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const initService = async () => {
      try {
        const newService = new MeetingAuctionService('FUJI');
        const initialized = await newService.initialize();
        setService(newService);
        setIsInitialized(initialized);
        setError(null);
        
        if (initialized) {
          // Get current user address
          const provider = newService.getProvider();
          if (provider) {
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            setUserAddress(address);
          }
          
          toast({
            title: "Connected to Avalanche Fuji",
            description: "NFT service initialized successfully",
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize NFT service';
        setError(errorMessage);
        setIsInitialized(false);
        
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    initService();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
            <CardDescription>Failed to connect to the blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Make sure you have MetaMask installed and connected to Avalanche Fuji testnet.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold">MetaMask Network Settings:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Network Name: Avalanche Fuji Testnet</li>
                <li>• RPC URL: https://api.avax-test.network/ext/bc/C/rpc</li>
                <li>• Chain ID: 43113</li>
                <li>• Symbol: AVAX</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isInitialized || !service) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to Avalanche Fuji testnet...</p>
            <p className="text-sm text-gray-500 mt-2">
              Please approve the connection in MetaMask
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold">My Meeting NFTs</h1>
        </div>
        <p className="text-gray-600">
          Manage your meeting access passes from winning auctions
        </p>
      </div>

      <NFTList service={service} userAddress={userAddress} />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>About Meeting NFTs</CardTitle>
            <CardDescription>How meeting access works with NFTs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
                <h3 className="font-semibold mb-2">Win Auction</h3>
                <p className="text-sm text-gray-600">
                  Place the highest bid on a meeting auction
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">2</div>
                <h3 className="font-semibold mb-2">Get NFT</h3>
                <p className="text-sm text-gray-600">
                  Receive a meeting access NFT automatically
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">3</div>
                <h3 className="font-semibold mb-2">Burn to Access</h3>
                <p className="text-sm text-gray-600">
                  Burn your NFT to access the meeting
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Burning an NFT is irreversible - you can only use it once</li>
                <li>• Each NFT grants access to one specific meeting</li>
                <li>• You must burn the NFT to join the meeting</li>
                <li>• Make sure you're ready to attend before burning</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
            <CardDescription>Your deployed smart contract details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Contract Address</p>
                <p className="font-mono text-xs break-all">
                  0xA514E844fe0a671D07d35B2897F6523C09cD9ecC
                </p>
              </div>
              <div>
                <p className="text-gray-500">Network</p>
                <p className="font-semibold">Avalanche Fuji Testnet</p>
              </div>
              <div>
                <p className="text-gray-500">Explorer</p>
                <a 
                  href="https://testnet.snowtrace.io/address/0xA514E844fe0a671D07d35B2897F6523C09cD9ecC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View on Snowtrace
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <p className="text-gray-500">Chain ID</p>
                <p className="font-semibold">43113</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

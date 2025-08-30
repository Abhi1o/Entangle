'use client';

import React, { useState, useEffect } from 'react';
import { MeetingAuctionService } from '@/lib/contract';
import { AuctionList } from '@/components/auction/AuctionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AuctionsPage() {
  const [service, setService] = useState<MeetingAuctionService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          toast({
            title: "Connected to Avalanche Fuji",
            description: "Contract service initialized successfully",
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize contract service';
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
        <h1 className="text-3xl font-bold mb-2">Meeting Auctions</h1>
        <p className="text-gray-600">
          Bid on exclusive meetings with industry leaders and experts
        </p>
      </div>

      <AuctionList service={service} />

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
                                     0xceBD87246e91C7D70C82D5aE5C196a0028543933
                </p>
              </div>
              <div>
                <p className="text-gray-500">Network</p>
                <p className="font-semibold">Avalanche Fuji Testnet</p>
              </div>
              <div>
                <p className="text-gray-500">Explorer</p>
                <a 
                  href="https://testnet.snowtrace.io/address/0xceBD87246e91C7D70C82D5aE5C196a0028543933"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Snowtrace
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

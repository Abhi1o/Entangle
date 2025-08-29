'use client';

import React, { useState, useEffect } from 'react';
import { MeetingAuctionService } from '@/lib/contract';
import { MeetingNFT } from './MeetingNFT';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, RefreshCw, Gift } from 'lucide-react';

interface NFTListProps {
  service: MeetingAuctionService;
  userAddress?: string;
}

export const NFTList: React.FC<NFTListProps> = ({ service, userAddress }) => {
  const [nfts, setNfts] = useState<{ tokenIds: number[]; auctionIds: number[] }>({ tokenIds: [], auctionIds: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userAddress) {
      loadUserNFTs();
    }
  }, [userAddress]);

  const loadUserNFTs = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      const userNFTs = await service.getNFTsOwnedByUser(userAddress);
      setNfts(userNFTs);
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      toast({
        title: "Error",
        description: "Failed to load your meeting NFTs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserNFTs();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Your NFT list has been updated",
    });
  };

  const handleNFTBurn = () => {
    // Refresh the list when an NFT is burned
    loadUserNFTs();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-orange-500" />
              <div>
                <CardTitle>My Meeting NFTs</CardTitle>
                <CardDescription>
                  Your meeting access passes from winning auctions
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Wallet className="h-4 w-4" />
            <span>Connected: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</span>
          </div>
        </CardContent>
      </Card>

      {/* NFT Grid */}
      {nfts.tokenIds.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Meeting NFTs Found</h3>
            <p className="text-gray-500 mb-4">
              You don't have any meeting NFTs yet. Win an auction to get your first meeting pass!
            </p>
            <Button 
              onClick={() => window.location.href = '/auctions'}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Browse Auctions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.tokenIds.map((tokenId, index) => (
            <MeetingNFT
              key={tokenId}
              tokenId={tokenId}
              service={service}
              onBurn={handleNFTBurn}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {nfts.tokenIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-600">{nfts.tokenIds.length}</p>
                <p className="text-sm text-gray-500">Total NFTs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{nfts.tokenIds.length}</p>
                <p className="text-sm text-gray-500">Active Passes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{nfts.auctionIds.length}</p>
                <p className="text-sm text-gray-500">Auctions Won</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

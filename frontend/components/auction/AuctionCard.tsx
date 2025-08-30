'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MeetingAuctionService } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AuctionCardProps {
  auctionId: number;
  service: MeetingAuctionService;
  onUpdate?: () => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auctionId, service, onUpdate }) => {
  const [auction, setAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingReturn, setPendingReturn] = useState('0');
  const [currentUser, setCurrentUser] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadAuction();
    getCurrentUser();
  }, [auctionId]);

  const getCurrentUser = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts && accounts.length > 0) {
          setCurrentUser(accounts[0]);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    }
  };

  const loadAuction = async () => {
    try {
      const auctionData = await service.getAuction(auctionId);
      setAuction(auctionData);
      
      // Get pending return for current user
      if (currentUser) {
        const pending = await service.getPendingReturn(auctionId, currentUser);
        setPendingReturn(ethers.utils.formatEther(pending));
      }
    } catch (error) {
      console.error('Error loading auction:', error);
    }
  };

  const placeBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast({
        title: "Invalid bid amount",
        description: "Please enter a valid bid amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Direct contract call - user signs transaction
      const tx = await service.placeBid(auctionId, bidAmount);
      toast({
        title: "Bid placed successfully!",
        description: `Transaction: ${tx.transactionHash}`,
      });
      setBidAmount('');
      loadAuction();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Bid failed",
        description: error.message || "Failed to place bid",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const withdrawBid = async () => {
    setLoading(true);
    try {
      const tx = await service.withdrawBid(auctionId);
      toast({
        title: "Withdrawal successful!",
        description: `Transaction: ${tx.transactionHash}`,
      });
      loadAuction();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to withdraw bid",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const endAuction = async () => {
    setLoading(true);
    try {
      // Direct contract call - host signs transaction
      const tx = await service.endAuction(auctionId);
      toast({
        title: "Auction ended successfully!",
        description: `Transaction: ${tx.transactionHash}`,
      });
      loadAuction();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Failed to end auction",
        description: error.message || "Failed to end auction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!auction) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentBlock = Math.floor(Date.now() / 1000); // Approximate
  const isActive = !auction.ended && currentBlock < auction.endBlock.toNumber();
  const currentBid = ethers.utils.formatEther(auction.highestBid);
  const reservePrice = ethers.utils.formatEther(auction.reservePrice);
  const isHost = currentUser.toLowerCase() === auction.host.toLowerCase();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Auction #{auctionId}</span>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Ended"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Host: {auction.host.slice(0, 6)}...{auction.host.slice(-4)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Reserve Price</p>
            <p className="font-semibold">{reservePrice} AVAX</p>
          </div>
          <div>
            <p className="text-gray-500">Current Bid</p>
            <p className="font-semibold">{currentBid} AVAX</p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-semibold">{auction.duration.toString()} min</p>
          </div>
          <div>
            <p className="text-gray-500">Twitter ID</p>
            <p className="font-semibold">{auction.hostTwitterId}</p>
          </div>
        </div>

        {isActive && !isHost && (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Bid amount (AVAX)"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            <Button 
              onClick={placeBid} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Placing Bid..." : "Place Bid"}
            </Button>
          </div>
        )}

        {parseFloat(pendingReturn) > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Pending return: {pendingReturn} AVAX
            </p>
            <Button 
              onClick={withdrawBid} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Withdrawing..." : "Withdraw Bid"}
            </Button>
          </div>
        )}

        {isActive && isHost && (
          <Button 
            onClick={endAuction} 
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? "Ending..." : "End Auction"}
          </Button>
        )}

        {!isActive && auction.highestBidder !== ethers.constants.AddressZero && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-green-800">
              Winner: {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
            </p>
            <p className="text-sm text-green-600">
              Winning bid: {currentBid} AVAX
            </p>
            {auction.nftTokenId && auction.nftTokenId.toNumber() > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-800 font-semibold">
                  🎫 NFT Token ID: #{auction.nftTokenId.toString()}
                </p>
                <p className="text-xs text-blue-600">
                  Meeting access NFT has been minted
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

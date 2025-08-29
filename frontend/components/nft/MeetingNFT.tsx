'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MeetingAuctionService } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, ExternalLink, Flame } from 'lucide-react';

interface MeetingNFTProps {
  tokenId: number;
  service: MeetingAuctionService;
  onBurn?: () => void;
}

export const MeetingNFT: React.FC<MeetingNFTProps> = ({ tokenId, service, onBurn }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [burning, setBurning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNFTMetadata();
  }, [tokenId]);

  const loadNFTMetadata = async () => {
    try {
      setLoading(true);
      const nftData = await service.getNFTMetadata(tokenId);
      setMetadata(nftData);
    } catch (error) {
      console.error('Error loading NFT metadata:', error);
      toast({
        title: "Error",
        description: "Failed to load NFT metadata",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const burnNFTForMeeting = async () => {
    setBurning(true);
    try {
      // First validate with backend
      const validationResponse = await fetch(`/api/meetings/nft/${tokenId}/burn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: await service.getProvider()?.getSigner().getAddress()
        }),
      });
      
      const validationResult = await validationResponse.json();
      
      if (!validationResult.success) {
        throw new Error(validationResult.error);
      }
      
      // If validation passes, burn NFT on blockchain
      const tx = await service.burnNFTForMeeting(tokenId);
      toast({
        title: "NFT Burned Successfully!",
        description: `Meeting access granted. Transaction: ${tx.transactionHash}`,
      });
      onBurn?.();
    } catch (error: any) {
      toast({
        title: "Failed to burn NFT",
        description: error.message || "Failed to access meeting",
        variant: "destructive"
      });
    } finally {
      setBurning(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Failed to load NFT metadata</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Meeting Pass #{tokenId}
          </CardTitle>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Active
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <User className="h-4 w-4" />
          Host: {metadata.host.slice(0, 6)}...{metadata.host.slice(-4)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Auction ID
            </p>
            <p className="font-semibold">#{metadata.auctionId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Duration
            </p>
            <p className="font-semibold">{formatDuration(metadata.meetingDuration)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Twitter ID</p>
            <p className="font-semibold">@{metadata.hostTwitterId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Minted</p>
            <p className="font-semibold">{formatDate(metadata.mintTimestamp)}</p>
          </div>
        </div>

        {metadata.meetingMetadataIPFS && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Meeting Details</p>
            <p className="text-sm font-mono break-all">
              {metadata.meetingMetadataIPFS}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={burnNFTForMeeting} 
            disabled={burning}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {burning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Accessing Meeting...
              </>
            ) : (
              <>
                <Flame className="h-4 w-4 mr-2" />
                Access Meeting (Burn NFT)
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>⚠️ Burning this NFT will grant you access to the meeting</p>
            <p>This action cannot be undone</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

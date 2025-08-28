'use client';

import React, { useState, useEffect } from 'react';
import { MeetingAuctionService } from '@/lib/contract';
import { AuctionCard } from './AuctionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AuctionListProps {
  service: MeetingAuctionService;
}

export const AuctionList: React.FC<AuctionListProps> = ({ service }) => {
  const [auctions, setAuctions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAuctions();
    loadStats();
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const activeAuctions = await service.getActiveAuctions();
      setAuctions(activeAuctions.map((id: any) => id.toNumber()));
    } catch (error) {
      console.error('Error loading auctions:', error);
      toast({
        title: "Error",
        description: "Failed to load auctions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const contractStats = await service.getContractStats();
      setStats(contractStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const refreshData = () => {
    loadAuctions();
    loadStats();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Statistics</CardTitle>
            <CardDescription>Overview of the meeting auction platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.auctionCounter}</p>
                <p className="text-sm text-gray-500">Total Auctions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{auctions.length}</p>
                <p className="text-sm text-gray-500">Active Auctions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.platformFee / 100}%</p>
                <p className="text-sm text-gray-500">Platform Fee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Auctions</h2>
        <Button onClick={refreshData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Auctions Grid */}
      {auctions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No active auctions found</p>
            <p className="text-sm text-gray-400 mt-2">
              Check back later or create a new auction
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auctionId) => (
            <AuctionCard
              key={auctionId}
              auctionId={auctionId}
              service={service}
              onUpdate={refreshData}
            />
          ))}
        </div>
      )}
    </div>
  );
};
